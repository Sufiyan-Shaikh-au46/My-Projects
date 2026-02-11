import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// Connect to database with error logging handled in db.js
connectDB();

// Middleware
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", itemRoutes);

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Centralized error handler (must be last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
