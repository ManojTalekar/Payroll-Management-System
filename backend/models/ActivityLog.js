const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // Can be null if system-triggered or anonymous login failure
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  ipAddress: {
    type: String,
    default: ""
  },
  userAgent: {
    type: String,
    default: ""
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
