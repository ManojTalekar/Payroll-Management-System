const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const Shift = require("../models/Shift");

// Helper to convert time string (HH:MM) to minutes
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

// @desc    Get attendance logs
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res, next) => {
  try {
    const { employeeId, month, year } = req.query;
    let query = {};

    // If roles is employee, force own logs
    if (req.user.role === "employee") {
      query.employee = req.user.employeeRef._id;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendanceLogs = await Attendance.find(query)
      .populate("employee", "name employeeId email")
      .sort({ date: -1 });

    res.json({ success: true, count: attendanceLogs.length, data: attendanceLogs });
  } catch (error) {
    next(error);
  }
};

// @desc    Record Check In
// @route   POST /api/attendance/check-in
// @access  Private
const checkIn = async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      return res.status(400).json({ success: false, message: "Administrators do not log attendance" });
    }

    const employee = await Employee.findById(req.user.employeeRef._id).populate("shift");
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee profile not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if attendance already recorded today
    let attendance = await Attendance.findOne({ employee: employee._id, date: today });

    if (attendance && attendance.checkIn) {
      return res.status(400).json({ success: false, message: "Already checked in today" });
    }

    const now = new Date();
    const checkInTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });

    // Determine late status based on shift
    let lateEntry = false;
    if (employee.shift) {
      const shiftMinutes = timeToMinutes(employee.shift.start);
      const checkInMinutes = timeToMinutes(checkInTime);
      // If checked in > 15 minutes after shift start, mark as late
      if (checkInMinutes > shiftMinutes + 15) {
        lateEntry = true;
      }
    } else {
      // Default general shift check: 09:15 AM limit
      if (timeToMinutes(checkInTime) > timeToMinutes("09:15")) {
        lateEntry = true;
      }
    }

    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
    const { latitude, longitude, deviceType } = req.body;

    if (!attendance) {
      attendance = new Attendance({
        employee: employee._id,
        date: today,
        checkIn: checkInTime,
        status: lateEntry ? "Late" : "Present",
        lateEntry,
        checkInLocation: { latitude, longitude, address: "DLF Cyber City HQ, Sector 24" },
        deviceType: deviceType || "Web",
        checkInIp: ipAddress
      });
    } else {
      attendance.checkIn = checkInTime;
      attendance.status = lateEntry ? "Late" : "Present";
      attendance.lateEntry = lateEntry;
      attendance.checkInLocation = { latitude, longitude, address: "DLF Cyber City HQ, Sector 24" };
      attendance.deviceType = deviceType || "Web";
      attendance.checkInIp = ipAddress;
    }

    await attendance.save();
    res.json({ success: true, message: "Checked In Successfully", data: attendance });
  } catch (error) {
    next(error);
  }
};

// @desc    Record Check Out
// @route   POST /api/attendance/check-out
// @access  Private
const checkOut = async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      return res.status(400).json({ success: false, message: "Administrators do not log attendance" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ employee: req.user.employeeRef._id, date: today });

    if (!attendance) {
      return res.status(400).json({ success: false, message: "You must check in first before checking out" });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ success: false, message: "Already checked out today" });
    }

    const now = new Date();
    const checkOutTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
    const { latitude, longitude } = req.body;

    attendance.checkOut = checkOutTime;
    attendance.checkOutLocation = { latitude, longitude, address: "DLF Cyber City HQ, Sector 24" };
    attendance.checkOutIp = ipAddress;

    // Calculate Working Hours
    if (attendance.checkIn) {
      const checkInMin = timeToMinutes(attendance.checkIn);
      const checkOutMin = timeToMinutes(checkOutTime);
      const diffMin = checkOutMin - checkInMin;
      const hours = parseFloat((diffMin / 60).toFixed(2));
      attendance.workingHours = hours;

      // Calculate Overtime (defined as working hours exceeding 8 hours)
      if (hours > 8) {
        attendance.overtimeHours = parseFloat((hours - 8).toFixed(2));
      }

      // Re-evaluate status based on working hours
      if (hours < 4) {
        attendance.status = "Half-Day";
      } else if (attendance.lateEntry) {
        attendance.status = "Late";
      } else {
        attendance.status = "Present";
      }
    }

    await attendance.save();
    res.json({ success: true, message: "Checked Out Successfully", data: attendance });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendance,
  checkIn,
  checkOut
};
