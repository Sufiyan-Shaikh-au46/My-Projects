// backend/routes/fileRoutes.js
import express from "express";
import auth from "../middleware/auth.js";
import { uploadSingleFile } from "../middleware/upload.js";
import {
  uploadFile,
  getFiles,
  updateFileMeta,
  deleteFile,
  downloadFile,
} from "../controllers/fileController.js";

const router = express.Router();

router.get("/", auth, getFiles);
router.post("/", auth, uploadSingleFile, uploadFile);
router.put("/:id", auth, updateFileMeta);
router.delete("/:id", auth, deleteFile);
router.get("/:id/download", auth, downloadFile);

export default router;

