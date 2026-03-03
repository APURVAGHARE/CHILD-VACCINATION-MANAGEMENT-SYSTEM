const express = require("express");
const auth = require("../middleware/authMiddleware");
const { addChild, getChildren } = require("../controllers/childController");

const router = express.Router();

router.post("/", auth, addChild);
router.get("/", auth, getChildren);

module.exports = router;