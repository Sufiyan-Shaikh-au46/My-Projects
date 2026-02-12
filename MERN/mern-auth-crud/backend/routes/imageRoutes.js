// backend/routes/imageRoutes.js
import express from "express";
import auth from "../middleware/auth.js";
import { uploadSingleImage } from "../middleware/upload.js";
import {
  createImage,
  uploadImage,
  getImages,
  updateImage,
  deleteImage,
} from "../controllers/imageController.js";

const router = express.Router();

router.get("/", auth, getImages);
router.post("/", auth, createImage);
router.post("/upload", auth, uploadSingleImage, uploadImage);
router.put("/:id", auth, updateImage);
router.delete("/:id", auth, deleteImage);

export default router;

