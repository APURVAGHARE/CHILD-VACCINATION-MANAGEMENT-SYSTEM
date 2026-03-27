 // API Constants
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Vaccine List
export const VACCINE_LIST = [
  { id: 1, name: 'BCG', age: 'Birth', description: 'Tuberculosis' },
  { id: 2, name: 'Hepatitis B - Dose 1', age: 'Birth', description: 'Hepatitis B' },
  { id: 3, name: 'Hepatitis B - Dose 2', age: '1-2 months', description: 'Hepatitis B' },
  { id: 4, name: 'Polio (OPV) - Dose 1', age: '6 weeks', description: 'Polio' },
  { id: 5, name: 'Polio (OPV) - Dose 2', age: '10 weeks', description: 'Polio' },
  { id: 6, name: 'Polio (OPV) - Dose 3', age: '14 weeks', description: 'Polio' },
  { id: 7, name: 'DTaP - Dose 1', age: '2 months', description: 'Diphtheria, Tetanus, Pertussis' },
  { id: 8, name: 'DTaP - Dose 2', age: '4 months', description: 'Diphtheria, Tetanus, Pertussis' },
  { id: 9, name: 'DTaP - Dose 3', age: '6 months', description: 'Diphtheria, Tetanus, Pertussis' },
  { id: 10, name: 'MMR - Dose 1', age: '12-15 months', description: 'Measles, Mumps, Rubella' },
  { id: 11, name: 'MMR - Dose 2', age: '4-6 years', description: 'Measles, Mumps, Rubella' },
  { id: 12, name: 'Varicella', age: '12-15 months', description: 'Chickenpox' },
  { id: 13, name: 'Hepatitis A', age: '12-23 months', description: 'Hepatitis A' },
  { id: 14, name: 'Rotavirus', age: '2 months', description: 'Rotavirus' },
  { id: 15, name: 'Influenza', age: '6 months', description: 'Flu' },
];

// Vaccination Status
export const VACCINATION_STATUS = {
  PENDING: 'pending',
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

// Blood Groups
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

// Genders
export const GENDERS = ['Male', 'Female', 'Other'];

// Relationships
export const RELATIONSHIPS = ['Mother', 'Father', 'Guardian', 'Grandparent', 'Other'];

// Countries
export const COUNTRIES = ['USA', 'Canada', 'UK', 'Australia', 'India', 'Other'];

// Toast Messages
export const TOAST_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful! Welcome back.',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  REGISTER_SUCCESS: 'Registration successful! Please login.',
  ADD_CHILD_SUCCESS: 'Child registered successfully!',
  UPDATE_CHILD_SUCCESS: 'Child information updated successfully!',
  DELETE_CHILD_SUCCESS: 'Child record deleted successfully!',
  VACCINATION_ADDED: 'Vaccination record added successfully!',
  VACCINATION_UPDATED: 'Vaccination record updated successfully!',
  ERROR: 'An error occurred. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.'
};

// Chart Colors
export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  THEME: 'theme',
  SETTINGS: 'settings'
};

// Routes
export const ROUTES = {
  DASHBOARD: '/',
  CHILDREN: '/children',
  ADD_CHILD: '/add-child',
  CHILD_PROFILE: '/child/:id',
  SCHEDULE: '/schedule',
  UPCOMING: '/upcoming',
  HISTORY: '/history',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  LOGIN: '/login',
  REGISTER: '/register'
};

// Animation Durations
export const ANIMATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000
};
