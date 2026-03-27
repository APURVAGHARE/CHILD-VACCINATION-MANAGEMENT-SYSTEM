const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// =============================================
// HELPER FUNCTION: Generate vaccination schedule
// =============================================
// Helper function to generate vaccination schedule
async function generateVaccinationSchedule(childId, birthDate) {
  try {
    // Get all vaccines from master table - using recommended_age_in_weeks
    const vaccines = await db.query(
      `SELECT id, vaccine_name, recommended_age_in_weeks, dose_number 
       FROM vaccines 
       WHERE recommended_age_in_weeks IS NOT NULL
       ORDER BY recommended_age_in_weeks, dose_number`
    );

    const birthDateTime = new Date(birthDate);
    const today = new Date();
    const schedules = [];

    for (const vaccine of vaccines.rows) {
      // Calculate scheduled date based on weeks
      const scheduledDate = new Date(birthDateTime);
      scheduledDate.setDate(birthDateTime.getDate() + (vaccine.recommended_age_in_weeks * 7));
      
      // Format as YYYY-MM-DD
      const year = scheduledDate.getFullYear();
      const month = String(scheduledDate.getMonth() + 1).padStart(2, '0');
      const day = String(scheduledDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      // Determine status
      let status = 'due';
      if (scheduledDate < today) {
        status = 'overdue';
      }

      // Insert into schedule
      const result = await db.query(
        `INSERT INTO child_vaccine_schedule 
         (child_id, vaccine_id, scheduled_date, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id, scheduled_date, status`,
        [childId, vaccine.id, formattedDate, status]
      );

      schedules.push({
        id: result.rows[0].id,
        vaccine_name: vaccine.vaccine_name,
        scheduled_date: formattedDate,
        status: status,
        dose_number: vaccine.dose_number
      });
    }

    console.log(`Generated ${schedules.length} vaccine schedules for child ${childId}`);
    return schedules;
    
  } catch (error) {
    console.error('Error generating vaccination schedule:', error);
    throw error;
  }
}
// =============================================
// GET ALL CHILDREN
// =============================================
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, full_name, date_of_birth, gender, blood_group, created_at
       FROM children 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.userId]
    );

    res.json({
      success: true,
      children: result.rows
    });

  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
// GET SINGLE CHILD
// =============================================
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, full_name, date_of_birth, gender, blood_group, created_at
       FROM children 
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }

    res.json({
      success: true,
      child: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching child:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
// ADD NEW CHILD (with auto-generated schedule)
// =============================================
router.post('/', auth, async (req, res) => {
  const { full_name, date_of_birth, gender, blood_group } = req.body;

  // Basic validation
  if (!full_name || !date_of_birth || !gender) {
    return res.status(400).json({ error: 'Name, date of birth, and gender are required' });
  }

  try {
    // Start transaction
    await db.query('BEGIN');

    // Insert child
    const childResult = await db.query(
      `INSERT INTO children (user_id, full_name, date_of_birth, gender, blood_group)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, date_of_birth, gender, blood_group, created_at`,
      [req.userId, full_name, date_of_birth, gender, blood_group || null]
    );

    const child = childResult.rows[0];

    // Auto-generate vaccination schedule
    const schedules = await generateVaccinationSchedule(child.id, date_of_birth);

    // Commit transaction
    await db.query('COMMIT');

    res.status(201).json({
      success: true,
      child: child,
      schedules_generated: schedules.length,
      message: `Child added successfully with ${schedules.length} vaccine schedules`
    });

  } catch (error) {
    // Rollback in case of error
    await db.query('ROLLBACK');
    console.error('Error adding child:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
// UPDATE CHILD
// =============================================
router.put('/:id', auth, async (req, res) => {
  const { full_name, date_of_birth, gender, blood_group } = req.body;

  try {
    // First check if child belongs to user
    const checkResult = await db.query(
      'SELECT id, date_of_birth FROM children WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const oldChild = checkResult.rows[0];
    
    // Start transaction
    await db.query('BEGIN');

    // Update child
    const result = await db.query(
      `UPDATE children 
       SET full_name = COALESCE($1, full_name),
           date_of_birth = COALESCE($2, date_of_birth),
           gender = COALESCE($3, gender),
           blood_group = COALESCE($4, blood_group)
       WHERE id = $5 AND user_id = $6
       RETURNING id, full_name, date_of_birth, gender, blood_group, created_at`,
      [full_name, date_of_birth, gender, blood_group, req.params.id, req.userId]
    );

    // If date of birth changed, regenerate schedule
    if (date_of_birth && date_of_birth !== oldChild.date_of_birth) {
      // Delete old schedules
      await db.query(
        'DELETE FROM child_vaccine_schedule WHERE child_id = $1',
        [req.params.id]
      );
      
      // Generate new schedules
      await generateVaccinationSchedule(req.params.id, date_of_birth);
    }

    // Commit transaction
    await db.query('COMMIT');

    res.json({
      success: true,
      child: result.rows[0]
    });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error updating child:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
// DELETE CHILD
// =============================================
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if child exists and belongs to user
    const checkResult = await db.query(
      'SELECT id FROM children WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Delete child (cascades to schedules and records automatically)
    const result = await db.query(
      'DELETE FROM children WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );

    res.json({
      success: true,
      message: 'Child deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting child:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
// GET CHILD'S VACCINATION SUMMARY
// =============================================
router.get('/:id/summary', auth, async (req, res) => {
  try {
    // Check if child belongs to user
    const childCheck = await db.query(
      'SELECT id FROM children WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );

    if (childCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Get counts
    const counts = await db.query(
      `SELECT 
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'due' THEN 1 END) as due,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue,
        COUNT(*) as total
       FROM child_vaccine_schedule
       WHERE child_id = $1`,
      [req.params.id]
    );

    // Get next upcoming
    const upcoming = await db.query(
      `SELECT cvs.id, cvs.scheduled_date, v.vaccine_name
       FROM child_vaccine_schedule cvs
       JOIN vaccines v ON cvs.vaccine_id = v.id
       WHERE cvs.child_id = $1 AND cvs.status IN ('due', 'overdue')
       ORDER BY cvs.scheduled_date ASC
       LIMIT 1`,
      [req.params.id]
    );

    res.json({
      success: true,
      summary: {
        completed: parseInt(counts.rows[0].completed),
        due: parseInt(counts.rows[0].due),
        overdue: parseInt(counts.rows[0].overdue),
        total: parseInt(counts.rows[0].total),
        next_vaccine: upcoming.rows[0] || null
      }
    });

  } catch (error) {
    console.error('Error fetching child summary:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;