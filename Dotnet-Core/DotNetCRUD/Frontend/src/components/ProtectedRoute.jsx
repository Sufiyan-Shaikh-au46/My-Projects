// src/components/ProtectedRoute.js
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { auth } = useContext(AuthContext);
  if (!auth) return <Navigate to="/login" replace />;
  return children;
}