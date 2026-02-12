// src/components/Dashboard.jsx
import { useState, useEffect } from "react";
import api from "../axiosSetup.jsx";
import Logout from "./Logout.jsx";
import ImageCrud from "./ImageCrud.jsx";
import FileCrud from "./FileCrud.jsx";
import "./Dashboard.css";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("items");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const loadItems = async () => {
      try {
        const res = await api.get("/dashboard");
        // Backend now returns { success, data }
        setItems(res.data?.data || []);
      } catch (err) {
        setError(err.normalizedMessage || "Failed to load items");
      }
    };

    loadItems();
  }, []);

  const addItem = async () => {
    setError("");
    try {
      const res = await api.post("/dashboard", form);
      const newItem = res.data?.data || res.data;
      setItems([...items, newItem]);
      setForm({ title: "", description: "" });
    } catch (err) {
      setError(err.normalizedMessage || "Failed to add item");
    }
  };

  const deleteItem = async (id) => {
    setError("");
    try {
      await api.delete(`/dashboard/${id}`);
      setItems(items.filter((i) => i._id !== id));
    } catch (err) {
      setError(err.normalizedMessage || "Failed to delete item");
    }
  };

  const updateItem = async (id) => {
    setError("");
    try {
      const res = await api.put(`/dashboard/${id}`, {
        title: "Updated",
        description: "Updated desc",
      });
      const updatedItem = res.data?.data || res.data;
      setItems(items.map((i) => (i._id === id ? updatedItem : i)));
    } catch (err) {
      setError(err.normalizedMessage || "Failed to update item");
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <Logout />

      <div className="tabs">
        <button
          className={activeTab === "items" ? "active" : ""}
          onClick={() => setActiveTab("items")}
        >
          Items CRUD
        </button>
        <button
          className={activeTab === "images" ? "active" : ""}
          onClick={() => setActiveTab("images")}
        >
          Image CRUD
        </button>
        <button
          className={activeTab === "files" ? "active" : ""}
          onClick={() => setActiveTab("files")}
        >
          File CRUD
        </button>
      </div>

      {activeTab === "items" && (
        <>
          {error && <p className="error-text">{error}</p>}
          <div className="form-inline">
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <button onClick={addItem}>Add</button>
          </div>

          <ul className="item-list">
            {items.map((i) => (
              <li key={i._id}>
                <strong>{i.title}</strong>: {i.description}
                <button onClick={() => updateItem(i._id)}>Update</button>
                <button onClick={() => deleteItem(i._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}

      {activeTab === "images" && <ImageCrud />}
      {activeTab === "files" && <FileCrud />}
    </div>
  );
}

