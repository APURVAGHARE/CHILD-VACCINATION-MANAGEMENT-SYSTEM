const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

// Register user
router.post('/register', [
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('mobile').optional().isMobilePhone('en-IN').withMessage('Valid Indian mobile number required'),
  body('phone').optional().isMobilePhone('en-IN').withMessage('Valid Indian phone number required')
], async (req, res) => {
  console.log('📝 Registration attempt:', req.body);
  
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { full_name, email, password, mobile, phone } = req.body;

  try {
    // Check if user already exists
    console.log('🔍 Checking existing user...');
    const existingUser = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user with phone field
    console.log('💾 Inserting user into database...');
    console.log('Data:', { full_name, email, mobile, phone });
    
    const result = await db.query(
      `INSERT INTO users (full_name, email, mobile, phone, password_hash) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, full_name, email, mobile, phone, created_at`,
      [full_name, email, mobile || null, phone || null, password_hash]
    );

    const user = result.rows[0];
    console.log('✅ User created:', user);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

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
    console.error('❌ Registration error:', error);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    console.error('Error constraint:', error.constraint);
    
    // Handle duplicate key errors
    if (error.code === '23505') {
      if (error.constraint === 'users_email_key') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      if (error.constraint === 'users_mobile_key') {
        return res.status(400).json({ error: 'Mobile number already exists' });
      }
    }
    
    res.status(500).json({ 
      error: 'Server error during registration',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  console.log('🔑 Login attempt:', req.body.email);
  
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Find user
    console.log('🔍 Finding user...');
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    console.log('🔐 Checking password...');
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Get user stats (children count)
    console.log('📊 Fetching user stats...');
    const statsResult = await db.query(
      `SELECT 
        COUNT(DISTINCT c.id) as children_count,
        COUNT(DISTINCT a.id) as appointments_count
       FROM users u
       LEFT JOIN children c ON u.id = c.user_id
       LEFT JOIN appointments a ON c.id = a.child_id AND a.status = 'booked'
       WHERE u.id = $1
       GROUP BY u.id`,
      [user.id]
    );

    const stats = statsResult.rows[0] || { children_count: 0, appointments_count: 0 };
    console.log('✅ Login successful for:', user.full_name);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        mobile: user.mobile,
        phone: user.phone,
        children_count: parseInt(stats.children_count || 0),
        appointments_count: parseInt(stats.appointments_count || 0)
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user (protected route)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await db.query(
      'SELECT id, full_name, email, mobile, phone, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user stats
    const statsResult = await db.query(
      `SELECT 
        COUNT(DISTINCT c.id) as children_count,
        COUNT(DISTINCT a.id) as appointments_count
       FROM users u
       LEFT JOIN children c ON u.id = c.user_id
       LEFT JOIN appointments a ON c.id = a.child_id AND a.status = 'booked'
       WHERE u.id = $1
       GROUP BY u.id`,
      [user.id]
    );

    const stats = statsResult.rows[0] || { children_count: 0, appointments_count: 0 };

    res.json({
      success: true,
      user: {
        ...user,
        children_count: parseInt(stats.children_count || 0),
        appointments_count: parseInt(stats.appointments_count || 0)
      }
    });

  } catch (error) {
    console.error('❌ Get user error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile (protected route)
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { full_name, mobile, phone } = req.body;

    const result = await db.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           mobile = COALESCE($2, mobile),
           phone = COALESCE($3, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, full_name, email, mobile, phone, created_at`,
      [full_name, mobile, phone, decoded.id]
    );

    const updatedUser = result.rows[0];

    res.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    
    if (error.code === '23505') {
      if (error.constraint === 'users_mobile_key') {
        return res.status(400).json({ error: 'Mobile number already exists' });
      }
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;