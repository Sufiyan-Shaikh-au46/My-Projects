import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";


dotenv.config();

const app = express();
connectDB();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', itemRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));