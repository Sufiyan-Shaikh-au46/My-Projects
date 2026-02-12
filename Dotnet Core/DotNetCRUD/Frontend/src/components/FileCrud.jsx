// src/components/FileCrud.jsx
import { useEffect, useState } from "react";
import api from "../axiosSetup.jsx";
import "./Dashboard.css";

export default function FileCrud() {
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const loadFiles = async () => {
    setError("");
    try {
      const res = await api.get("/files");
      setFiles(res.data?.data || []);
    } catch (err) {
      setError(err.normalizedMessage || "Failed to load files");
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const upload = async () => {
    setError("");
    if (!file) {
      setError("Please select a file");
      return;
    }
    if (!title) {
      setError("Title is required");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description);

      const res = await api.post("/files", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const created = res.data?.data || res.data;
      setFiles([created, ...files]);
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (err) {
      setError(err.normalizedMessage || "Failed to upload file");
    }
  };

  const updateMeta = async (id) => {
    const newTitle = prompt("New title:");
    if (newTitle === null) return;
    const newDescription = prompt("New description:");
    if (newDescription === null) return;

    setError("");
    try {
      const res = await api.put(`/files/${id}`, {
        title: newTitle,
        description: newDescription,
      });
      const updated = res.data?.data || res.data;
      setFiles(files.map((f) => (f._id === id ? updated : f)));
    } catch (err) {
      setError(err.normalizedMessage || "Failed to update file");
    }
  };

  const remove = async (id) => {
    setError("");
    try {
      await api.delete(`/files/${id}`);
      setFiles(files.filter((f) => f._id !== id));
    } catch (err) {
      setError(err.normalizedMessage || "Failed to delete file");
    }
  };

  const download = async (id) => {
    try {
      const res = await api.get(`/files/${id}/download`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fileMeta = files.find((f) => f._id === id);
      a.download = fileMeta?.originalName || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.normalizedMessage || "Failed to download file");
    }
  };

  return (
    <div className="file-crud">
      <h3>File CRUD (PDF / Excel / Text)</h3>
      {error && <p className="error-text">{error}</p>}

      <div className="file-form">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          accept=".pdf,.xls,.xlsx,.txt"
        />
        <button onClick={upload}>Upload</button>
      </div>

      <table className="file-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Original Name</th>
            <th>Type</th>
            <th>Size (KB)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((f) => (
            <tr key={f._id}>
              <td>{f.title}</td>
              <td>{f.originalName}</td>
              <td>{f.mimeType}</td>
              <td>{Math.round(f.size / 1024)}</td>
              <td>
                <button onClick={() => download(f._id)}>Download</button>
                <button onClick={() => updateMeta(f._id)}>Edit</button>
                <button onClick={() => remove(f._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

