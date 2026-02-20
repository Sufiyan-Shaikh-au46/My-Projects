import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [users, setUsers] = useState([]);
  const socket = useRef();
  const { user } = useAuth();

  useEffect(() => {
    socket.current = io('http://localhost:5000');
  }, []);

  useEffect(() => {
    if (user) {
      socket.current.emit('join', user._id);
    }
  }, [user]);

  useEffect(() => {
    socket.current.on('onlineUsers', (data) => {
      setOnlineUsers(data);
    });
  }, []);

  useEffect(() => {
    socket.current.on('receiveMessage', (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        image: data.image,
        conversationId: data.conversationId,
        createdAt: data.createdAt
      });
    });
  }, []);

  useEffect(() => {
    if (arrivalMessage && currentConversation) {
      if (arrivalMessage.conversationId === currentConversation._id) {
        setMessages((prev) => [...prev, arrivalMessage]);
      }
    }
  }, [arrivalMessage, currentConversation]);

  // Get all users
  useEffect(() => {
    const getUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/all');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    getUsers();
  }, []);

  // Get conversations
  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/conversations');
        setConversations(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (user) {
      getConversations();
    }
  }, [user]);

  // Get messages
  useEffect(() => {
    const getMessages = async () => {
      if (!currentConversation) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${currentConversation._id}`);
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    getMessages();
  }, [currentConversation]);

  const sendMessage = async (text, image = null) => {
    if (!currentConversation) return;
    
    const message = {
      conversationId: currentConversation._id,
      text,
      image
    };

    try {
      const res = await axios.post('http://localhost:5000/api/messages', message);
      
      socket.current.emit('sendMessage', {
        senderId: user._id,
        receiverId: currentConversation.members.find(m => m._id !== user._id)?._id || currentConversation.members.find(m => m !== user._id),
        text,
        image,
        conversationId: currentConversation._id
      });

      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const createConversation = async (receiverId) => {
    try {
      const res = await axios.post('http://localhost:5000/api/conversations', { receiverId });
      setConversations([res.data, ...conversations]);
      return res.data;
    } catch (err) {
      console.error(err);
    }
  };

  const createGroup = async (groupName, members) => {
    try {
      const res = await axios.post('http://localhost:5000/api/conversations', {
        groupName,
        members: [user._id, ...members],
        isGroup: true,
        groupAdmin: user._id
      });
      setConversations([res.data, ...conversations]);
      return res.data;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversation,
      setCurrentConversation,
      messages,
      sendMessage,
      newMessage,
      setNewMessage,
      createConversation,
      createGroup,
      users,
      onlineUsers,
      socket
    }}>
      {children}
    </ChatContext.Provider>
  );
};
