// backend/controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { username, password } = req.body;
  let user = await User.findOne({ username });
  if (user) return res.status(400).json({ msg: 'User already exists' });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  user = new User({ username, password: hashedPassword });
  await user.save();

  res.json({ msg: 'User registered successfully' });
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

  const payload = { user: { id: user.id } };
  const accessToken = jwt.sign(payload, 'accessSecret', { expiresIn: '30m' });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    maxAge: 30 * 60 * 1000
  });

  res.json({ msg: 'Logged in successfully' });
};

export const logout = (req, res) => {
  res.clearCookie('accessToken');
  res.json({ msg: 'Logged out successfully' });
};