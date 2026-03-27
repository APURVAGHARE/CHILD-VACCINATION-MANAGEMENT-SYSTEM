import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserPlusIcon, HeartIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { authAPI } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '', // Changed from fullName to match backend
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '', // Changed from phone to mobile (Indian format)
    agreeTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Validate Indian mobile number (10 digits)
  const validateIndianMobile = (mobile) => {
    const mobileRegex = /^[6-9]\d{9}$/; // Indian mobile starts with 6-9 and has 10 digits
    return mobileRegex.test(mobile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.mobile && !validateIndianMobile(formData.mobile)) {
      toast.error('Please enter a valid Indian mobile number (10 digits starting with 6-9)');
      setLoading(false);
      return;
    }
    
    if (!formData.agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      setLoading(false);
      return;
    }
    
    try {
      // Call backend API
      const response = await authAPI.register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        mobile: formData.mobile || null
      });

      const { token, user } = response.data;

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success(`Welcome to VaccineTracker, ${user.full_name}!`, {
        icon: '👋',
      });

      // Navigate to dashboard (auto-login)
      navigate('/');

    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error
        if (error.response.status === 400) {
          if (error.response.data.error) {
            toast.error(error.response.data.error);
          } else if (error.response.data.errors) {
            // Validation errors
            error.response.data.errors.forEach(err => {
              toast.error(err.msg);
            });
          } else {
            toast.error('Registration failed. Please check your details.');
          }
        } else if (error.response.status === 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error('Registration failed. Please try again.');
        }
      } else if (error.request) {
        // Request made but no response
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else {
        // Something else happened
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1600881333168-2ef49b341f30?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
          alt="Happy family"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-primary-800/85 to-pink-900/90"></div>
      </div>

      {/* Animated Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Register Card */}
      <div className="relative z-10 max-w-2xl w-full mx-4 my-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 transform hover:scale-102 transition-all duration-500 border border-white/20">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl animate-bounce-slow">
                <UserGroupIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
              Create Your Family Account
            </h2>
            <p className="text-gray-600 flex items-center justify-center">
              <HeartIcon className="h-5 w-5 text-red-500 mr-2" />
              Start tracking your children's vaccinations today
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">1</div>
              <span className="ml-2 text-sm font-medium text-gray-700">Parent Info</span>
            </div>
            <div className="w-16 h-1 bg-gray-300 mx-4"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">2</div>
              <span className="ml-2 text-sm font-medium text-gray-400">Add Children</span>
            </div>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Priya Sharma"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="priya.sharma@email.com"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="mobile"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="9876543210"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">Indian mobile number (10 digits)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How many children do you have?
                </label>
                <select className="input-field" disabled={loading}>
                  <option>1 child</option>
                  <option>2 children</option>
                  <option>3 children</option>
                  <option>4+ children</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Create a password"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Confirm your password"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="agreeTerms" className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-blue-700 flex items-center">
                <HeartIcon className="h-5 w-5 mr-2 text-blue-500" />
                After registration, you'll be automatically logged in to add your children.
              </p>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full py-4 text-lg relative overflow-hidden group"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating your account...
                </div>
              ) : (
                'Create Family Account'
              )}
            </button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;