import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
// Static serving for uploaded files (optional, for direct links)
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", itemRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/files", fileRoutes);

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Centralized error handler (must be last middleware)
app.use(errorHandler);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
