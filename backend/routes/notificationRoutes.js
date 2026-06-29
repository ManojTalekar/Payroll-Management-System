const express = require("express");
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, createNotification } = require("../controllers/notificationController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, getNotifications);
router.put("/read-all", protect, markAllAsRead);
router.put("/:id/read", protect, markAsRead);
router.post("/", protect, authorize("admin", "hr"), createNotification);

module.exports = router;
