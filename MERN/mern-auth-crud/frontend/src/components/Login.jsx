// src/components/Login.js
import { useState, useContext } from 'react';
import api from '../axiosSetup.jsx';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import './Form.css';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const submit = async () => {
    await api.post('/auth/login', form);
    login();
    navigate('/dashboard');
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <input placeholder="Username" onChange={e => setForm({ ...form, username: e.target.value })} />
      <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
      <button onClick={submit}>Login</button>
    </div>
  );
}