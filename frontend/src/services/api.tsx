// src/api.tsx
import axios from "axios";
import toast from "react-hot-toast";

// --- Base Setup ---
const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Django backend URL
});

// --- Interceptors ---
// Attach token if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      "Something went wrong. Please try again.";
    toast.error(message);
    return Promise.reject(error);
  }
);

//
// --- AUTH API ---
//

// Login (Admin only right now)
export const loginUser = async (credentials: {
  username: string;
  password: string;
}) => {
  const response = await API.post("/auth/login/", credentials);
  const data = response.data;

  // Store JWT tokens
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  toast.success("Login successful");

  return data;
};
export const registerStaff = async (staffData: {
  username: string;
  email?: string;
  phone?: string;
  password: string;
  role: string;
}) => {
  try {
    const response = await API.post("/staff/register/", staffData);
    toast.success(`${staffData.role} registered`);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      "Failed to register staff";
    toast.error(message);
    throw error;
  }
};

// Fetch staff profile by email
export const getStaffRole = async (email: string) => {
  const response = await API.get(`/staff/by-email/`, {
    params: { email },
  });
  return response.data;
};


// Refresh token (auto-called when access expires)
export const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) throw new Error("No refresh token found");
  const response = await API.post("/auth/token/refresh/", { refresh });
  const data = response.data;
  localStorage.setItem("access", data.access);
  return data;
};

// Get profile (if you later want user info)
export const fetchUserProfile = async () => {
  const response = await API.get("/auth/profile/");
  return response.data;
};

// Logout (clear local storage)
export const logoutUser = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("role");
  toast.success("Logged out");
};

// Register a new patient
export const registerPatient = async (patientData: {
  name: string;
  phone: string;
  address?: string;
  gender?: string;
  contact_person?: string;
  flags?: string;
}) => {
  const response = await API.post("/patients/", patientData);
  return response.data;
};


export default API;
