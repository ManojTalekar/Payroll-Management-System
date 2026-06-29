const mongoose = require("mongoose");

const SalarySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  month: {
    type: Number, // 1-12
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  basicSalary: {
    type: Number,
    required: true
  },
  hra: {
    type: Number,
    default: 0
  },
  da: {
    type: Number,
    default: 0
  },
  bonus: {
    type: Number,
    default: 0
  },
  allowance: {
    type: Number,
    default: 0
  },
  pf: {
    type: Number,
    default: 0
  },
  esi: {
    type: Number,
    default: 0
  },
  professionalTax: {
    type: Number,
    default: 0
  },
  incomeTax: {
    type: Number,
    default: 0
  },
  loanDeduction: {
    type: Number,
    default: 0
  },
  overtimePay: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["Paid", "Unpaid"],
    default: "Unpaid"
  },
  paidOn: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a single salary record per employee per month
SalarySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Salary", SalarySchema);
