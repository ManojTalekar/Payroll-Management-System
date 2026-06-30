const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const Company = require("../models/Company");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendLeaveStatusEmail } = require("../services/emailService");

// @desc    Get all leave requests
// @route   GET /api/leaves
// @access  Private
const getLeaves = async (req, res, next) => {
  try {
    let query = {};

    // Force employees to retrieve only their own leaves
    if (req.user.role === "employee") {
      query.employee = req.user.employeeRef._id;
    } else {
      const { employeeId } = req.query;
      if (employeeId) {
        query.employee = employeeId;
      }
    }

    const leaves = await Leave.find(query)
      .populate("employee", "name employeeId email")
      .populate("approvedBy", "email role")
      .sort({ appliedOn: -1 });

    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply for a leave
// @route   POST /api/leaves
// @access  Private
const applyLeave = async (req, res, next) => {
  const { leaveType, startDate, endDate, reason } = req.body;

  if (!leaveType || !startDate || !endDate || !reason) {
    return res.status(400).json({ success: false, message: "Please provide all required fields" });
  }

  try {
    if (req.user.role === "admin") {
      return res.status(400).json({ success: false, message: "Administrators cannot apply for leave" });
    }

    const leave = await Leave.create({
      employee: req.user.employeeRef._id,
      leaveType,
      startDate,
      endDate,
      reason
    });

    // Create Notification for admin
    const emp = await Employee.findById(req.user.employeeRef._id);
    await Notification.create({
      title: "New Leave Request Submitted",
      message: `${emp.name} applied for ${leaveType} leave starting ${new Date(startDate).toLocaleDateString()}.`,
      type: "info"
    });

    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject leave request
// @route   PUT /api/leaves/:id
// @access  Private/Admin
const updateLeaveStatus = async (req, res, next) => {
  const { status } = req.body;

  if (!status || !["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status value" });
  }

  try {
    let leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: "Leave request not found" });
    }

    leave.status = status;
    leave.approvedBy = req.user._id;
    await leave.save();

    // Trigger Email and in-app Notification for the employee
    const employee = await Employee.findById(leave.employee);
    if (employee) {
      sendLeaveStatusEmail(employee, leave).catch(err => console.error("Email send failed:", err));
      
      const userAccount = await User.findOne({ employeeRef: employee._id });
      if (userAccount) {
        await Notification.create({
          recipient: userAccount._id,
          title: `Leave Request ${status}`,
          message: `Your requested leave of type ${leave.leaveType} is ${status}.`,
          type: status === "Approved" ? "success" : "danger"
        });
      }
    }

    res.json({ success: true, message: `Leave request status updated to ${status}`, data: leave });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leave balance statistics
// @route   GET /api/leaves/me/balance
// @access  Private
const getLeaveBalance = async (req, res, next) => {
  try {
    const employeeId = req.user.role === "employee" ? req.user.employeeRef._id : req.query.employeeId;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }

    // Retrieve active Company settings or fall back to default limit configurations
    const company = await Company.findOne();
    const config = company ? company.leavesConfig : { casualLimit: 12, sickLimit: 10, paidLimit: 15 };

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    // Fetch approved leaves of the employee for the current year
    const approvedLeaves = await Leave.find({
      employee: employeeId,
      status: "Approved",
      startDate: { $gte: startOfYear, $lte: endOfYear }
    });

    // Compute durations
    const countDays = (start, end) => {
      const diffTime = Math.abs(new Date(end) - new Date(start));
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
    };

    let usedCasual = 0;
    let usedSick = 0;
    let usedPaid = 0;

    approvedLeaves.forEach(l => {
      const days = countDays(l.startDate, l.endDate);
      if (l.leaveType === "Casual") usedCasual += days;
      else if (l.leaveType === "Sick") usedSick += days;
      else if (l.leaveType === "Paid") usedPaid += days;
    });

    res.json({
      success: true,
      balance: {
        Casual: { limit: config.casualLimit, used: usedCasual, balance: Math.max(0, config.casualLimit - usedCasual) },
        Sick: { limit: config.sickLimit, used: usedSick, balance: Math.max(0, config.sickLimit - usedSick) },
        Paid: { limit: config.paidLimit, used: usedPaid, balance: Math.max(0, config.paidLimit - usedPaid) }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaves,
  applyLeave,
  updateLeaveStatus,
  getLeaveBalance
};
