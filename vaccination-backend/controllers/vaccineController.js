const pool = require("../db");

exports.getVaccines = async (req, res) => {
  try {
    const search = req.query.search || "";

    const result = await pool.query(
      `SELECT * FROM vaccines
       WHERE vaccine_name ILIKE $1
       ORDER BY recommended_age_years, recommended_age_months`,
      [`%${search}%`]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch vaccines" });
  }
};