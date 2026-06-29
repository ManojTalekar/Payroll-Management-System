const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema({
  candidateId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  stage: {
    type: String,
    enum: ["Applied", "Interview Scheduled", "Offered", "Rejected"],
    default: "Applied"
  }
}, { timestamps: true });

module.exports = mongoose.model("Candidate", CandidateSchema);
