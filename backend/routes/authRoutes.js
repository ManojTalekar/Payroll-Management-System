const express = require("express");
const router = express.Router();
const { login, refresh, forgotPassword, resetPassword, changePassword, getActivityLogs, logout } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/login", login);
router.post("/refresh", refresh);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.put("/change-password", protect, changePassword);
router.post("/logout", protect, logout);
router.get("/activity-logs", protect, authorize("admin"), getActivityLogs);

module.exports = router;

