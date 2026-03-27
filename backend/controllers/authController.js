const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { full_name, email, password, mobile, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      full_name,
      email,
      password,
      mobile,
      phone
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        mobile: user.mobile,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Check for duplicate key error
    if (error.code === '23505') {
      if (error.constraint === 'users_email_key') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      if (error.constraint === 'users_mobile_key') {
        return res.status(400).json({ error: 'Mobile number already exists' });
      }
    }
    
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await User.comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Get user stats
    const userWithStats = await User.getUserWithStats(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        mobile: user.mobile,
        phone: user.phone,
        children_count: parseInt(userWithStats?.children_count || 0),
        appointments_count: parseInt(userWithStats?.appointments_count || 0)
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.getUserWithStats(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        mobile: user.mobile,
        phone: user.phone,
        created_at: user.created_at,
        children_count: parseInt(user.children_count || 0),
        appointments_count: parseInt(user.appointments_count || 0)
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { full_name, mobile, phone } = req.body;

    const updatedUser = await User.update(req.userId, {
      full_name,
      mobile,
      phone
    });

    res.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.code === '23505') {
      if (error.constraint === 'users_mobile_key') {
        return res.status(400).json({ error: 'Mobile number already exists' });
      }
    }
    
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};