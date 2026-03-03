// test.js
const pool = require('./db');

async function testDB() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log("Database connected successfully!");
    console.log(res.rows);
  } catch (err) {
    console.error("Connection error:", err.message);
  } finally {
    await pool.end(); // Close connection
  }
}

testDB();