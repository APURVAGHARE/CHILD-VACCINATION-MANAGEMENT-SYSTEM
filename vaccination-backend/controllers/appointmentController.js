const pool = require("../db");

exports.bookAppointment = async (req, res) => {
  try {
    const { childId, date, timeSlot } = req.body;

    const child = await pool.query(
      "SELECT id FROM children WHERE id=$1 AND user_id=$2",
      [childId, req.user.id]
    );

    if (child.rows.length === 0)
      return res.status(403).json({ message: "Unauthorized child access" });

    await pool.query(
      `INSERT INTO appointments 
       (child_id, appointment_date, time_slot)
       VALUES ($1,$2,$3)`,
      [childId, date, timeSlot || "10:00 AM"]
    );

    res.status(201).json({ message: "Appointment booked" });
  } catch (err) {
    res.status(500).json({ message: "Booking failed" });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, c.full_name
       FROM appointments a
       JOIN children c ON c.id = a.child_id
       WHERE c.user_id=$1
       ORDER BY appointment_date`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};