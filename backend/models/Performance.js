const mongoose = require("mongoose");

const PerformanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
    unique: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comments: {
    type: String,
    required: true,
    trim: true
  },
  reward: {
    type: String,
    enum: ["None", "Star of the Month", "Team Player Award", "Exceptional Performance", "Innovator of the Quarter"],
    default: "None"
  },
  coding: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 50
  },
  teamwork: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 50
  },
  delivery: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 50
  },
  evaluatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Performance", PerformanceSchema);
