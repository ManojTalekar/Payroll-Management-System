const Employee = require("../models/Employee");
const User = require("../models/User");
const Department = require("../models/Department");
const Designation = require("../models/Designation");
const Shift = require("../models/Shift");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Salary = require("../models/Salary");
const Document = require("../models/Document");
const { uploadToCloudinary } = require("../middleware/uploadMiddleware");
const { sendWelcomeEmail } = require("../config/emailService");

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
const getEmployees = async (req, res, next) => {
  try {
    const { search, department } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (department) {
      query.department = department;
    }

    const employees = await Employee.find(query)
      .populate("department")
      .populate("designation")
      .populate("shift");

    res.json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate("department")
      .populate("designation")
      .populate("shift");

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private/Admin
const createEmployee = async (req, res, next) => {
  const { 
    name, email, phone, address, salary, department, designation, shift, joiningDate,
    pan, aadhaar, bloodGroup, experienceYears, education, employmentStatus, skills,
    emergencyContact, bankDetails
  } = req.body;

  if (!name || !email || !salary || !department) {
    return res.status(400).json({ success: false, message: "Please fill all required fields" });
  }

  try {
    // Check if email already exists
    const emailExists = await Employee.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    // Auto-generate employeeId
    const count = await Employee.countDocuments();
    const employeeId = "EMP" + String(count + 1).padStart(3, "0");

    let photoUrl = "";
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path, "employees_photos");
      photoUrl = uploadResult.secure_url;
    }

    // Helper to parse nested objects
    const parseNested = (val) => {
      if (typeof val === "string") {
        try { return JSON.parse(val); } catch(e) { return {}; }
      }
      return val || {};
    };

    // Create Employee record
    const employee = await Employee.create({
      employeeId,
      name,
      email,
      phone,
      address,
      salary: parseFloat(salary),
      photo: photoUrl,
      department: department || null,
      designation: designation || null,
      shift: shift || null,
      joiningDate: joiningDate || Date.now(),
      pan: pan || "",
      aadhaar: aadhaar || "",
      bloodGroup: bloodGroup || "",
      experienceYears: parseInt(experienceYears) || 0,
      education: education || "",
      employmentStatus: employmentStatus || "Full-time",
      skills: Array.isArray(skills) ? skills : (typeof skills === "string" ? skills.split(",").map(s => s.trim()).filter(Boolean) : []),
      emergencyContact: parseNested(emergencyContact),
      bankDetails: parseNested(bankDetails)
    });

    // Create associated User login account
    await User.create({
      email: email.toLowerCase(),
      password: "1234", // Default initial password
      role: "employee",
      employeeRef: employee._id
    });

    // Send Welcome Email
    sendWelcomeEmail(employee).catch(err => console.error("Welcome email error:", err));

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
const updateEmployee = async (req, res, next) => {
  try {
    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    // Authorization check: Employees can only edit their own profile
    if (req.user.role === "employee" && req.user.employeeRef._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this profile" });
    }

    const updates = { ...req.body };

    // Handle photo change
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.path, "employees_photos");
      updates.photo = uploadResult.secure_url;
    }

    // If updating email, check uniqueness and update User credential
    if (updates.email && updates.email.toLowerCase() !== employee.email.toLowerCase()) {
      const emailExists = await Employee.findOne({ email: updates.email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ success: false, message: "Email is already in use" });
      }
      updates.email = updates.email.toLowerCase();

      // Update associated User account email
      await User.findOneAndUpdate({ employeeRef: employee._id }, { email: updates.email });
    }

    employee = await Employee.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate("department").populate("designation").populate("shift");

    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    // Delete associated resources
    await User.findOneAndDelete({ employeeRef: employee._id });
    await Attendance.deleteMany({ employee: employee._id });
    await Leave.deleteMany({ employee: employee._id });
    await Salary.deleteMany({ employee: employee._id });
    await Document.deleteMany({ employee: employee._id });

    await Employee.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Employee and all linked records removed successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in profile details
// @route   GET /api/employees/me/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      return res.json({
        success: true,
        role: "admin",
        data: {
          name: "Administrator",
          email: req.user.email,
          createdAt: req.user.createdAt
        }
      });
    }

    const employee = await Employee.findById(req.user.employeeRef._id)
      .populate("department")
      .populate("designation")
      .populate("shift");

    res.json({
      success: true,
      role: "employee",
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getProfile
};
