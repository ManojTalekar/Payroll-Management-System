const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema({
  interviewId: {
    type: String,
    required: true,
    unique: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate",
    required: true
  },
  candidateName: {
    type: String,
    required: true,
    trim: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  interviewer: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Interview", InterviewSchema);
