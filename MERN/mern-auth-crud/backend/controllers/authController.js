// backend/controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "accessSecret";

export const signup = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Username and password are required" });
    }

    let user = await User.findOne({ username });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, password: hashedPassword });
    await user.save();

    return res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (err) {
    return next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const payload = { user: { id: user.id } };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "30m" });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.json({ success: true, message: "Logged in successfully" });
  } catch (err) {
    return next(err);
  }
};

export const logout = (req, res, next) => {
  try {
    res.clearCookie("accessToken");
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    return next(err);
  }
};
