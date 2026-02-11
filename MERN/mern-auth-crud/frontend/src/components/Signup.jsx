// src/components/Signup.jsx
import { useState } from "react";
import api from "../axiosSetup.jsx";
import "./Form.css";

export default function Signup() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    setMessage("");
    try {
      const res = await api.post("/auth/signup", form);
      setMessage(res.data?.message || "Registered successfully!");
    } catch (err) {
      setError(err.normalizedMessage || "Failed to register");
    }
  };

  return (
    <div className="form-container">
      <h2>Signup</h2>
      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}
      <input
        placeholder="Username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button onClick={submit}>Signup</button>
    </div>
  );
}
