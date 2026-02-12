// backend/controllers/imageController.js
import Image from "../models/Image.js";

export const createImage = async (req, res, next) => {
  try {
    const { title, url, description } = req.body;

    if (!title || !url) {
      return res
        .status(400)
        .json({ success: false, message: "Title and image URL are required" });
    }

    const image = new Image({
      title,
      url,
      description: description || "",
      userId: req.user.id,
    });

    await image.save();

    return res.status(201).json({ success: true, data: image });
  } catch (err) {
    return next(err);
  }
};

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image file provided" });
    }

    const { title, description } = req.body;
    const url = `/uploads/images/${req.file.filename}`;

    const image = new Image({
      title: title || req.file.originalname,
      url,
      description: description || "",
      userId: req.user.id,
    });

    await image.save();

    return res.status(201).json({ success: true, data: image });
  } catch (err) {
    return next(err);
  }
};

export const getImages = async (req, res, next) => {
  try {
    const images = await Image.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    return res.json({ success: true, data: images });
  } catch (err) {
    return next(err);
  }
};

export const updateImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const image = await Image.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updates,
      { new: true }
    );

    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }

    return res.json({ success: true, data: image });
  } catch (err) {
    return next(err);
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Image.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }

    return res.json({ success: true, message: "Image deleted" });
  } catch (err) {
    return next(err);
  }
};

