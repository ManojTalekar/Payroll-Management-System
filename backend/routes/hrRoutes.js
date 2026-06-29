const express = require("express");
const router = express.Router();
const {
  getDepartments, createDepartment, deleteDepartment,
  getDesignations, createDesignation, deleteDesignation,
  getShifts, createShift, deleteShift,
  getHolidays, createHoliday, deleteHoliday,
  getCompanyProfile, updateCompanyProfile,
  getDocuments, uploadDocument, deleteDocument
} = require("../controllers/hrController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

// Departments
router.get("/departments", protect, getDepartments);
router.post("/departments", protect, authorize("admin"), createDepartment);
router.delete("/departments/:id", protect, authorize("admin"), deleteDepartment);

// Designations
router.get("/designations", protect, getDesignations);
router.post("/designations", protect, authorize("admin"), createDesignation);
router.delete("/designations/:id", protect, authorize("admin"), deleteDesignation);

// Shifts
router.get("/shifts", protect, getShifts);
router.post("/shifts", protect, authorize("admin"), createShift);
router.delete("/shifts/:id", protect, authorize("admin"), deleteShift);

// Holidays
router.get("/holidays", protect, getHolidays);
router.post("/holidays", protect, authorize("admin"), createHoliday);
router.delete("/holidays/:id", protect, authorize("admin"), deleteHoliday);

// Company
router.get("/company", protect, getCompanyProfile);
router.put("/company", protect, authorize("admin"), updateCompanyProfile);

// Documents
router.get("/documents", protect, getDocuments);
router.post("/documents/upload", protect, upload.single("file"), uploadDocument);
router.delete("/documents/:id", protect, deleteDocument);

module.exports = router;
