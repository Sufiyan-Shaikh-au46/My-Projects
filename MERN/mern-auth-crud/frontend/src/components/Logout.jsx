// src/components/Logout.jsx
import { useNavigate } from "react-router-dom";
import api from "../axiosSetup.jsx";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Logout() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setError("");
    try {
      await api.post("/auth/logout");
      logout();
      navigate("/login");
    } catch (err) {
      setError(err.normalizedMessage || "Failed to logout");
    }
  };

  return (
    <div>
      {error && <p className="error-text">{error}</p>}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
