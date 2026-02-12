// backend/controllers/fileController.js
import path from "path";
import fs from "fs";
import File from "../models/File.js";

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const { title, description } = req.body;
    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });
    }

    const relativePath = path.join("uploads", "files", req.file.filename);

    const fileDoc = new File({
      userId: req.user.id,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      title,
      description: description || "",
      path: relativePath,
    });

    await fileDoc.save();

    return res.status(201).json({ success: true, data: fileDoc });
  } catch (err) {
    return next(err);
  }
};

export const getFiles = async (req, res, next) => {
  try {
    const files = await File.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    return res.json({ success: true, data: files });
  } catch (err) {
    return next(err);
  }
};

export const updateFileMeta = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const file = await File.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { title, description },
      { new: true }
    );

    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    return res.json({ success: true, data: file });
  } catch (err) {
    return next(err);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const file = await File.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    // Remove file from disk if it exists
    const fullPath = path.join(process.cwd(), file.path);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    return res.json({ success: true, message: "File deleted" });
  } catch (err) {
    return next(err);
  }
};

export const downloadFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const file = await File.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    const fullPath = path.join(process.cwd(), file.path);

    if (!fs.existsSync(fullPath)) {
      return res
        .status(404)
        .json({ success: false, message: "File missing on server" });
    }

    return res.download(fullPath, file.originalName);
  } catch (err) {
    return next(err);
  }
};

