// backend/middleware/auth.js

import jwt from "jsonwebtoken";

function auth(req, res, next) {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ msg: 'No token' });

  try {
    const decoded = jwt.verify(token, 'accessSecret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token expired or invalid' });
  }
}

export default auth;