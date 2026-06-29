const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  joiningDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  salary: {
    type: Number,
    required: true,
    default: 0
  },
  photo: {
    type: String,
    default: ""
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },
  designation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Designation"
  },
  shift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shift"
  },
  performanceStars: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  skills: {
    type: [String],
    default: []
  },
  emergencyContact: {
    name: { type: String, default: "" },
    relationship: { type: String, default: "" },
    phone: { type: String, default: "" }
  },
  bankDetails: {
    accountNumber: { type: String, default: "" },
    bankName: { type: String, default: "" },
    ifscCode: { type: String, default: "" },
    branch: { type: String, default: "" }
  },
  pan: {
    type: String,
    default: ""
  },
  aadhaar: {
    type: String,
    default: ""
  },
  bloodGroup: {
    type: String,
    default: ""
  },
  experienceYears: {
    type: Number,
    default: 0
  },
  education: {
    type: String,
    default: ""
  },
  employmentStatus: {
    type: String,
    enum: ["Full-time", "Part-time", "Intern", "Contractor"],
    default: "Full-time"
  },
  status: {
    type: String,
    enum: ["Active", "Terminated", "On Leave"],
    default: "Active"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Employee", EmployeeSchema);
