import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { EyeIcon, EyeSlashIcon, HeartIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { authAPI } from '../services/api';

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Call actual backend API
      const response = await authAPI.login(formData.email, formData.password);
      
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set authentication state
      setIsAuthenticated(true);
      
      // Show success message
      toast.success(`Welcome back, ${user.full_name}!`, {
        icon: '👋',
      });
      
      // Navigate to dashboard
      navigate('/');
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error
        if (error.response.status === 401) {
          toast.error('Invalid email or password');
        } else if (error.response.data?.error) {
          toast.error(error.response.data.error);
        } else {
          toast.error('Login failed. Please try again.');
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

  const handleDemoLogin = async () => {
    setFormData({
      email: 'sarah.watson@example.com',
      password: 'password123',
      rememberMe: true
    });
    
    // Auto-submit after a short delay
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
          alt="Happy family with children"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-primary-800/85 to-purple-900/90"></div>
      </div>

      {/* Animated Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-500 border border-white/20">
          
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-primary-600 to-purple-600 flex items-center justify-center shadow-2xl animate-bounce-slow">
                <UserGroupIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
              Welcome Back, Parent!
            </h2>
            <p className="text-gray-600 flex items-center justify-center">
              <HeartIcon className="h-5 w-5 text-red-500 mr-2" />
              Track your child's vaccinations with ease
            </p>
          </div>

          {/* Decorative Line */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 rounded-full">Parent Login</span>
            </div>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="sarah.watson@email.com"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-primary-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-primary-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full py-4 text-lg relative overflow-hidden group"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In to Your Family Account'
              )}
            </button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                New here?{' '}
                <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">
                  Create a Family Account
                </Link>
              </p>
            </div>
          </form>
          
          {/* Demo Credentials Card */}
          <div className="mt-8 p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl border border-primary-100">
            <p className="text-xs text-gray-500 text-center mb-2">Demo Parent Account</p>
            <div className="flex flex-col items-center space-y-1 text-sm">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                <span className="text-gray-600">Email: sarah.watson@example.com</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></span>
                <span className="text-gray-600">Password: password123</span>
              </div>
            </div>
            <button 
              onClick={handleDemoLogin}
              className="mt-3 w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
              disabled={loading}
            >
              Use Demo Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;