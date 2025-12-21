// src/api.tsx
import axios from "axios";
import toast from "react-hot-toast";

// --- Base Setup ---
const API = axios.create({
  //  baseURL: "http://127.0.0.1:8000/api", // Django backend URL
 baseURL: "https://urbanvital-backend.onrender.com/api", // Django backend URL
});

// Store original request queue for retry
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add request interceptor to include auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem("refresh");
        
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh endpoint
        const response = await axios.post(
          `${API.defaults.baseURL}/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        
        // Update localStorage
        localStorage.setItem("access", access);
        
        // Update login timestamp
        localStorage.setItem("login_time", Date.now().toString());
        
        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        // Process queued requests
        processQueue(null, access);
        isRefreshing = false;
        
        // Retry the original request
        return API(originalRequest);
        
      } catch (refreshError) {
        // If refresh fails, logout user
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Clear tokens and redirect to login
        logoutUser();
        
        // Redirect to login page
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      "Something went wrong. Please try again.";
    
    // Don't show error toast for auth errors (they're handled above)
    if (error.response?.status !== 401) {
      toast.error(message);
    }
    
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
  try {
    const response = await API.post("/auth/login/", credentials);
    const data = response.data;

    // Store JWT tokens
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    
    // Store login timestamp to track token age
    localStorage.setItem("login_time", Date.now().toString());
    
    toast.success("Login successful");
    return data;
  } catch (error: any) {
    // Clear any existing tokens on login failure
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("login_time");
    throw error;
  }
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

// Get profile (if you later want user info)
export const fetchUserProfile = async () => {
  const response = await API.get("/auth/profile/");
  return response.data;
};

// Check if token is about to expire
export const isTokenExpired = () => {
  const loginTime = localStorage.getItem("login_time");
  if (!loginTime) return true;
  
  const loginTimestamp = parseInt(loginTime);
  const now = Date.now();
  const hoursSinceLogin = (now - loginTimestamp) / (1000 * 60 * 60);
  
  // If token is older than 55 minutes (5 minutes before 1 hour expiry)
  return hoursSinceLogin > 0.916; // 55 minutes
};

// Manual refresh token function (for preemptive refresh)
export const manualRefreshToken = async () => {
  try {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) {
      throw new Error("No refresh token found");
    }
    
    const response = await axios.post(
      `${API.defaults.baseURL}/auth/token/refresh/`,
      { refresh }
    );
    
    const data = response.data;
    localStorage.setItem("access", data.access);
    
    // Update login time
    localStorage.setItem("login_time", Date.now().toString());
    
    return data;
  } catch (error) {
    // Clear tokens on refresh failure
    logoutUser();
    throw error;
  }
};

// Logout (clear local storage)
export const logoutUser = () => {
  // Clear all localStorage items
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
  localStorage.removeItem("login_time");
  
  toast.success("Logged out");
  
  // Optional: Redirect to login page
  // window.location.href = "/login";
};



// --- PATIENTS API ---

// GET: Fetch all patients with optional search/filter
export const fetchPatients = async (params?: {
  search?: string;
  gender?: string;
  flag?: string;
}) => {
  const response = await API.get("/patients/", { params });
  return response.data;  // Returns { count: number, results: Patient[] }
};

// POST: Create a new patient
export const registerPatient = async (patientData: {
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  occupation?: string;
  id_type?: string;
  id_number?: string;
  email?: string;
  address?: string;
  city?: string;
  emergency_name?: string;
  emergency_phone?: string;
  emergency_relation?: string;
  payment_mode?: string;
  insurance_provider?: string;
  insurance_number?: string;
  medical_flags?: string;
}) => {
  const response = await API.post("/patients/create/", patientData);
  return response.data;
};

// GET: Patient statistics
export const fetchPatientStats = async () => {
  const response = await API.get("/patients/stats/");
  return response.data;
};

// GET: Single patient by ID
export const fetchPatientById = async (id: number) => {
  const response = await API.get(`/patients/${id}/`);
  return response.data;
};

// PUT: Update patient
export const updatePatient = async (id: number, patientData: any) => {
  const response = await API.put(`/patients/${id}/`, patientData);
  return response.data;
};

// DELETE: Remove patient
export const deletePatient = async (id: number) => {
  await API.delete(`/patients/${id}/`);
};


// --- VISITS API FUNCTIONS ---
export const createVisit = async (visitData: {
  patient: number;
  service_type: string;
  priority?: string;
  assigned_doctor?: number;
  payment_status?: string;
  notes?: string;
}) => {
  const response = await API.post("/visits/", visitData);
  return response.data;
};

export const fetchActiveVisits = async () => {
  const response = await API.get("/visits/active/");
  return response.data;
};

export const updateVisitStatus = async (id: number, status: string) => {
  const response = await API.patch(`/visits/${id}/status/`, { status });
  return response.data;
};

export const fetchVisitStats = async () => {
  const response = await API.get("/visits/stats/");
  return response.data;
};

// --- VITAL SIGNS API ---
export const recordVitals = async (vitalsData: {
  visit: number;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
  notes?: string;
}) => {
  const response = await API.post("/visits/vitals/", vitalsData);
  return response.data;
};



// Service Items
export const fetchServiceItems = async (params?: {
  search?: string;
  category?: string;
}) => {
  const response = await API.get("/billing/services/", { params });
  return response.data;
};

// Invoices
export const fetchInvoices = async (params?: {
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}) => {
  const response = await API.get("/billing/invoices/", { params });
  return response.data;
};

export const fetchPendingInvoices = async () => {
  const response = await API.get("/billing/invoices/pending/");
  return response.data;
};

export const fetchInvoiceById = async (id: number) => {
  const response = await API.get(`/billing/invoices/${id}/`);
  return response.data;
};

export const createInvoice = async (invoiceData: {
  patient: number;
  visit?: number;
  status?: string;
  payment_method?: string;
  insurance_provider?: string;
  insurance_claim_id?: string;
  notes?: string;
}) => {
  const response = await API.post("/billing/invoices/", invoiceData);
  return response.data;
};

export const addInvoiceItem = async (
  invoiceId: number,
  itemData: {
    service_item: number;
    description: string;
    quantity: number;
    unit_price: number;
    discount?: number;
  }
) => {
  const response = await API.post(`/billing/invoices/${invoiceId}/items/`, itemData);
  return response.data;
};

// Payments
export const processPayment = async (
  invoiceId: number,
  paymentData: {
    amount: number;
    payment_method: string;
    reference?: string;
    transaction_id?: string;
    notes?: string;
  }
) => {
  const response = await API.post(`/billing/invoices/${invoiceId}/pay/`, paymentData);
  return response.data;
};

// Stats
export const fetchBillingStats = async () => {
  const response = await API.get("/billing/stats/");
  return response.data;
};

// Dashboard API Functions
export const fetchDashboardSummary = async () => {
  const response = await API.get("/frontdesk/summary/");
  return response.data;
};

// --- STAFF API FUNCTIONS ---

// GET: Fetch all staff with optional search/filter
export const fetchAllStaff = async (params?: {
  search?: string;
  role?: string;
}) => {
  const response = await API.get("/staff/all/", { params });
  return response.data; // Returns { staff: [], total_count: number, active_count: number }
};

// GET: Fetch staff statistics
export const fetchStaffStats = async () => {
  const response = await API.get("/staff/stats/");
  return response.data; // Returns { total_staff: number, role_counts: object }
};

// GET: Fetch staff by email
export const fetchStaffByEmail = async (email: string) => {
  const response = await API.get("/staff/get-by-email/", {
    params: { email }
  });
  return response.data;
};

// PUT: Update staff member
export const updateStaff = async (id: number, staffData: {
  username?: string;
  email?: string;
  phone?: string;
  role?: string;
  // Add other updatable fields as needed
}) => {
  const response = await API.put(`/staff/${id}/`, staffData);
  return response.data;
};

// DELETE: Remove staff member (admin only)
export const deleteStaff = async (id: number) => {
  await API.delete(`/staff/${id}/`);
};

// PATCH: Update staff status (active, suspended, on leave)
export const updateStaffStatus = async (id: number, status: string) => {
  const response = await API.patch(`/staff/${id}/status/`, { status });
  return response.data;
};

// PATCH: Reset staff password (admin only)
export const resetStaffPassword = async (id: number, newPassword: string) => {
  const response = await API.patch(`/staff/${id}/reset-password/`, {
    new_password: newPassword
  });
  return response.data;
};

// GET: Fetch staff roles (for dropdowns)
export const fetchStaffRoles = async () => {
  const response = await API.get("/staff/roles/");
  return response.data;
};

// --- INVENTORY API FUNCTIONS ---

// GET: Fetch all inventory items
export const fetchAllInventory = async (params?: {
  search?: string;
  department?: 'PHARMACY' | 'LAB';
}) => {
  const response = await API.get("/inventory/", { params });
  return response.data;
};

// GET: Fetch pharmacy items only
export const fetchPharmacyItems = async () => {
  const response = await API.get("/inventory/pharmacy/");
  return response.data;
};

// GET: Fetch lab items only
export const fetchLabItems = async () => {
  const response = await API.get("/inventory/lab/");
  return response.data;
};

// GET: Fetch inventory statistics
export const fetchInventoryStats = async () => {
  const response = await API.get("/inventory/stats/");
  return response.data;
};

// GET: Fetch single inventory item by ID
export const fetchInventoryById = async (id: number) => {
  const response = await API.get(`/inventory/${id}/`);
  return response.data;
};

// POST: Create new inventory item
export const createInventoryItem = async (itemData: {
  name: string;
  department: 'PHARMACY' | 'LAB';
  current_stock?: number;
  minimum_stock?: number;
  unit_of_measure?: string;
  selling_price?: number;
  expiry_date?: string;
  is_active?: boolean;
}) => {
  const response = await API.post("/inventory/", itemData);
  return response.data;
};

// PUT: Update inventory item
export const updateInventoryItem = async (id: number, itemData: {
  name?: string;
  department?: 'PHARMACY' | 'LAB';
  current_stock?: number;
  minimum_stock?: number;
  unit_of_measure?: string;
  selling_price?: number;
  expiry_date?: string;
  is_active?: boolean;
}) => {
  const response = await API.put(`/inventory/${id}/`, itemData);
  return response.data;
};

// PATCH: Partial update inventory item
export const partialUpdateInventoryItem = async (id: number, itemData: any) => {
  const response = await API.patch(`/inventory/${id}/`, itemData);
  return response.data;
};

// DELETE: Remove inventory item
export const deleteInventoryItem = async (id: number) => {
  await API.delete(`/inventory/${id}/`);
};

// Utility functions
export const getStockStatusInfo = (item: any) => {
  const status = item.stock_status || '';
  
  if (status === 'OUT_OF_STOCK') {
    return { text: 'Out of Stock', color: 'bg-red-100 text-red-700' };
  }
  if (status === 'LOW_STOCK') {
    return { text: 'Low Stock', color: 'bg-orange-100 text-orange-700' };
  }
  if (status === 'EXPIRING_SOON') {
    return { text: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-700' };
  }
  return { text: 'Good', color: 'bg-green-100 text-green-700' };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string) => {
  if (!dateString || dateString === 'N/A') return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};


export const calculateTotalInventoryValue = (items: any[]) => {
  return items.reduce((total, item) => {
    const value = item.total_value || (item.current_stock * item.unit_cost) || 0;
    return total + value;
  }, 0);
};
export default API;