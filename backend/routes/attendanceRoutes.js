const express = require("express");
const router = express.Router();
const { getAttendance, checkIn, checkOut } = require("../controllers/attendanceController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getAttendance);
router.post("/check-in", protect, checkIn);
router.post("/check-out", protect, checkOut);

module.exports = router;
