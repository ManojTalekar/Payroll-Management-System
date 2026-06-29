const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ["Resume", "Aadhaar", "PAN", "Certificate", "OfferLetter", "AppointmentLetter", "ExperienceLetter"],
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    default: ""
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Document", DocumentSchema);
