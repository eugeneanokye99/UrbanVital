// src/api.tsx
import axios from "axios";
import toast from "react-hot-toast";
// --- JWT decode helper ---
interface JwtPayload {
  exp?: number;
  [key: string]: any;
}
function parseJwt(token: string): JwtPayload | null {
  try {
    return JSON.parse(atob(token.split('.')[1])) as JwtPayload;
  } catch (e) {
    return null;
  }
}

// --- Base Setup ---
const API = axios.create({
  // baseURL: "http://127.0.0.1:8000/api", // Django backend URL
  baseURL: "https://urbanvital-backend.onrender.com/api", // Django backend URL
});

// Store original request queue for retry
let isRefreshing = false;
let failedQueue: any[] = [];

// Simple in-memory cache with TTL
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key: string) => {
  const entry = cache.get(key);
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > CACHE_TTL;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.data;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

export const clearCache = (pattern?: string) => {
  if (!pattern) {
    cache.clear();
  } else {
    Array.from(cache.keys()).forEach(key => {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    });
  }
};

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
  async (config) => {
    let token = localStorage.getItem("access");
    const refreshToken = localStorage.getItem("refresh");
    if (token) {
      const payload = parseJwt(token);
      const now = Math.floor(Date.now() / 1000);
      // If token expires in <60s, refresh it proactively
      if (payload && payload.exp && payload.exp - now < 60 && refreshToken) {
        try {
          const response = await axios.post(
            `${API.defaults.baseURL}/auth/token/refresh/`,
            { refresh: refreshToken }
          );
          token = response.data.access;
          if (token) {
            localStorage.setItem("access", token);
          }
        } catch (err) {
          // If refresh fails, clear tokens and redirect
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          if (window.location.pathname !== "/") {
            window.location.href = "/";
          }
          return Promise.reject(err);
        }
      }
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
    // Map frontend fields to backend expected fields
    const backendData = {
      new_username: staffData.username,
      new_email: staffData.email,
      phone: staffData.phone,
      password: staffData.password,
      role: staffData.role,
    };

    const response = await API.post("/staff/register/", backendData);
    toast.success(`${staffData.role} registered`);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.new_username?.[0] ||
      error?.response?.data?.new_email?.[0] ||
      error?.response?.data?.message ||
      "Failed to register staff";
    toast.error(message);
    throw error;
  }
};

// Fetch staff members with optional filters
export const fetchStaff = async (params?: {
  role?: string;
  search?: string;
}) => {
  const response = await API.get("/staff/all/", { params });
  return response.data;
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


export const logoutUser = async () => {
  // Always clear tokens first to prevent repeated unauthorized requests
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
  localStorage.removeItem("login_time");

  // Only call backend logout if we had a valid access token
  const hadToken = !!localStorage.getItem("access");
  if (hadToken) {
    try {
      await API.post("/auth/logout/");
    } catch (e) {
      // Ignore errors
    }
  }
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
}, useCache: boolean = true) => {
  const cacheKey = `patients_${JSON.stringify(params || {})}`;

  // Check cache first
  if (useCache) {
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
  }

  const response = await API.get("/patients/", { params });
  const data = response.data;

  // Cache the response
  if (useCache) {
    setCachedData(cacheKey, data);
  }

  return data;  // Returns { count: number, results: Patient[] }
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

  // Invalidate patients cache
  clearCache('patients');

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

  // Invalidate patients cache
  clearCache('patients');

  return response.data;
};

// DELETE: Remove patient
export const deletePatient = async (id: number) => {
  await API.delete(`/patients/${id}/`);

  // Invalidate patients cache
  clearCache('patients');
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

export const fetchVisitById = async (id: number) => {
  const response = await API.get(`/visits/${id}/`);
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


// --- CONSULTATION API ---
export const createConsultation = async (consultationData: {
  visit: number;
  patient: number;
  chief_complaint: string;
  history_of_present_illness?: string;
  past_medical_history?: string;
  physical_examination?: string;
  diagnosis: string;
  clinical_plan: string;
  prescription?: string;
  admit_patient?: boolean;
  admission_notes?: string;
}) => {
  const response = await API.post("/consultations/", consultationData);
  return response.data;
};

export const fetchConsultationByVisit = async (visitId: number) => {
  const response = await API.get(`/consultations/visit/${visitId}/`);
  return response.data;
};

export const fetchPatientConsultationHistory = async (patientId: number) => {
  const response = await API.get(`/consultations/patient/${patientId}/history/`);
  return response.data;
};

export const fetchConsultationById = async (id: number) => {
  const response = await API.get(`/consultations/${id}/`);
  return response.data;
};

export const fetchClinicianStats = async () => {
  const response = await API.get("/consultations/stats/");
  return response.data;
};

// Prescription Queue for Pharmacy
export const fetchPrescriptionQueue = async (params?: {
  status?: string;
}) => {
  const response = await API.get("/consultations/prescriptions/", { params });
  return response.data;
};

// Update consultation (e.g., mark prescription as dispensed)
export const updateConsultation = async (id: number, data: any) => {
  const response = await API.patch(`/consultations/${id}/`, data);
  return response.data;
};
// --- APPOINTMENTS API ---
export const createAppointment = async (appointmentData: {
  patient: number;
  doctor?: number;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  notes?: string;
}) => {
  const response = await API.post("/appointments/", appointmentData);
  return response.data;
};

export const fetchAppointments = async (params?: {
  status?: string;
  patient_id?: number;
  doctor_id?: number;
  time_filter?: 'upcoming' | 'missed';
  search?: string;
}) => {
  const response = await API.get("/appointments/", { params });
  return response.data;
};

export const fetchPatientAppointmentHistory = async (patientId: number) => {
  const response = await API.get(`/appointments/patient/${patientId}/history/`);
  return response.data;
};

export const updateAppointmentStatus = async (id: number, status: string) => {
  const response = await API.patch(`/appointments/${id}/`, { status });
  return response.data;
};
// --- MEDICAL DOCUMENTS API ---
export const createMedicalDocument = async (documentData: {
  patient: number;
  document_type: string;
  title: string;
  content: any;
}) => {
  const response = await API.post("/medical-documents/", documentData);
  return response.data;
};

export const fetchMedicalDocuments = async (params?: {
  patient_id?: number;
}) => {
  const response = await API.get("/medical-documents/", { params });
  return response.data;
};

export const fetchMedicalDocumentById = async (id: number) => {
  const response = await API.get(`/medical-documents/${id}/`);
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
    service_item?: number | null;
    description: string;
    quantity: number;
    unit_price: number;
    discount?: number;
    notes?: string;
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

// Pharmacy Sales History
export const fetchPharmacySalesHistory = async (params?: {
  date_from?: string;
  date_to?: string;
  search?: string;
}) => {
  const response = await API.get("/billing/pharmacy-sales/", { params });
  return response.data;
};

// Pharmacy Statistics
export const fetchPharmacyStats = async () => {
  const response = await API.get("/billing/pharmacy-stats/");
  return response.data;
};

// Dashboard API Functions
export const fetchDashboardSummary = async () => {
  const response = await API.get("/frontdesk/summary/");
  return response.data;
};

// GET: Comprehensive admin statistics for Admin Dashboard
export const fetchAdminStats = async () => {
  const response = await API.get("/frontdesk/admin-stats/");
  return response.data;
};

// GET: Financial transactions with filtering for Admin Finance page
export const fetchFinancialTransactions = async (params?: {
  range?: string;
  department?: string;
}) => {
  const response = await API.get("/billing/transactions/", { params });
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
}) => {
  // Always send new_username/new_email for backend compatibility
  const backendData: any = {};
  if (staffData.username) backendData.new_username = staffData.username;
  if (staffData.email) backendData.new_email = staffData.email;
  if (staffData.phone !== undefined) backendData.phone = staffData.phone;
  if (staffData.role !== undefined) backendData.role = staffData.role;
  const response = await API.put(`/staff/${id}/`, backendData);
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



// Update inventory after sale (you need to create this endpoint in Django)
export const updateInventoryAfterSale = async (cartItems: any[]) => {
  const response = await API.post("/inventory/update-after-sale/", {
    items: cartItems.map(item => ({
      id: item.id,
      quantity_sold: item.qty
    }))
  });
  return response.data;
};


// --- INVENTORY ADJUSTMENTS/RETURNS API ---

// GET: Fetch all adjustments
export const fetchInventoryAdjustments = async (params?: {
  status?: string;
  type?: string;
  search?: string;
}) => {
  const response = await API.get("/inventory/adjustments/", { params });
  return response.data;
};

// POST: Create adjustment/return
export const createInventoryAdjustment = async (adjustmentData: {
  inventory_item: number;
  batch_number?: string;
  quantity: number;
  adjustment_type: string;
  reason: string;
}) => {
  const response = await API.post("/inventory/adjustments/", adjustmentData);
  return response.data;
};

// GET: Fetch single adjustment
export const fetchInventoryAdjustment = async (id: number) => {
  const response = await API.get(`/inventory/adjustments/${id}/`);
  return response.data;
};

// PUT/PATCH: Update adjustment
export const updateInventoryAdjustment = async (id: number, adjustmentData: any) => {
  const response = await API.patch(`/inventory/adjustments/${id}/`, adjustmentData);
  return response.data;
};

// POST: Approve adjustment
export const approveInventoryAdjustment = async (id: number) => {
  const response = await API.post(`/inventory/adjustments/${id}/approve/`);
  return response.data;
};

// DELETE: Delete adjustment
export const deleteInventoryAdjustment = async (id: number) => {
  await API.delete(`/inventory/adjustments/${id}/`);
};


// --- CART API FUNCTIONS ---

// Create a new cart
export const createCart = async (cartData?: {
  patient_id?: number;
  patient_name?: string;
}) => {
  const response = await API.post("/cart/create/", cartData || {});
  return response.data;
};

// Get active cart for current user
export const getActiveCart = async () => {
  const response = await API.get("/cart/active/");
  return response.data;
};

// Add item to cart
export const addToCart = async (cartId: number, itemData: {
  inventory_item_id: number;
  quantity: number;
}) => {
  const response = await API.post(`/cart/${cartId}/add-item/`, itemData);
  return response.data;
};

// Update cart item quantity
export const updateCartItem = async (cartId: number, itemId: number, quantity: number) => {
  const response = await API.patch(`/cart/${cartId}/items/${itemId}/`, { quantity });
  return response.data;
};

// Remove item from cart
export const removeCartItem = async (cartId: number, itemId: number) => {
  const response = await API.delete(`/cart/${cartId}/items/${itemId}/`);
  return response.data;
};

// Checkout cart (complete sale)
export const checkoutCart = async (cartId: number, checkoutData: {
  payment_method: string;
  patient_id?: number;
  patient_name?: string;
}) => {
  const response = await API.post(`/cart/${cartId}/checkout/`, checkoutData);
  return response.data;
};

// Get cart details
export const getCart = async (cartId: number) => {
  const response = await API.get(`/cart/${cartId}/`);
  return response.data;
};

// --- ULTRASOUND API FUNCTIONS ---

// GET: Fetch ultrasound statistics for dashboard
export const fetchUltrasoundStats = async (useCache: boolean = true) => {
  const cacheKey = 'ultrasound_stats';

  if (useCache) {
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
  }

  const response = await API.get("/ultrasound/stats/");
  const data = response.data;

  if (useCache) {
    setCachedData(cacheKey, data);
  }

  return data;
};

// GET: Fetch worklist data (pending orders + in-progress scans)
export const fetchUltrasoundWorklist = async (useCache: boolean = false) => {
  const cacheKey = 'ultrasound_worklist';

  // Worklist should be fresh, use shorter cache TTL (1 minute)
  if (useCache) {
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
  }

  const response = await API.get("/ultrasound/worklist/");
  const data = response.data;

  if (useCache) {
    setCachedData(cacheKey, data);
  }

  return data;
};

// GET: Fetch all ultrasound orders
export const fetchUltrasoundOrders = async (params?: {
  status?: string;
  urgency?: string;
  patient_id?: number;
  search?: string;
}) => {
  const response = await API.get("/ultrasound/orders/", { params });
  return response.data;
};

// POST: Create ultrasound order
export const createUltrasoundOrder = async (orderData: {
  patient: number;
  visit?: number;
  scan_type: string;
  urgency: string;
  clinical_indication: string;
  special_instructions?: string;
}) => {
  const response = await API.post("/ultrasound/orders/", orderData);

  // Invalidate relevant caches
  clearCache('ultrasound_stats');
  clearCache('ultrasound_worklist');

  return response.data;
};

// GET: Fetch single ultrasound order
export const fetchUltrasoundOrder = async (id: number) => {
  const response = await API.get(`/ultrasound/orders/${id}/`);
  return response.data;
};

// PUT/PATCH: Update ultrasound order
export const updateUltrasoundOrder = async (id: number, orderData: any) => {
  const response = await API.patch(`/ultrasound/orders/${id}/`, orderData);

  // Invalidate relevant caches
  clearCache('ultrasound_stats');
  clearCache('ultrasound_worklist');

  return response.data;
};

// POST: Update order status
export const updateUltrasoundOrderStatus = async (id: number, status: string, scheduled_date?: string) => {
  const response = await API.post(`/ultrasound/orders/${id}/status/`, {
    status,
    scheduled_date
  });

  // Invalidate relevant caches
  clearCache('ultrasound_stats');
  clearCache('ultrasound_worklist');

  return response.data;
};

// DELETE: Delete ultrasound order
export const deleteUltrasoundOrder = async (id: number) => {
  const response = await API.delete(`/ultrasound/orders/${id}/`);

  // Invalidate relevant caches
  clearCache('ultrasound_stats');
  clearCache('ultrasound_worklist');

  return response.data;
};

// GET: Fetch all ultrasound scans
export const fetchUltrasoundScans = async (params?: {
  status?: string;
  patient_id?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
}) => {
  const response = await API.get("/ultrasound/scans/", { params });
  return response.data;
};

// POST: Create ultrasound scan
export const createUltrasoundScan = async (scanData: {
  order: number;
  patient: number;
  scan_type: string;
  machine_used?: string;
  clinical_indication: string;
  lmp?: string;
  gestational_age?: string;
  technique?: string;
  findings: string;
  measurements?: any;
  impression: string;
  recommendations?: string;
  status?: string;
}) => {
  const response = await API.post("/ultrasound/scans/", scanData);

  // Invalidate relevant caches
  clearCache('ultrasound_stats');
  clearCache('ultrasound_worklist');

  return response.data;
};

// GET: Fetch single ultrasound scan
export const fetchUltrasoundScan = async (id: number) => {
  const response = await API.get(`/ultrasound/scans/${id}/`);
  return response.data;
};

// PUT/PATCH: Update ultrasound scan
export const updateUltrasoundScan = async (id: number, scanData: any) => {
  const response = await API.patch(`/ultrasound/scans/${id}/`, scanData);

  // Invalidate relevant caches
  clearCache('ultrasound_stats');
  clearCache('ultrasound_worklist');

  return response.data;
};

// POST: Complete scan
export const completeUltrasoundScan = async (id: number) => {
  const response = await API.post(`/ultrasound/scans/${id}/complete/`);

  // Invalidate relevant caches
  clearCache('ultrasound_stats');
  clearCache('ultrasound_worklist');

  return response.data;
};

// POST: Verify scan
export const verifyUltrasoundScan = async (id: number) => {
  const response = await API.post(`/ultrasound/scans/${id}/verify/`);

  // Invalidate relevant caches
  clearCache('ultrasound_stats');

  return response.data;
};

// GET: Fetch completed scans
export const fetchCompletedUltrasoundScans = async () => {
  const response = await API.get("/ultrasound/scans/completed/");
  return response.data;
};

// GET: Fetch patient ultrasound history
export const fetchPatientUltrasoundHistory = async (patientId: number) => {
  const response = await API.get(`/ultrasound/patient/${patientId}/history/`);
  return response.data;
};

// GET: Fetch ultrasound equipment
export const fetchUltrasoundEquipment = async (useCache: boolean = true) => {
  const cacheKey = 'ultrasound_equipment';

  if (useCache) {
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
  }

  const response = await API.get("/ultrasound/equipment/");
  const data = response.data;

  if (useCache) {
    setCachedData(cacheKey, data);
  }

  return data;
};

// POST: Create ultrasound equipment
export const createUltrasoundEquipment = async (equipmentData: {
  name: string;
  model?: string;
  serial_number?: string;
  manufacturer?: string;
  status: string;
  location?: string;
}) => {
  const response = await API.post("/ultrasound/equipment/", equipmentData);

  // Invalidate equipment cache
  clearCache('ultrasound_equipment');
  clearCache('ultrasound_stats');

  return response.data;
};

// PUT/PATCH: Update ultrasound equipment
export const updateUltrasoundEquipment = async (id: number, equipmentData: any) => {
  const response = await API.patch(`/ultrasound/equipment/${id}/`, equipmentData);

  // Invalidate equipment cache
  clearCache('ultrasound_equipment');
  clearCache('ultrasound_stats');

  return response.data;
};


// --- LAB API FUNCTIONS ---

// GET: Fetch lab statistics for dashboard
export const fetchLabStats = async (useCache: boolean = true) => {
  const cacheKey = 'lab_stats';

  if (useCache) {
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
  }

  const response = await API.get("/lab/statistics/");
  const data = response.data;

  if (useCache) {
    setCachedData(cacheKey, data);
  }

  return data;
};

// GET: Fetch lab worklist (pending, sample_collected, in_progress)
export const fetchLabWorklist = async (useCache: boolean = false) => {
  const cacheKey = 'lab_worklist';

  if (useCache) {
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
  }

  const response = await API.get("/lab/worklist/");
  const data = response.data;

  if (useCache) {
    setCachedData(cacheKey, data);
  }

  return data;
};

// GET: Fetch all lab tests (catalog)
export const fetchLabTests = async (params?: {
  category?: string;
  is_active?: boolean;
  search?: string;
}) => {
  const response = await API.get("/lab/tests/", { params });
  return response.data;
};

// GET: Fetch single lab test
export const fetchLabTest = async (id: number) => {
  const response = await API.get(`/lab/tests/${id}/`);
  return response.data;
};

// POST: Create lab test
export const createLabTest = async (testData: {
  name: string;
  code: string;
  category: string;
  description?: string;
  sample_type: string;
  turnaround_time: string;
  normal_range?: string;
  is_active?: boolean;
}) => {
  const response = await API.post("/lab/tests/", testData);
  return response.data;
};

// PUT/PATCH: Update lab test
export const updateLabTest = async (id: number, testData: any) => {
  const response = await API.patch(`/lab/tests/${id}/`, testData);
  return response.data;
};

// GET: Fetch all lab orders
export const fetchLabOrders = async (params?: {
  status?: string;
  urgency?: string;
  patient_id?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
}) => {
  const response = await API.get("/lab/orders/", { params });
  return response.data;
};

// POST: Create lab order
export const createLabOrder = async (orderData: {
  patient: number;
  urgency: string;
  clinical_indication: string;
  special_instructions?: string;
  test_ids: number[];
}) => {
  const response = await API.post("/lab/orders/", orderData);

  // Invalidate relevant caches
  clearCache('lab_stats');
  clearCache('lab_worklist');

  return response.data;
};

// GET: Fetch single lab order
export const fetchLabOrder = async (id: number) => {
  const response = await API.get(`/lab/orders/${id}/`);
  return response.data;
};

// PUT/PATCH: Update lab order
export const updateLabOrder = async (id: number, orderData: any) => {
  const response = await API.patch(`/lab/orders/${id}/`, orderData);

  // Invalidate relevant caches
  clearCache('lab_stats');
  clearCache('lab_worklist');

  return response.data;
};

// POST: Collect sample for lab order
export const collectLabSample = async (orderId: number) => {
  const response = await API.post(`/lab/orders/${orderId}/collect-sample/`);

  // Invalidate relevant caches
  clearCache('lab_stats');
  clearCache('lab_worklist');

  return response.data;
};

// POST: Start processing lab order
export const startLabProcessing = async (orderId: number) => {
  const response = await API.post(`/lab/orders/${orderId}/start-processing/`);

  // Invalidate relevant caches
  clearCache('lab_stats');
  clearCache('lab_worklist');

  return response.data;
};

// POST: Cancel lab order
export const cancelLabOrder = async (orderId: number) => {
  const response = await API.post(`/lab/orders/${orderId}/cancel/`);

  // Invalidate relevant caches
  clearCache('lab_stats');
  clearCache('lab_worklist');

  return response.data;
};

// DELETE: Delete lab order
export const deleteLabOrder = async (id: number) => {
  const response = await API.delete(`/lab/orders/${id}/`);

  // Invalidate relevant caches
  clearCache('lab_stats');
  clearCache('lab_worklist');

  return response.data;
};

// GET: Fetch all lab results
export const fetchLabResults = async (params?: {
  status?: string;
  patient_id?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
}) => {
  const response = await API.get("/lab/results/", { params });
  return response.data;
};

// POST: Create lab result
export const createLabResult = async (resultData: {
  order: number;
  results_data: any;
  interpretation?: string;
  abnormal_flags?: string[];
  status?: string;
}) => {
  const response = await API.post("/lab/results/", resultData);

  // Invalidate relevant caches
  clearCache('lab_stats');
  clearCache('lab_worklist');

  return response.data;
};

// GET: Fetch single lab result
export const fetchLabResult = async (id: number) => {
  const response = await API.get(`/lab/results/${id}/`);
  return response.data;
};

// GET: Fetch lab result by order ID
export const fetchLabResultByOrder = async (orderId: number) => {
  const response = await API.get(`/lab/results/by-order/${orderId}/`);
  return response.data;
};

// PUT/PATCH: Update lab result
export const updateLabResult = async (id: number, resultData: any) => {
  const response = await API.patch(`/lab/results/${id}/`, resultData);

  // Invalidate relevant caches
  clearCache('lab_stats');

  return response.data;
};

// POST: Verify lab result
export const verifyLabResult = async (resultId: number) => {
  const response = await API.post(`/lab/results/${resultId}/verify/`);

  // Invalidate relevant caches
  clearCache('lab_stats');

  return response.data;
};

// DELETE: Delete lab test
export const deleteLabTest = async (id: number) => {
  const response = await API.delete(`/lab/tests/${id}/`);
  return response.data;
};

export default API;