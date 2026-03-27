const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Find user by email
  static async findByEmail(email) {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT id, full_name, email, mobile, phone, created_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // Create new user
  static async create(userData) {
    const { full_name, email, mobile, password, phone } = userData;
    
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const result = await db.query(
        `INSERT INTO users (full_name, email, mobile, password_hash, phone) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, full_name, email, mobile, phone, created_at`,
        [full_name, email, mobile || null, password_hash, phone || null]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Compare password
  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  // Update user
  static async update(id, updates) {
    const { full_name, mobile, phone } = updates;
    
    try {
      const result = await db.query(
        `UPDATE users 
         SET full_name = COALESCE($1, full_name),
             mobile = COALESCE($2, mobile),
             phone = COALESCE($3, phone),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING id, full_name, email, mobile, phone, created_at`,
        [full_name, mobile, phone, id]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Get user with children count
  static async getUserWithStats(id) {
    try {
      const result = await db.query(
        `SELECT u.*, 
                COUNT(DISTINCT c.id) as children_count,
                COUNT(DISTINCT a.id) as appointments_count
         FROM users u
         LEFT JOIN children c ON u.id = c.user_id
         LEFT JOIN appointments a ON c.id = a.child_id AND a.status = 'booked'
         WHERE u.id = $1
         GROUP BY u.id`,
        [id]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user with stats:', error);
      throw error;
    }
  }
}

module.exports = User;