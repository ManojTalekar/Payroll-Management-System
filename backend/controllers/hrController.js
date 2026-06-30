const Department = require("../models/Department");
const Designation = require("../models/Designation");
const Shift = require("../models/Shift");
const Holiday = require("../models/Holiday");
const Company = require("../models/Company");
const Document = require("../models/Document");
const fs = require("fs");
const path = require("path");
const Announcement = require("../models/Announcement");
const { uploadToCloudinary } = require("../services/cloudinaryService");

// ==========================================
// 1. DEPARTMENTS
// ==========================================
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find();
    res.json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  const { name, code, description } = req.body;
  try {
    const department = await Department.create({ name, code, description });
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. DESIGNATIONS
// ==========================================
const getDesignations = async (req, res, next) => {
  try {
    const designations = await Designation.find().populate("department");
    res.json({ success: true, data: designations });
  } catch (error) {
    next(error);
  }
};

const createDesignation = async (req, res, next) => {
  const { title, department, description } = req.body;
  try {
    const designation = await Designation.create({ title, department, description });
    res.status(201).json({ success: true, data: designation });
  } catch (error) {
    next(error);
  }
};

const deleteDesignation = async (req, res, next) => {
  try {
    await Designation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Designation deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. SHIFTS
// ==========================================
const getShifts = async (req, res, next) => {
  try {
    const shifts = await Shift.find();
    res.json({ success: true, data: shifts });
  } catch (error) {
    next(error);
  }
};

const createShift = async (req, res, next) => {
  const { name, start, end } = req.body;
  try {
    const shift = await Shift.create({ name, start, end });
    res.status(201).json({ success: true, data: shift });
  } catch (error) {
    next(error);
  }
};

const deleteShift = async (req, res, next) => {
  try {
    await Shift.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Shift pattern deleted" });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. HOLIDAYS
// ==========================================
const getHolidays = async (req, res, next) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json({ success: true, data: holidays });
  } catch (error) {
    next(error);
  }
};

const createHoliday = async (req, res, next) => {
  const { name, date } = req.body;
  try {
    const holiday = await Holiday.create({ name, date });
    res.status(201).json({ success: true, data: holiday });
  } catch (error) {
    next(error);
  }
};

const deleteHoliday = async (req, res, next) => {
  try {
    await Holiday.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Holiday removed successfully" });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. COMPANY DETAILS & SETTINGS
// ==========================================
const getCompanyProfile = async (req, res, next) => {
  try {
    let company = await Company.findOne();
    if (!company) {
      company = await Company.create({});
    }
    res.json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

const updateCompanyProfile = async (req, res, next) => {
  try {
    let company = await Company.findOne();
    if (!company) {
      company = new Company();
    }

    Object.assign(company, req.body);
    company.updatedAt = Date.now();
    await company.save();

    res.json({ success: true, message: "Company profile updated", data: company });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. DOCUMENTS
// ==========================================
const getDocuments = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === "employee") {
      query.employee = req.user.employeeRef._id;
    } else {
      const { employeeId } = req.query;
      if (employeeId) {
        query.employee = employeeId;
      }
    }

    const docs = await Document.find(query).populate("employee", "name employeeId");
    res.json({ success: true, data: docs });
  } catch (error) {
    next(error);
  }
};

const uploadDocument = async (req, res, next) => {
  const { type, employeeId } = req.body;

  if (!req.file || !type) {
    return res.status(400).json({ success: false, message: "Please provide a file and document type" });
  }

  try {
    const targetEmployeeId = req.user.role === "employee" ? req.user.employeeRef._id : employeeId;

    if (!targetEmployeeId) {
      return res.status(400).json({ success: false, message: "Employee identifier is required" });
    }

    // Upload to Cloudinary or fallback locally
    const uploadResult = await uploadToCloudinary(req.file.path, "employee_credentials");

    const doc = await Document.create({
      employee: targetEmployeeId,
      name: req.file.originalname,
      type,
      fileUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id
    });

    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    // Authorization check
    if (req.user.role === "employee" && doc.employee.toString() !== req.user.employeeRef._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this document" });
    }

    // Remove local file if it exists and path matches
    if (doc.fileUrl.startsWith("/uploads/")) {
      const localPath = require("path").join(__dirname, "..", doc.fileUrl);
      if (require("fs").existsSync(localPath)) {
        require("fs").unlinkSync(localPath);
      }
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Document removed successfully" });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 7. ANNOUNCEMENTS
// ==========================================
const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (error) {
    next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  const { title, content, type, date } = req.body;
  try {
    const announcement = await Announcement.create({ title, content, type, date });
    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    next(error);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Announcement deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  deleteDepartment,
  getDesignations,
  createDesignation,
  deleteDesignation,
  getShifts,
  createShift,
  deleteShift,
  getHolidays,
  createHoliday,
  deleteHoliday,
  getCompanyProfile,
  updateCompanyProfile,
  getDocuments,
  uploadDocument,
  deleteDocument,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
};
