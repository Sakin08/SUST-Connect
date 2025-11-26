// frontend/src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include access token
api.interceptors.request.use(
  (config) => {
    // Get access token from localStorage
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    console.log("Making request to:", config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle banned users - auto logout and redirect
    if (error.response?.status === 403 && error.response?.data?.banned) {
      localStorage.removeItem("hasAuth");
      alert(error.response.data.message || "Your account has been banned.");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Don't log expected errors
    const shouldSkipLog =
      (error.response?.status === 401 &&
        error.config?.url?.includes("/auth/profile")) ||
      (error.response?.status === 404 &&
        error.config?.url?.includes("/blood-donation/donors/"));

    if (!shouldSkipLog) {
      console.error("API Error:", error.response?.status, error.response?.data);
    }
    return Promise.reject(error);
  }
);

export default api;
