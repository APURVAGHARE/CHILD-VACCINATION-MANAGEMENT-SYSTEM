const pool = require("../db");

/* ================= GENERATE SCHEDULE ================= */
exports.generateSchedule = async (req, res) => {
  try {
    const { childId } = req.params;

    // Verify child belongs to logged-in parent
    const child = await pool.query(
      "SELECT date_of_birth FROM children WHERE id=$1 AND user_id=$2",
      [childId, req.user.id]
    );

    if (child.rows.length === 0)
      return res.status(403).json({ message: "Unauthorized child access" });

    const dob = child.rows[0].date_of_birth;

    const vaccines = await pool.query("SELECT * FROM vaccines");

    for (let v of vaccines.rows) {
      const scheduledDate = new Date(dob);

      scheduledDate.setFullYear(
        scheduledDate.getFullYear() + v.recommended_age_years
      );

      scheduledDate.setMonth(
        scheduledDate.getMonth() + v.recommended_age_months
      );

      await pool.query(
        `INSERT INTO child_vaccine_schedule
         (child_id, vaccine_id, scheduled_date, status)
         VALUES ($1,$2,$3,'pending')
         ON CONFLICT DO NOTHING`,
        [childId, v.id, scheduledDate]
      );
    }

    res.json({ message: "Schedule generated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Schedule generation failed" });
  }
};

/* ================= VIEW SCHEDULE ================= */
exports.getSchedule = async (req, res) => {
  try {
    const { childId } = req.params;

    const result = await pool.query(
      `SELECT 
         v.vaccine_name,
         cvs.scheduled_date,
         cvs.status
       FROM child_vaccine_schedule cvs
       JOIN vaccines v ON v.id = cvs.vaccine_id
       JOIN children c ON c.id = cvs.child_id
       WHERE cvs.child_id=$1 AND c.user_id=$2
       ORDER BY cvs.scheduled_date`,
      [childId, req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch schedule" });
  }
};

/* ================= MARK VACCINE COMPLETED ================= */
exports.markCompleted = async (req, res) => {
  try {
    const { childId, vaccineId } = req.body;

    const verify = await pool.query(
      `SELECT cvs.id
       FROM child_vaccine_schedule cvs
       JOIN children c ON c.id = cvs.child_id
       WHERE cvs.child_id=$1 AND cvs.vaccine_id=$2 AND c.user_id=$3`,
      [childId, vaccineId, req.user.id]
    );

    if (verify.rows.length === 0)
      return res.status(403).json({ message: "Unauthorized update" });

    await pool.query(
      `UPDATE child_vaccine_schedule
       SET status='completed'
       WHERE child_id=$1 AND vaccine_id=$2`,
      [childId, vaccineId]
    );

    res.json({ message: "Vaccine marked as completed" });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};