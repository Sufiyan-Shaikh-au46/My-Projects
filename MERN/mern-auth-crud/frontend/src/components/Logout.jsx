// src/components/Logout.js
import { useNavigate } from 'react-router-dom';
import api from '../axiosSetup.jsx';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

export default function Logout() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await api.post('/auth/logout');
    logout();
    navigate('/login');
  };

  return <button onClick={handleLogout}>Logout</button>;
}