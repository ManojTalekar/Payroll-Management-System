const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    type: String, // "09:05"
    default: ""
  },
  checkOut: {
    type: String, // "18:02"
    default: ""
  },
  status: {
    type: String,
    enum: ["Present", "Absent", "Late", "Half-Day"],
    default: "Absent"
  },
  workingHours: {
    type: Number,
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  lateEntry: {
    type: Boolean,
    default: false
  },
  checkInLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String, default: "" }
  },
  checkOutLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String, default: "" }
  },
  deviceType: {
    type: String,
    default: "Web"
  },
  checkInIp: {
    type: String,
    default: ""
  },
  checkOutIp: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a single attendance record per employee per day
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);
