const express = require("express");
const router = express.Router();
const { getReviews, upsertReview } = require("../controllers/performanceController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.route("/")
  .get(protect, getReviews)
  .post(protect, authorize("admin"), upsertReview);

module.exports = router;
