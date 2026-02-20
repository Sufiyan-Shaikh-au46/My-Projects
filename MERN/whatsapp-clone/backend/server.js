const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const connectDB = require('./config/db');
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/conversations', require('./routes/conversationRoutes'));

// Socket.io connection
let onlineUsers = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    if (!onlineUsers.find(user => user.userId === userId)) {
      onlineUsers.push({ userId, socketId: socket.id });
    }
    io.emit('onlineUsers', onlineUsers);
  });

  socket.on('sendMessage', ({ senderId, receiverId, text, image, conversationId }) => {
    const receiver = onlineUsers.find(user => user.userId === receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit('receiveMessage', {
        senderId,
        text,
        image,
        conversationId,
        createdAt: new Date()
      });
    }
  });

  socket.on('typing', ({ receiverId, senderId }) => {
    const receiver = onlineUsers.find(user => user.userId === receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit('typing', { senderId });
    }
  });

  socket.on('disconnect', () => {
    onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
    io.emit('onlineUsers', onlineUsers);
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { io };
