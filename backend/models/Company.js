const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "TechNova Solutions Pvt Ltd"
  },
  address: {
    type: String,
    default: "Building 4B, Cyber City, Sector 24, Gurugram, Haryana - 122002"
  },
  email: {
    type: String,
    default: "info@technova.com"
  },
  phone: {
    type: String,
    default: "+91 124 4567890"
  },
  website: {
    type: String,
    default: "https://www.technova.com"
  },
  logo: {
    type: String,
    default: ""
  },
  weekendRule: {
    type: String,
    enum: ["Sunday", "Saturday & Sunday", "Alternate Saturdays & Sunday"],
    default: "Sunday"
  },
  leavesConfig: {
    casualLimit: { type: Number, default: 12 },
    sickLimit: { type: Number, default: 10 },
    paidLimit: { type: Number, default: 15 }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Company", CompanySchema);
