const mongoose = require("mongoose");
const User = require("../models/User");
const Employee = require("../models/Employee");
const dotenv = require("dotenv");

dotenv.config();

const debug = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hrms_db";
  console.log("Connecting to:", uri);
  await mongoose.connect(uri);

  const users = await User.find().populate("employeeRef");
  console.log(`Found ${users.length} users:`);
  for (const u of users.slice(0, 5)) {
    console.log(`Email: ${u.email}, Role: ${u.role}, PasswordHash: ${u.password}, HasEmployeeRef: ${!!u.employeeRef}`);
  }

  // Test admin login using admin@technova.com
  const admin = await User.findOne({ email: "admin@technova.com" });
  if (admin) {
    const isMatch = await admin.comparePassword("1234");
    console.log("Admin password match for '1234':", isMatch);
  } else {
    console.log("Admin user not found by email!");
  }

  // Test employee login using amit.sharma@technova.com
  const emp = await User.findOne({ email: "amit.sharma@technova.com" });
  if (emp) {
    const isMatch = await emp.comparePassword("1234");
    console.log("Employee password match for '1234':", isMatch);
  } else {
    console.log("Employee user not found by email!");
  }

  await mongoose.disconnect();
};

debug().catch(console.error);
