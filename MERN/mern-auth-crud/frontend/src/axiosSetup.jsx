// src/axiosSetup.jsx
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // include cookies
});

// Simple response error interceptor to normalize error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Attach a friendly message for UI
    const fallbackMessage = "Something went wrong. Please try again.";
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.msg ||
      error.message ||
      fallbackMessage;

    // Keep original error, but add a normalized message field
    // so UI components can rely on error.normalizedMessage
    // without worrying about backend shape.
    // eslint-disable-next-line no-param-reassign
    error.normalizedMessage = message;
    return Promise.reject(error);
  }
);

export default api;
