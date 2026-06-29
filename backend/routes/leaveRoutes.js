const express = require("express");
const router = express.Router();
const { getLeaves, applyLeave, updateLeaveStatus, getLeaveBalance } = require("../controllers/leaveController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, getLeaves);
router.get("/me/balance", protect, getLeaveBalance);
router.post("/", protect, applyLeave);
router.put("/:id", protect, authorize("admin"), updateLeaveStatus);

module.exports = router;
