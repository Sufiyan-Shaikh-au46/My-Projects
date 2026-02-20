# WhatsApp Clone - MERN Stack

A full-featured WhatsApp-like messaging application built with MongoDB, Express.js, React, and Node.js.

## Features

- User authentication (Register/Login)
- Real-time messaging using Socket.io
- One-on-one chat
- Group chat
- Online status indicators
- Message timestamps
- Responsive design (WhatsApp-like UI)

## Project Structure

```
whatsapp-clone/
├── backend/
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── conversationController.js
│   │   ├── messageController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js        # JWT authentication
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── conversationRoutes.js
│   │   ├── messageRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ChatContext.jsx
    │   ├── pages/
    │   │   ├── Chat.jsx
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   └── axiosSetup.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### Backend Setup

1. Navigate to the backend directory:
   
```
bash
   cd whatsapp-clone/backend
   
```

2. Install dependencies:
   
```
bash
   npm install
   
```

3. Configure environment variables:
   - Edit the `.env` file with your MongoDB URI and JWT secret

4. Start the backend server:
   
```
bash
   npm run dev
   # or
   node server.js
   
```

   The server will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   
```
bash
   cd whatsapp-clone/frontend
   
```

2. Install dependencies:
   
```
bash
   npm install
   
```

3. Start the development server:
   
```
bash
   npm run dev
   
```

   The app will run on http://localhost:5173

## API Endpoints

### Auth Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/user` - Get current user

### User Routes
- `GET /api/users/all` - Get all users
- `GET /api/users/:id` - Get user by ID

### Conversation Routes
- `GET /api/conversations` - Get user's conversations
- `POST /api/conversations` - Create new conversation
- `PUT /api/conversations/:id` - Update conversation

### Message Routes
- `GET /api/messages/:conversationId` - Get messages for a conversation
- `POST /api/messages` - Send new message

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io for real-time communication
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React
- React Router DOM
- Socket.io-client
- Axios
- React Icons
- Vite

## Screenshots

The app features a WhatsApp-like interface with:
- Login/Registration pages
- Home page with conversation list
- Chat page with message bubbles
- Real-time message updates
- Online status indicators

## License

MIT
