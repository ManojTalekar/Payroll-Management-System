const mongoose = require("mongoose");

const ShiftSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  start: {
    type: String,
    required: true, // "HH:MM" e.g. "09:00"
    trim: true
  },
  end: {
    type: String,
    required: true, // "HH:MM" e.g. "18:00"
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Shift", ShiftSchema);
