import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging (helps see what's being called)
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.baseURL + config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.status);
    console.error('Error details:', error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Children APIs
export const childrenAPI = {
  getAll: () => api.get('/children'),
  getById: (id) => api.get(`/children/${id}`),
  create: (data) => api.post('/children', data),
  update: (id, data) => api.put(`/children/${id}`, data),
  delete: (id) => api.delete(`/children/${id}`),
};

// Vaccination APIs (existing)
export const vaccinationAPI = {
  getSchedule: (childId) => api.get(`/vaccinations/schedule/${childId}`),
  getHistory: (childId) => api.get(`/vaccinations/history/${childId}`),
  addRecord: (data) => api.post('/vaccinations/record', data),
  getClinics: () => api.get('/vaccinations/clinics'), // This is DIFFERENT from nearby clinics
  getVaccines: () => api.get('/vaccinations/vaccines'),
  getAppointments: (childId) => api.get(`/vaccinations/appointments/${childId}`),
  scheduleAppointment: (data) => api.post('/vaccinations/appointment', data),
  cancelAppointment: (id) => api.put(`/vaccinations/appointment/${id}/cancel`),
};

// NEW: Nearby Clinics APIs (separate module)
export const nearbyAPI = {
  // Get all clinics with filters (location based)
  getClinics: (params) => api.get('/nearby/clinics', { params }),
  
  // Get clinic by ID
  getClinic: (id) => api.get(`/nearby/clinics/${id}`),
  
  // AI-powered clinic search using Groq
  aiSearch: (data) => api.post('/nearby/ai-search', data),
  
  // Get clinics by vaccine availability
  getClinicsByVaccine: (vaccineId, params) => 
    api.get(`/nearby/by-vaccine/${vaccineId}`, { params }),
  
  // Check clinic availability for booking
  checkAvailability: (clinicId, date) => 
    api.get(`/nearby/${clinicId}/availability`, { params: { date } }),
  
  // Book appointment at clinic
  bookAppointment: (data) => api.post('/nearby/book', data)
};



export default api;