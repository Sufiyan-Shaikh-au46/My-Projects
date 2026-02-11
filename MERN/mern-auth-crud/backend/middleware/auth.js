// backend/middleware/auth.js

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "accessSecret";

function auth(req, res, next) {
  const token = req.cookies.accessToken;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    return next();
  } catch (err) {
    const isTokenExpired = err.name === "TokenExpiredError";
    return res.status(401).json({
      success: false,
      message: isTokenExpired ? "Token expired" : "Token invalid",
    });
  }
}

export default auth;
