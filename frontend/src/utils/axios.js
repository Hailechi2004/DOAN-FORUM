import axios from "axios";
import { API_BASE_URL } from "../config/api";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }

      return Promise.reject({
        status,
        message: data.message || "An error occurred",
        errors: data.errors || null,
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        message: "Network error. Please check your connection.",
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || "An unexpected error occurred",
      });
    }
  }
);

export default axiosInstance;
