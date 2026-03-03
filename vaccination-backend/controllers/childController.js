const pool = require("../db");

exports.addChild = async (req, res) => {
  try {
    const { name, dob, gender, bloodGroup } = req.body;

    if (!name || !dob)
      return res.status(400).json({ message: "Name and DOB required" });

    const result = await pool.query(
      `INSERT INTO children 
       (user_id, full_name, date_of_birth, gender, blood_group)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [req.user.id, name, dob, gender, bloodGroup]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to add child" });
  }
};

exports.getChildren = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM children WHERE user_id=$1 ORDER BY id DESC",
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch children" });
  }
};