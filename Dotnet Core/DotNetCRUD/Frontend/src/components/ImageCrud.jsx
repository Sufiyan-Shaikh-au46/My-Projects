// src/components/ImageCrud.jsx
import { useEffect, useState } from "react";
import api from "../axiosSetup.jsx";
import "./Dashboard.css";

export default function ImageCrud() {
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    title: "",
    file: null,
    description: "",
  });
  const [error, setError] = useState("");

  const loadImages = async () => {
    setError("");
    try {
      const res = await api.get("/images");
      setImages(res.data?.data || []);
    } catch (err) {
      setError(err.normalizedMessage || "Failed to load images");
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const addImage = async () => {
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      if (form.file) {
        formData.append("image", form.file);
      }
      const res = await api.post("/images/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newImage = res.data?.data || res.data;
      setImages([newImage, ...images]);
      setForm({ title: "", file: null, description: "" });
    } catch (err) {
      setError(err.normalizedMessage || "Failed to add image");
    }
  };

  const deleteImage = async (id) => {
    setError("");
    try {
      await api.delete(`/images/${id}`);
      setImages(images.filter((img) => img._id !== id));
    } catch (err) {
      setError(err.normalizedMessage || "Failed to delete image");
    }
  };

  const updateImage = async (id) => {
    setError("");
    try {
      const res = await api.put(`/images/${id}`, {
        title: "Updated image",
        description: "Updated image description",
      });
      const updated = res.data?.data || res.data;
      setImages(images.map((img) => (img._id === id ? updated : img)));
    } catch (err) {
      setError(err.normalizedMessage || "Failed to update image");
    }
  };

  const downloadImage = (url, title) => {
    const link = document.createElement("a");
    link.href = `${api.defaults.baseURL}${url}`;
    link.download = title || "image";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="image-crud">
      <h3>Image CRUD</h3>
      {error && <p className="error-text">{error}</p>}

      <div className="image-form">
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />
        <button onClick={addImage}>Add Image</button>
      </div>

      <div className="image-grid">
        {images.map((img) => (
          <div key={img._id} className="image-card">
            <img src={img.url} alt={img.title} />
            <div className="image-info">
              <strong>{img.title}</strong>
              <p>{img.description}</p>
            </div>
            <div className="image-actions">
              <button onClick={() => updateImage(img._id)}>Update</button>
              <button onClick={() => deleteImage(img._id)}>Delete</button>
              <button onClick={() => downloadImage(img.url, img.title)}>Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

