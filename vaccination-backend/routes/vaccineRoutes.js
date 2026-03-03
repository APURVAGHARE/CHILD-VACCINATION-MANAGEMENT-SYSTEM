const express = require("express");
const { getVaccines } = require("../controllers/vaccineController");

const router = express.Router();

router.get("/", getVaccines);

module.exports = router;