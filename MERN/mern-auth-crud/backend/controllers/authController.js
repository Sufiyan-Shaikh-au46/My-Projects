import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "accessSecret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_JWT_SECRET || "refreshSecret";

const ACCESS_TOKEN_EXPIRES_IN = "30m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

const attachTokens = (res, payload) => {
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    maxAge: 30 * 60 * 1000, // 30 minutes
    sameSite: "lax",
    secure: isProd,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: "lax",
    secure: isProd,
  });
};

export const signup = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Username and password are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

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

    const payload = { user: { id: user._id } };

    attachTokens(res, payload);

    return res.json({ success: true, message: "Logged in successfully" });
  } catch (err) {
    return next(err);
  }
};

export const refreshToken = (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No refresh token" });
    }

    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);

    const payload = { user: { id: decoded.user.id } };

    attachTokens(res, payload);

    return res.json({ success: true, message: "Token refreshed" });
  } catch (err) {
    // invalidate cookies on refresh failure
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    err.statusCode = 401;
    err.message = "Session expired. Please login again.";
    return next(err);
  }
};

export const logout = (req, res, next) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    return next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('username');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: { id: user._id, username: user.username } });
  } catch (err) {
    return next(err);
  }
};
