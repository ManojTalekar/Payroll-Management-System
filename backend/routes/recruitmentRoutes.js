const express = require("express");
const router = express.Router();
const {
  getJobs,
  createJob,
  getCandidates,
  createCandidate,
  updateCandidateStage,
  getInterviews,
  createInterview
} = require("../controllers/recruitmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Jobs Routes
router.route("/jobs")
  .get(protect, getJobs)
  .post(protect, authorize("admin"), createJob);

// Candidates Routes
router.route("/candidates")
  .get(protect, getCandidates)
  .post(protect, authorize("admin"), createCandidate);

router.route("/candidates/:id/stage")
  .put(protect, authorize("admin"), updateCandidateStage);

// Interviews Routes
router.route("/interviews")
  .get(protect, getInterviews)
  .post(protect, authorize("admin"), createInterview);

module.exports = router;
