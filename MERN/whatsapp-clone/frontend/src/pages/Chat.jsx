import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { FaArrowLeft, FaPaperPlane, FaImage } from 'react-icons/fa';

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    conversations, 
    currentConversation, 
    setCurrentConversation, 
    messages, 
    sendMessage, 
    newMessage, 
    setNewMessage 
  } = useChat();
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const conversation = conversations.find(c => c._id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  }, [conversationId, conversations, setCurrentConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getOtherMember = (members) => {
    if (!members) return null;
    const other = members.find(m => (m._id || m) !== user._id);
    return other || members[0];
  };

  const getConversationName = () => {
    if (!currentConversation) return '';
    if (currentConversation.isGroup) {
      return currentConversation.groupName;
    }
    const member = getOtherMember(currentConversation.members);
    return member?.username || member?.email || 'Unknown';
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    }
    return d.toLocaleDateString();
  };

  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  if (!currentConversation) {
    return (
      <div className="chat-area">
        <div className="empty-chat">
          <div className="empty-chat-content">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={() => navigate('/')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
            >
              <FaArrowLeft />
            </button>
            <h3>WhatsApp</h3>
          </div>
        </div>
        
        <div className="conversation-list">
          {conversations.map(conv => (
            <div 
              key={conv._id}
              className={`conversation-item ${conv._id === currentConversation?._id ? 'active' : ''}`}
              onClick={() => navigate(`/chat/${conv._id}`)}
            >
              <div style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: '50%', 
                background: '#008069',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                marginRight: '15px',
                fontSize: '20px'
              }}>
                {conv.isGroup ? conv.groupName[0].toUpperCase() : getOtherMember(conv.members)?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="conversation-info">
                <div className="conversation-name">
                  {conv.isGroup ? conv.groupName : getOtherMember(conv.members)?.username || 'Unknown'}
                </div>
                <div className="last-message">
                  {conv.isGroup ? 'Group chat' : 'Click to chat'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {/* Chat Header */}
        <div className="chat-header">
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: '#008069',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            marginRight: '15px'
          }}>
            {getConversationName()[0].toUpperCase()}
          </div>
          <div className="chat-header-info">
            <div className="chat-header-name">{getConversationName()}</div>
            <div className="chat-header-status">
              {currentConversation.isGroup 
                ? `${currentConversation.members.length} members` 
                : 'Online'}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div style={{ 
                textAlign: 'center', 
                margin: '20px 0',
                color: '#667781',
                fontSize: '12px'
              }}>
                {date}
              </div>
              {msgs.map((msg, index) => (
                <div 
                  key={msg._id || index}
                  className={`message ${(msg.sender === user._id || msg.sender?._id === user._id) ? 'sent' : 'received'}`}
                >
                  {msg.image && (
                    <img 
                      src={msg.image} 
                      alt="attachment" 
                      className="message-image"
                    />
                  )}
                  {msg.text && <div className="message-text">{msg.text}</div>}
                  <span className="message-time">{formatTime(msg.createdAt)}</span>
                </div>
              ))}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form className="chat-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button type="submit" disabled={!newMessage.trim()}>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
