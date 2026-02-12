// backend/middleware/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads", "files");
const imageDir = path.join(process.cwd(), "uploads", "images");

// Ensure upload directories exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, imageDir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

// Accept pdf, excel, text, images and similar
const allowedMimes = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const fileFilter = (_req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF, Excel, text, and image files are allowed"),
      false
    );
  }
};

const imageFileFilter = (_req, file, cb) => {
  const imageMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (imageMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed"),
      false
    );
  }
};

export const uploadSingleFile = multer({ storage, fileFilter }).single("file");
export const uploadSingleImage = multer({ storage: imageStorage, fileFilter: imageFileFilter }).single("image");

