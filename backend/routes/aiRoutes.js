const express = require("express");
const router = express.Router();
const { chatbotReply, getAIAnalytics } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.post("/chat", protect, chatbotReply);
router.get("/analytics", protect, getAIAnalytics);

module.exports = router;
