const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// =============================================
// PROFILE SETTINGS
// =============================================

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const {
      full_name,
      mobile,
      phone,
      address,
      city,
      state,
      zip,
      country,
      dob,
      gender,
      blood_group,
      emergency_contact
    } = req.body;

    // Update users table
    const userResult = await db.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           mobile = COALESCE($2, mobile),
           phone = COALESCE($3, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, full_name, email, mobile, phone`,
      [full_name, mobile, phone, req.userId]
    );

    // Update or insert into user_profiles table (if you have one)
    // If not, you can add these fields to users table
    const profileResult = await db.query(
      `INSERT INTO user_profiles (user_id, address, city, state, zip_code, country, 
                                  date_of_birth, gender, blood_group, emergency_contact_name,
                                  emergency_contact_phone, emergency_contact_relation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (user_id) 
       DO UPDATE SET
          address = EXCLUDED.address,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          zip_code = EXCLUDED.zip_code,
          country = EXCLUDED.country,
          date_of_birth = EXCLUDED.date_of_birth,
          gender = EXCLUDED.gender,
          blood_group = EXCLUDED.blood_group,
          emergency_contact_name = EXCLUDED.emergency_contact_name,
          emergency_contact_phone = EXCLUDED.emergency_contact_phone,
          emergency_contact_relation = EXCLUDED.emergency_contact_relation,
          updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        req.userId, address, city, state, zip, country,
        dob, gender, blood_group,
        emergency_contact?.name, emergency_contact?.phone, emergency_contact?.relation
      ]
    );

    res.json({
      success: true,
      user: userResult.rows[0],
      profile: profileResult.rows[0]
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
// NOTIFICATION SETTINGS
// =============================================

// Get notification preferences
router.get('/notifications', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      // Create default preferences
      const defaultPrefs = await db.query(
        `INSERT INTO user_preferences (user_id, email_reminders, sms_reminders, app_notifications,
                                      appointment_alerts, vaccine_due_alerts, monthly_reports,
                                      promotional_emails, lab_report_ready, prescription_refill,
                                      billing_alerts)
         VALUES ($1, true, true, true, true, true, false, false, true, true, true)
         RETURNING *`,
        [req.userId]
      );
      return res.json({ success: true, preferences: defaultPrefs.rows[0] });
    }

    res.json({ success: true, preferences: result.rows[0] });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update notification preferences
router.put('/notifications', auth, async (req, res) => {
  try {
    const updates = req.body;
    
    // Build dynamic update query
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      setClauses.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    });

    values.push(req.userId);

    const query = `
      UPDATE user_preferences 
      SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      // Insert if not exists
      const insertResult = await db.query(
        `INSERT INTO user_preferences (user_id, ${Object.keys(updates).join(', ')})
         VALUES ($1, ${Object.keys(updates).map((_, i) => `$${i + 2}`).join(', ')})
         RETURNING *`,
        [req.userId, ...Object.values(updates)]
      );
      return res.json({ success: true, preferences: insertResult.rows[0] });
    }

    res.json({ success: true, preferences: result.rows[0] });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
// PREFERENCES
// =============================================

// Get user preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT language, time_format, date_format, week_start, default_view, 
              theme, font_size, compact_view, auto_save
       FROM user_preferences WHERE user_id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        preferences: {
          language: 'en',
          time_format: '12h',
          date_format: 'DD/MM/YYYY',
          week_start: 'monday',
          default_view: 'dashboard',
          theme: 'light',
          font_size: 'medium',
          compact_view: false,
          auto_save: true
        }
      });
    }

    res.json({ success: true, preferences: result.rows[0] });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const updates = req.body;
    
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      // Convert camelCase to snake_case for database
      const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      setClauses.push(`${dbKey} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    });

    values.push(req.userId);

    const query = `
      UPDATE user_preferences 
      SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      // Insert if not exists
      const insertResult = await db.query(
        `INSERT INTO user_preferences (user_id, ${Object.keys(updates).join(', ')})
         VALUES ($1, ${Object.keys(updates).map((_, i) => `$${i + 2}`).join(', ')})
         RETURNING *`,
        [req.userId, ...Object.values(updates)]
      );
      return res.json({ success: true, preferences: insertResult.rows[0] });
    }

    res.json({ success: true, preferences: result.rows[0] });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
// CHANGE PASSWORD
// =============================================

router.put('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const bcrypt = require('bcryptjs');

  try {
    // Get current user with password
    const userResult = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.userId]
    );

    const user = userResult.rows[0];

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newHash, req.userId]
    );

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
// SESSIONS
// =============================================

// Get active sessions
router.get('/sessions', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, device, location, last_active, is_current
       FROM user_sessions 
       WHERE user_id = $1 
       ORDER BY last_active DESC`,
      [req.userId]
    );

    res.json({ success: true, sessions: result.rows });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Revoke session
router.delete('/sessions/:sessionId', auth, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM user_sessions WHERE id = $1 AND user_id = $2',
      [req.params.sessionId, req.userId]
    );

    res.json({ success: true, message: 'Session revoked' });
  } catch (error) {
    console.error('Error revoking session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Revoke all other sessions
router.post('/sessions/revoke-all', auth, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM user_sessions WHERE user_id = $1 AND is_current = false',
      [req.userId]
    );

    res.json({ success: true, message: 'All other sessions revoked' });
  } catch (error) {
    console.error('Error revoking sessions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;