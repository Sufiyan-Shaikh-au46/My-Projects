// src/components/Signup.js
import { useState } from 'react';
import api from '../axiosSetup.jsx';
import './Form.css';

export default function Signup() {
  const [form, setForm] = useState({ username: '', password: '' });

  const submit = async () => {
    await api.post('/auth/signup', form);
    alert('Registered!');
  };

  return (
    <div className="form-container">
      <h2>Signup</h2>
      <input placeholder="Username" onChange={e => setForm({ ...form, username: e.target.value })} />
      <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
      <button onClick={submit}>Signup</button>
    </div>
  );
}