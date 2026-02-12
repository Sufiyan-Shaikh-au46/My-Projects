// backend/models/File.js

import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    // relative path from backend root, used for download
    path: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("File", FileSchema);

