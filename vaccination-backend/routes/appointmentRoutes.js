const express = require("express");
const auth = require("../middleware/authMiddleware");
const {
  bookAppointment,
  getAppointments,
} = require("../controllers/appointmentController");

const router = express.Router();

router.post("/", auth, bookAppointment);
router.get("/", auth, getAppointments);

module.exports = router;