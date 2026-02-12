// src/context/AuthContext.js
import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axiosSetup.jsx';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get('/auth/me');
        setAuth(true);
      } catch (err) {
        setAuth(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = () => {
    setAuth(true);
    navigate('/dashboard');
  };

  const logout = () => {
    setAuth(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
