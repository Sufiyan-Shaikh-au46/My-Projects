// src/components/Dashboard.js
import { useState, useEffect } from 'react';
import api from '../axiosSetup.jsx';
import Logout from './Logout.jsx';
import './Dashboard.css';

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });

  useEffect(() => {
    api.get('/dashboard').then(res => setItems(res.data));
  }, []);

  const addItem = async () => {
    const res = await api.post('/dashboard', form);
    setItems([...items, res.data]);
    setForm({ title: '', description: '' });
  };

  const deleteItem = async (id) => {
    await api.delete(`/dashboard/${id}`);
    setItems(items.filter(i => i._id !== id));
  };

  const updateItem = async (id) => {
    const res = await api.put(`/dashboard/${id}`, { title: 'Updated', description: 'Updated desc' });
    setItems(items.map(i => i._id === id ? res.data : i));
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <Logout />
      <div className="form-inline">
        <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <button onClick={addItem}>Add</button>
      </div>

      <ul className="item-list">
        {items.map(i => (
          <li key={i._id}>
            <strong>{i.title}</strong>: {i.description}
            <button onClick={() => updateItem(i._id)}>Update</button>
            <button onClick={() => deleteItem(i._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}