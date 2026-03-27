const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// =============================================
// GET SCHEDULE FOR A CHILD - FIXED
// =============================================
router.get('/schedule/:childId', auth, async (req, res) => {
  try {
    // Verify child belongs to user
    const childCheck = await db.query(
      'SELECT id FROM children WHERE id = $1 AND user_id = $2',
      [req.params.childId, req.userId]
    );

    if (childCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Get upcoming vaccinations
    const upcomingResult = await db.query(
      `SELECT cvs.id, cvs.scheduled_date, cvs.status,
              v.id as vaccine_id, v.vaccine_name, v.description, 
              v.dose_number, v.recommended_age_years, v.recommended_age_months,
              v.is_mandatory
       FROM child_vaccine_schedule cvs
       JOIN vaccines v ON cvs.vaccine_id = v.id
       WHERE cvs.child_id = $1 AND cvs.status IN ('due', 'overdue')
       ORDER BY cvs.scheduled_date ASC`,
      [req.params.childId]
    );

    // Get completed vaccinations
    const completedResult = await db.query(
      `SELECT vr.id, vr.date_administered, vr.clinic_name, 
              vr.doctor_name, vr.notes,
              v.vaccine_name, v.description, v.dose_number,
              cvs.scheduled_date
       FROM vaccination_records vr
       JOIN child_vaccine_schedule cvs ON vr.child_schedule_id = cvs.id
       JOIN vaccines v ON cvs.vaccine_id = v.id
       WHERE cvs.child_id = $1 AND cvs.status = 'completed'
       ORDER BY vr.date_administered DESC`,
      [req.params.childId]
    );

    // Mark overdue vaccines
    const today = new Date().toISOString().split('T')[0];
    for (const vaccine of upcomingResult.rows) {
      if (vaccine.scheduled_date < today && vaccine.status === 'due') {
        await db.query(
          'UPDATE child_vaccine_schedule SET status = $1 WHERE id = $2',
          ['overdue', vaccine.id]
        );
        vaccine.status = 'overdue';
      }
    }

    res.json({
      success: true,
      upcoming: upcomingResult.rows,
      completed: completedResult.rows
    });

  } catch (error) {
    console.error('Error fetching schedule:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
});

// =============================================
// GET HISTORY FOR A CHILD - FIXED
// =============================================
router.get('/history/:childId', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT vr.id, vr.date_administered, vr.clinic_name, 
              vr.doctor_name, vr.notes,
              v.vaccine_name, v.description, v.dose_number,
              cvs.scheduled_date
       FROM vaccination_records vr
       JOIN child_vaccine_schedule cvs ON vr.child_schedule_id = cvs.id
       JOIN vaccines v ON cvs.vaccine_id = v.id
       WHERE cvs.child_id = $1 AND cvs.status = 'completed'
       ORDER BY vr.date_administered DESC`,
      [req.params.childId]
    );

    res.json({
      success: true,
      history: result.rows
    });

  } catch (error) {
    console.error('Error fetching history:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
});

// =============================================
// ADD VACCINATION RECORD (MARK AS COMPLETED)
// =============================================
router.post('/record', auth, async (req, res) => {
  const { child_schedule_id, date_administered, clinic_name, doctor_name, notes } = req.body;

  if (!child_schedule_id || !date_administered) {
    return res.status(400).json({ error: 'Schedule ID and date are required' });
  }

  try {
    // Verify the schedule belongs to user's child
    const scheduleCheck = await db.query(
      `SELECT cvs.id, cvs.child_id 
       FROM child_vaccine_schedule cvs
       JOIN children c ON cvs.child_id = c.id
       WHERE cvs.id = $1 AND c.user_id = $2`,
      [child_schedule_id, req.userId]
    );

    if (scheduleCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Start transaction
    await db.query('BEGIN');

    // Insert vaccination record
    const recordResult = await db.query(
      `INSERT INTO vaccination_records 
       (child_schedule_id, date_administered, clinic_name, doctor_name, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, date_administered, clinic_name, doctor_name, notes`,
      [child_schedule_id, date_administered, clinic_name, doctor_name, notes]
    );

    // Update schedule status to completed
    await db.query(
      `UPDATE child_vaccine_schedule 
       SET status = 'completed' 
       WHERE id = $1`,
      [child_schedule_id]
    );

    // Commit transaction
    await db.query('COMMIT');

    res.status(201).json({
      success: true,
      record: recordResult.rows[0]
    });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error adding vaccination record:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
// GET ALL CLINICS
// =============================================
router.get('/clinics', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, clinic_name, address, city, contact_number, email,
              latitude, longitude, pincode, website, opening_hours
       FROM clinics
       ORDER BY clinic_name`
    );

    res.json({
      success: true,
      clinics: result.rows
    });

  } catch (error) {
    console.error('Error fetching clinics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
// GET ALL VACCINES - FIXED FOR YOUR DATABASE
// =============================================
router.get('/vaccines', auth, async (req, res) => {
  try {
    console.log('Fetching vaccines from database...');
    
    const result = await db.query(
      `SELECT id, 
              vaccine_name, 
              description, 
              recommended_age_years, 
              recommended_age_months,
              dose_number, 
              is_mandatory
       FROM vaccines
       ORDER BY recommended_age_years ASC, recommended_age_months ASC, dose_number ASC`
    );

    console.log(`Found ${result.rows.length} vaccines`);

    const vaccines = result.rows.map(vaccine => ({
      id: vaccine.id,
      vaccine_name: vaccine.vaccine_name,
      description: vaccine.description,
      recommended_age_years: vaccine.recommended_age_years,
      recommended_age_months: vaccine.recommended_age_months,
      dose_number: vaccine.dose_number,
      is_mandatory: vaccine.is_mandatory
    }));

    res.json({
      success: true,
      vaccines: vaccines,
      count: vaccines.length
    });

  } catch (error) {
    console.error('Error fetching vaccines:', error);
    console.error('Error details:', error.message);
    
    res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching vaccines',
      message: error.message
    });
  }
});

// =============================================
// GET APPOINTMENTS FOR A CHILD
// =============================================
router.get('/appointments/:childId', auth, async (req, res) => {
  try {
    // Verify child belongs to user
    const childCheck = await db.query(
      'SELECT id FROM children WHERE id = $1 AND user_id = $2',
      [req.params.childId, req.userId]
    );

    if (childCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const result = await db.query(
      `SELECT a.id, a.appointment_date, a.time_slot, a.status, a.notes,
              v.vaccine_name, v.dose_number,
              c.clinic_name, c.address, c.contact_number
       FROM appointments a
       LEFT JOIN vaccines v ON a.vaccine_id = v.id
       LEFT JOIN clinics c ON a.clinic_id = c.id
       WHERE a.child_id = $1
       ORDER BY a.appointment_date ASC, a.time_slot ASC`,
      [req.params.childId]
    );

    res.json({
      success: true,
      appointments: result.rows
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
// SCHEDULE APPOINTMENT
// =============================================
// =============================================
// SCHEDULE APPOINTMENT - UPDATED to handle clinic_name and doctor_name
// =============================================
router.post('/appointment', auth, async (req, res) => {
  const { child_id, vaccine_id, clinic_name, appointment_date, time_slot, doctor_name, notes } = req.body;

  if (!child_id || !vaccine_id || !appointment_date || !time_slot) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Verify child belongs to user
    const childCheck = await db.query(
      'SELECT id, full_name FROM children WHERE id = $1 AND user_id = $2',
      [child_id, req.userId]
    );

    if (childCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Get vaccine details
    const vaccineResult = await db.query(
      'SELECT vaccine_name, dose_number FROM vaccines WHERE id = $1',
      [vaccine_id]
    );

    // Create appointment with clinic_name and doctor_name in notes or separate fields
    // Since your appointments table might not have clinic_name and doctor_name columns,
    // we'll add them to notes or you need to alter your table
    const fullNotes = `Clinic: ${clinic_name || 'Not specified'}\nDoctor: ${doctor_name || 'Not specified'}\n${notes || ''}`.trim();

    const result = await db.query(
      `INSERT INTO appointments 
       (child_id, vaccine_id, appointment_date, time_slot, notes, status)
       VALUES ($1, $2, $3, $4, $5, 'scheduled')
       RETURNING id, child_id, appointment_date, time_slot, notes, status, created_at`,
      [child_id, vaccine_id, appointment_date, time_slot, fullNotes]
    );

    const appointment = result.rows[0];

    // Return formatted appointment with all needed data
    res.status(201).json({
      success: true,
      appointment: {
        id: appointment.id,
        child_id: appointment.child_id,
        child_name: childCheck.rows[0].full_name,
        vaccine_name: vaccineResult.rows[0]?.vaccine_name || 'Unknown Vaccine',
        dose_number: vaccineResult.rows[0]?.dose_number,
        appointment_date: appointment.appointment_date,
        time_slot: appointment.time_slot,
        clinic_name: clinic_name || null,
        doctor_name: doctor_name || null,
        notes: appointment.notes,
        status: appointment.status
      }
    });

  } catch (error) {
    console.error('Error scheduling appointment:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// =============================================
// CANCEL APPOINTMENT
// =============================================
router.put('/appointment/:id/cancel', auth, async (req, res) => {
  try {
    // Verify appointment belongs to user's child
    const checkResult = await db.query(
      `SELECT a.id 
       FROM appointments a
       JOIN children c ON a.child_id = c.id
       WHERE a.id = $1 AND c.user_id = $2`,
      [req.params.id, req.userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await db.query(
      `UPDATE appointments SET status = 'cancelled' WHERE id = $1`,
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
// DEBUG: Check database structure
// =============================================
router.get('/debug/check-db', auth, async (req, res) => {
  try {
    // Check if table exists
    const tableCheck = await db.query(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_name = 'vaccines'
       )`
    );
    
    if (!tableCheck.rows[0].exists) {
      return res.json({
        success: false,
        message: 'Vaccines table does not exist'
      });
    }
    
    // Get table structure
    const columns = await db.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'vaccines'
       ORDER BY ordinal_position`
    );
    
    // Get row count
    const count = await db.query('SELECT COUNT(*) FROM vaccines');
    
    // Get sample data
    const sample = await db.query('SELECT * FROM vaccines LIMIT 5');
    
    res.json({
      success: true,
      table_exists: true,
      columns: columns.rows,
      row_count: parseInt(count.rows[0].count),
      sample_data: sample.rows
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;