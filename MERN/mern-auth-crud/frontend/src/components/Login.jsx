// src/components/Login.jsx
import { useState, useContext } from "react";
import api from "../axiosSetup.jsx";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import "./Form.css";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const submit = async () => {
    setError("");
    try {
      await api.post("/auth/login", form);
      login();
      navigate("/dashboard");
    } catch (err) {
      setError(err.normalizedMessage || "Failed to login");
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
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
      <button onClick={submit}>Login</button>
    </div>
  );
}
