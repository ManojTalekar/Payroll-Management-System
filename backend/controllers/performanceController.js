const Performance = require("../models/Performance");

// @desc    Get performance reviews
// @route   GET /api/performance
// @access  Private
const getReviews = async (req, res, next) => {
  try {
    const { employeeId } = req.query;
    let query = {};
    if (employeeId) {
      query.employee = employeeId;
    }

    const reviews = await Performance.find(query)
      .populate("employee", "name employeeId email department designation")
      .populate("evaluatedBy", "name email role");

    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};

// @desc    Upsert performance review
// @route   POST /api/performance
// @access  Private (Admin/HR Only)
const upsertReview = async (req, res, next) => {
  try {
    const { employee, employeeId, rating, comments, reward, coding, teamwork, delivery } = req.body;
    const targetEmployee = employee || employeeId;

    if (!targetEmployee || !rating || !comments) {
      return res.status(400).json({ success: false, message: "Please provide employee, rating and comments" });
    }

    // Find and update or create
    let review = await Performance.findOne({ employee: targetEmployee });

    if (review) {
      review.rating = rating;
      review.comments = comments;
      review.reward = reward || "None";
      review.coding = coding !== undefined ? coding : review.coding;
      review.teamwork = teamwork !== undefined ? teamwork : review.teamwork;
      review.delivery = delivery !== undefined ? delivery : review.delivery;
      review.evaluatedBy = req.user.id;
      await review.save();
    } else {
      review = await Performance.create({
        employee: targetEmployee,
        rating,
        comments,
        reward: reward || "None",
        coding: coding !== undefined ? coding : 50,
        teamwork: teamwork !== undefined ? teamwork : 50,
        delivery: delivery !== undefined ? delivery : 50,
        evaluatedBy: req.user.id
      });
    }

    // Populate references before sending response
    const populated = await Performance.findById(review._id)
      .populate("employee", "name employeeId email department designation")
      .populate("evaluatedBy", "name email role");

    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getReviews,
  upsertReview
};
