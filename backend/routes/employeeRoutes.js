const express = require("express");
const router = express.Router();
const { 
  getEmployees, 
  getEmployeeById, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee,
  getProfile
} = require("../controllers/employeeController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

router.get("/", protect, getEmployees);
router.get("/me/profile", protect, getProfile);
router.get("/:id", protect, getEmployeeById);
router.post("/", protect, authorize("admin"), upload.single("photo"), createEmployee);
router.put("/:id", protect, upload.single("photo"), updateEmployee);
router.delete("/:id", protect, authorize("admin"), deleteEmployee);

module.exports = router;
