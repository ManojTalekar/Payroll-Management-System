const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  openings: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ["Active", "Closed"],
    default: "Active"
  }
}, { timestamps: true });

module.exports = mongoose.model("Job", JobSchema);
