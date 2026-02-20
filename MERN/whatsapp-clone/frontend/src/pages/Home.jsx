import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { FaSearch, FaComment, FaUserPlus, FaLogout } from 'react-icons/fa';

const Home = () => {
  const { user, logout } = useAuth();
  const { conversations, users, onlineUsers, createConversation } = useChat();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getOtherMember = (members) => {
    if (!members) return null;
    const other = members.find(m => (m._id || m) !== user._id);
    return other || members[0];
  };

  const getConversationName = (conversation) => {
    if (conversation.isGroup) {
      return conversation.groupName;
    }
    const member = getOtherMember(conversation.members);
    return member?.username || member?.email || 'Unknown';
  };

  const getConversationAvatar = (conversation) => {
    if (conversation.isGroup) {
      return null;
    }
    const member = getOtherMember(conversation.members);
    return member?.avatar || null;
  };

  const isUserOnline = (memberId) => {
    const id = memberId._id || memberId;
    return onlineUsers.includes(id);
  };

  const filteredConversations = conversations.filter(conv => {
    const name = getConversationName(conv).toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const filteredUsers = users.filter(u => 
    u._id !== user._id && 
    !conversations.some(conv => 
      !conv.isGroup && conv.members.some(m => (m._id || m) === u._id)
    )
  );

  const handleNewChat = async (userId) => {
    const conversation = await createConversation(userId);
    if (conversation) {
      navigate(`/chat/${conversation._id}`);
    }
    setShowNewChat(false);
  };

  return (
    <div className="home-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h3>WhatsApp</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setShowNewChat(!showNewChat)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                title="New Chat"
              >
                <FaUserPlus />
              </button>
              <button 
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#c62828' }}
                title="Logout"
              >
                <FaLogout />
              </button>
            </div>
          </div>
          
          <div className="search-box">
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="search-icon" />
          </div>
        </div>

        {/* New Chat Dropdown */}
        {showNewChat && (
          <div style={{ padding: '10px', borderBottom: '1px solid #ddd', maxHeight: '200px', overflowY: 'auto' }}>
            <h4 style={{ marginBottom: '10px' }}>New Chat</h4>
            {filteredUsers.length === 0 ? (
              <p style={{ color: '#667781', fontSize: '14px' }}>No users available</p>
            ) : (
              filteredUsers.map(u => (
                <div 
                  key={u._id}
                  onClick={() => handleNewChat(u._id)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '10px', 
                    cursor: 'pointer',
                    borderRadius: '8px',
                    ':hover': { background: '#f5f6f6' }
                  }}
                >
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: '#008069',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    marginRight: '10px'
                  }}>
                    {u.username[0].toUpperCase()}
                  </div>
                  <span>{u.username}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Conversation List */}
        <div className="conversation-list">
          {filteredConversations.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#667781' }}>
              <FaComment size={40} style={{ marginBottom: '10px' }} />
              <p>No conversations yet</p>
              <p>Start a new chat!</p>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <div 
                key={conv._id}
                className="conversation-item"
                onClick={() => navigate(`/chat/${conv._id}`)}
              >
                {getConversationAvatar(conv) ? (
                  <img 
                    src={getConversationAvatar(conv)} 
                    alt="avatar" 
                    className="avatar" 
                  />
                ) : (
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
                    {getConversationName(conv)[0].toUpperCase()}
                  </div>
                )}
                <div className="conversation-info">
                  <div className="conversation-name">
                    {getConversationName(conv)}
                    {!conv.isGroup && isUserOnline(getOtherMember(conv.members)?._id) && (
                      <span style={{ 
                        display: 'inline-block', 
                        width: '8px', 
                        height: '8px', 
                        background: '#25D366', 
                        borderRadius: '50%', 
                        marginLeft: '5px' 
                      }}></span>
                    )}
                  </div>
                  <div className="last-message">
                    {conv.isGroup ? 'Group chat' : 'Click to start chatting'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        <div className="empty-chat">
          <div className="empty-chat-content">
            <h2>WhatsApp Clone</h2>
            <p>Send and receive messages without keeping your phone online.</p>
            <p>Use WhatsApp on up to 4 linked devices and 1 phone.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
