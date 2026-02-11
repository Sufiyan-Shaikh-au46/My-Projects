// backend/middleware/errorHandler.js
// Centralized error handling middleware

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error(err); // For debugging; consider a proper logger in production

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  // Optionally hide stack trace in production
  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV !== "production" && err.stack) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
}

