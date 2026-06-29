const express = require("express");
const router = express.Router();
const { getSalaries, generatePayroll, updateSalaryStatus } = require("../controllers/salaryController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, getSalaries);
router.post("/generate", protect, authorize("admin"), generatePayroll);
router.put("/:id/status", protect, authorize("admin"), updateSalaryStatus);

module.exports = router;
