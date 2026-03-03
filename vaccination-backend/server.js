const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "vaccination_db",
  password: "postgres",
  port: 5432,
});

/* ============================
   REGISTER USER
============================ */
app.post("/register", async (req, res) => {
  try {
    const { full_name, email, mobile, password_hash } = req.body;

    const result = await pool.query(
      `INSERT INTO users(full_name,email,mobile,password_hash)
       VALUES($1,$2,$3,$4) RETURNING id`,
      [full_name, email, mobile, password_hash]
    );

    res.json({ userId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   LOGIN USER
============================ */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT id, password_hash FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "User not found" });

    const user = result.rows[0];

    if (password !== user.password_hash)
      return res.status(401).json({ error: "Wrong password" });

    res.json({ userId: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   ADD CHILD
============================ */
app.post("/add-child", async (req, res) => {
  try {
    const { user_id, full_name, date_of_birth, gender, blood_group } = req.body;

    const result = await pool.query(
      `INSERT INTO children(user_id,full_name,date_of_birth,gender,blood_group)
       VALUES($1,$2,$3,$4,$5) RETURNING *`,
      [user_id, full_name, date_of_birth, gender, blood_group]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   GET CHILDREN OF USER
============================ */
app.get("/children/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM children WHERE user_id = $1`,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   SEARCH ALL VACCINES
============================ */
app.get("/vaccines", async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   GENERATE FULL SCHEDULE
============================ */
app.post("/generate-schedule/:child_id", async (req, res) => {
  try {
    const { child_id } = req.params;

    const child = await pool.query(
      `SELECT date_of_birth FROM children WHERE id = $1`,
      [child_id]
    );

    if (child.rows.length === 0)
      return res.status(404).json({ message: "Child not found" });

    const dob = child.rows[0].date_of_birth;
    const vaccines = await pool.query(`SELECT * FROM vaccines`);

    for (let v of vaccines.rows) {
      const scheduledDate = new Date(dob);
      scheduledDate.setFullYear(
        scheduledDate.getFullYear() + v.recommended_age_years
      );
      scheduledDate.setMonth(
        scheduledDate.getMonth() + v.recommended_age_months
      );

      await pool.query(
        `INSERT INTO child_vaccine_schedule(child_id,vaccine_id,scheduled_date)
         VALUES($1,$2,$3)
         ON CONFLICT DO NOTHING`,
        [child_id, v.id, scheduledDate]
      );
    }

    res.json({ message: "Schedule generated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   VIEW CHILD SCHEDULE
============================ */
app.get("/schedule/:child_id", async (req, res) => {
  try {
    const { child_id } = req.params;

    const result = await pool.query(
      `SELECT 
         v.vaccine_name,
         cvs.scheduled_date,
         cvs.status
       FROM child_vaccine_schedule cvs
       JOIN vaccines v ON v.id = cvs.vaccine_id
       WHERE cvs.child_id = $1
       ORDER BY cvs.scheduled_date`,
      [child_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});