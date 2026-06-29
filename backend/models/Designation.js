const mongoose = require("mongoose");

const DesignationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure designation title is unique within a department
DesignationSchema.index({ title: 1, department: 1 }, { unique: true });

module.exports = mongoose.model("Designation", DesignationSchema);
