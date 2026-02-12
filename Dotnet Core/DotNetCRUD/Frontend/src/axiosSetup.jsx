// src/axiosSetup.jsx
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // include cookies
  timeout: 5000, // 5 seconds timeout
});

// Response interceptor: try to refresh token on 401, then normalize errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const status = error?.response?.status;
    const isAuthError = status === 401 || status === 403;

    // Attempt one-time silent refresh on auth errors
    if (isAuthError && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        await api.post("/auth/refresh");
        // After successful refresh, retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        const fallbackMessage = "Session expired. Please login again.";
        const refreshMessage =
          refreshError?.response?.data?.message ||
          refreshError?.response?.data?.msg ||
          refreshError.message ||
          fallbackMessage;
        // eslint-disable-next-line no-param-reassign
        error.normalizedMessage = refreshMessage;
        return Promise.reject(error);
      }
    }

    // For non-auth errors or failed retry, attach a friendly message for UI
    const fallbackMessage = "Something went wrong. Please try again.";
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.msg ||
      error.message ||
      fallbackMessage;

    // eslint-disable-next-line no-param-reassign
    error.normalizedMessage = message;
    return Promise.reject(error);
  }
);

export default api;
