const express = require("express");
const auth = require("../middleware/authMiddleware");
const {
  generateSchedule,
  getSchedule,
  markCompleted,
} = require("../controllers/scheduleController");

const router = express.Router();

router.post("/generate/:childId", auth, generateSchedule);
router.get("/:childId", auth, getSchedule);
router.put("/complete", auth, markCompleted);

module.exports = router;