const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Designation = require("../models/Designation");
const Shift = require("../models/Shift");
const Holiday = require("../models/Holiday");
const Company = require("../models/Company");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Salary = require("../models/Salary");
const Document = require("../models/Document");
const Notification = require("../models/Notification");
const Performance = require("../models/Performance");
const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const Interview = require("../models/Interview");
const Announcement = require("../models/Announcement");

dotenv.config();

const firstNames = [
  "Amit", "Priya", "Rahul", "Neha", "Vikram", "Anjali", "Sanjay", "Ritu", "Deepak", "Sneha",
  "Alok", "Kiran", "Vijay", "Jyoti", "Sunil", "Aarti", "Manoj", "Meena", "Rajesh", "Pooja",
  "Aditya", "Shweta", "Suresh", "Divya", "Harish", "Preeti", "Karan", "Tanvi", "Arjun", "Kriti",
  "Rohan", "Rani", "Nitin", "Poonam", "Ajay", "Kavita", "Mohan", "Rekha", "Varun", "Simran",
  "Gaurav", "Nisha", "Manish", "Sapna", "Abhishek", "Kusum", "Vivek", "Pallavi", "Sandip", "Komal"
];

const lastNames = [
  "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Joshi", "Mehta", "Jha", "Mishra",
  "Trivedi", "Rao", "Nair", "Reddy", "Choudhury", "Bose", "Das", "Sen", "Roy", "Banerjee"
];

const cities = ["Gurugram", "Delhi", "Noida", "Mumbai", "Bengaluru", "Pune", "Hyderabad", "Chennai"];

const connectDB = require("../config/db");

const runSeeder = async () => {
  try {
    console.log("Seeding process started. Connecting to database...");
    await connectDB();

    // Clear existing DB tables
    await User.deleteMany();
    await Employee.deleteMany();
    await Department.deleteMany();
    await Designation.deleteMany();
    await Shift.deleteMany();
    await Holiday.deleteMany();
    await Company.deleteMany();
    await Attendance.deleteMany();
    await Leave.deleteMany();
    await Salary.deleteMany();
    await Document.deleteMany();
    await Notification.deleteMany();
    await Performance.deleteMany();
    await Job.deleteMany();
    await Candidate.deleteMany();
    await Interview.deleteMany();
    await Announcement.deleteMany();

    console.log("Database cleared. Seeding fresh parameters...");

    // 1. Create Company info
    const company = await Company.create({
      name: "TechNova Solutions Pvt Ltd",
      address: "Phase II, DLF Cyber City, Sector 24, Gurugram, Haryana - 122002",
      email: "hr@technova.com",
      phone: "+91 124 4920400",
      website: "https://www.technova.com",
      weekendRule: "Saturday & Sunday",
      leavesConfig: { casualLimit: 12, sickLimit: 10, paidLimit: 15 }
    });

    // 2. Create Shifts
    const shiftGeneral = await Shift.create({ name: "General Shift", start: "09:00", end: "18:00" });
    const shiftMorning = await Shift.create({ name: "Morning Shift", start: "06:00", end: "14:00" });
    const shiftNight = await Shift.create({ name: "Night Shift", start: "22:00", end: "06:00" });
    const shiftList = [shiftGeneral, shiftMorning, shiftNight];

    // 3. Create Holidays
    await Holiday.create([
      { name: "New Year's Day", date: new Date("2026-01-01") },
      { name: "Republic Day", date: new Date("2026-01-26") },
      { name: "Independence Day", date: new Date("2026-08-15") },
      { name: "Gandhi Jayanti", date: new Date("2026-10-02") },
      { name: "Diwali festival", date: new Date("2026-11-08") },
      { name: "Christmas Day", date: new Date("2026-12-25") }
    ]);

    // 4. Create 20 Departments
    const deptNames = [
      "Human Resources", "Information Technology", "Finance", "Marketing", "Sales",
      "Operations", "Customer Support", "Research & Development", "Legal", "Quality Assurance",
      "Product Management", "Business Development", "Procurement", "Administration", "Public Relations",
      "Security", "Facilities", "Strategy", "Logistics", "Training & Development"
    ];
    const deptCodes = [
      "HR", "IT", "FIN", "MKT", "SLS",
      "OPS", "CS", "RND", "LGL", "QA",
      "PRD", "BD", "PRO", "ADM", "PR",
      "SEC", "FAC", "STR", "LOG", "TRD"
    ];

    const departments = [];
    const designationsMap = {};

    for (let dIdx = 0; dIdx < 20; dIdx++) {
      const dept = await Department.create({
        name: deptNames[dIdx],
        code: deptCodes[dIdx],
        description: `${deptNames[dIdx]} department and logistics support`
      });
      departments.push(dept);

      // Create 2 Designations for each department
      const des1 = await Designation.create({ title: `${deptCodes[dIdx]} Associate`, department: dept._id });
      const des2 = await Designation.create({ title: `${deptCodes[dIdx]} Manager`, department: dept._id });
      designationsMap[dept._id.toString()] = [des1, des2];
    }
    console.log("20 Departments and 40 Designations created successfully.");

    // 5. Create Super Admin User
    const adminUser = new User({
      email: "admin@technova.com",
      password: "1234",
      role: "admin"
    });
    await adminUser.save();
    console.log("Super Admin account created (admin@technova.com / 1234)");

    // 6. Create 100 Employees (incorporating 15 HRs and Employees)
    const employeesList = [];

    // The first 15 employees will be designated as HR Users in Department 0 (Human Resources)
    const deptHR = departments[0]; // Human Resources
    const hrDesignations = designationsMap[deptHR._id.toString()];

    console.log("Generating 15 HR Users and Employee Profiles...");
    for (let i = 1; i <= 15; i++) {
      const fName = firstNames[i - 1];
      const lName = lastNames[(i - 1) % lastNames.length];
      const email = i === 1 ? "hr@technova.com" : `hr${i}@technova.com`;
      const phone = `+91 9999999${String(i).padStart(3, "0")}`;
      const joinDate = new Date("2025-01-15");

      const employee = await Employee.create({
        employeeId: `EMP_HR_${String(i).padStart(2, "0")}`,
        name: `${fName} ${lName}`,
        email,
        phone,
        address: "Phase II, DLF Cyber City, Sector 24, Gurugram, Haryana - 122002",
        joiningDate: joinDate,
        salary: 75000 + i * 1000,
        department: deptHR._id,
        designation: i === 1 ? hrDesignations[1]._id : hrDesignations[0]._id, // First is Manager, others are Associates
        shift: shiftGeneral._id,
        photo: `https://i.pravatar.cc/150?img=${i}`,
        performanceStars: 5,
        status: "Active"
      });

      await User.create({
        email,
        password: "1234",
        role: "hr",
        employeeRef: employee._id
      });
      employeesList.push(employee);
    }
    console.log("Default HR account created (hr@technova.com / 1234)");

    // Generate the remaining 85 Employees (16 to 100)
    console.log("Generating 85 general employee profiles...");
    for (let i = 16; i <= 100; i++) {
      const fName = firstNames[(i - 1) % firstNames.length];
      const lName = lastNames[(i - 1) % lastNames.length];
      
      // Default employee account will be employee 16 (employee@technova.com)
      const email = i === 16 ? "employee@technova.com" : `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@technova.com`;
      const phone = `+91 ${9000000000 + i * 2315}`;
      const city = cities[i % cities.length];
      const address = `Flat ${100 + i}, Highrise Heights, Sector 15, ${city}`;

      // Distribute evenly across remaining departments (IT, Finance, etc.)
      const deptIdx = 1 + ((i - 16) % 19); // Index 1 to 19 (excludes HR)
      const dept = departments[deptIdx];
      const deptDesig = designationsMap[dept._id.toString()];
      const designation = i % 5 === 0 ? deptDesig[1] : deptDesig[0]; // Manager every 5th employee
      const shift = shiftList[i % shiftList.length];

      const joinDate = new Date();
      joinDate.setDate(joinDate.getDate() - (45 + i * 5));

      const employee = await Employee.create({
        employeeId: "EMP" + String(i).padStart(3, "0"),
        name: `${fName} ${lName}`,
        email,
        phone,
        address,
        joiningDate: joinDate,
        salary: 40000 + (i % 10) * 4500,
        department: dept._id,
        designation: designation._id,
        shift: shift._id,
        photo: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
        performanceStars: 3 + (i % 3),
        status: "Active"
      });

      await User.create({
        email,
        password: "1234",
        role: "employee",
        employeeRef: employee._id
      });
      employeesList.push(employee);
    }
    console.log("Default Employee account created (employee@technova.com / 1234)");

    // 7. Seed 200 Attendance Records
    console.log("Seeding exactly 200 Attendance records...");
    const attendanceDates = [
      new Date("2026-06-25"),
      new Date("2026-06-26")
    ];

    // Seed 2 records for each of the 100 employees = 200 records
    let attCount = 0;
    for (let emp of employeesList) {
      for (let attDate of attendanceDates) {
        if (attCount >= 200) break;
        const rand = Math.random();
        let status = "Present";
        let checkIn = "09:00";
        let checkOut = "18:00";
        let workingHours = 9;
        let overtimeHours = 0;
        let lateEntry = false;

        if (rand < 0.05) {
          status = "Absent";
          checkIn = "";
          checkOut = "";
          workingHours = 0;
        } else if (rand < 0.15) {
          status = "Late";
          checkIn = "09:20";
          lateEntry = true;
          workingHours = 8.66;
        }

        await Attendance.create({
          employee: emp._id,
          date: attDate,
          checkIn,
          checkOut,
          status,
          workingHours,
          overtimeHours,
          lateEntry
        });
        attCount++;
      }
    }
    console.log(`Seeded ${attCount} Attendance logs.`);

    // 8. Seed 100 Salary Records (1 statement per employee)
    console.log("Seeding 100 Salary records...");
    let salCount = 0;
    for (let emp of employeesList) {
      if (salCount >= 100) break;
      const basic = emp.salary;
      const hra = Math.round(basic * 0.4);
      const da = Math.round(basic * 0.1);
      const pf = Math.round(basic * 0.12);
      const esi = Math.round(basic * 0.01);
      const netSalary = Math.round(basic + hra + da - (pf + esi));

      await Salary.create({
        employee: emp._id,
        month: 5,
        year: 2026,
        basicSalary: basic,
        hra,
        da,
        pf,
        esi,
        professionalTax: 200,
        incomeTax: 0,
        netSalary,
        status: "Paid",
        paidOn: new Date("2026-05-31")
      });
      salCount++;
    }
    console.log(`Seeded ${salCount} Salary slips.`);

    // 9. Seed 100 Leave Requests (1 request per employee)
    console.log("Seeding 100 Leave Requests...");
    const leaveTypes = ["Casual", "Sick", "Paid"];
    const leaveReasons = ["Medical checkup", "Family emergency", "Annual personal trip"];
    let leaveCount = 0;
    for (let emp of employeesList) {
      if (leaveCount >= 100) break;
      const leaveType = leaveTypes[leaveCount % leaveTypes.length];
      const reason = leaveReasons[leaveCount % leaveReasons.length];
      const startDate = new Date("2026-07-10");
      startDate.setDate(startDate.getDate() + (leaveCount % 10));
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 2);

      await Leave.create({
        employee: emp._id,
        leaveType,
        startDate,
        endDate,
        reason,
        status: leaveCount % 3 === 0 ? "Approved" : leaveCount % 3 === 1 ? "Pending" : "Rejected",
        approvedBy: leaveCount % 3 === 0 ? adminUser._id : undefined
      });
      leaveCount++;
    }
    console.log(`Seeded ${leaveCount} Leave records.`);

    // 10. Seed 100 Documents (1 document per employee)
    console.log("Seeding 100 Documents...");
    let docCount = 0;
    for (let emp of employeesList) {
      if (docCount >= 100) break;
      await Document.create({
        employee: emp._id,
        name: `${emp.name.toLowerCase().replace(" ", "_")}_identity.pdf`,
        type: "Aadhaar",
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      });
      docCount++;
    }
    console.log(`Seeded ${docCount} Document entries.`);

    // 11. Seed 50 Performance Reviews
    console.log("Seeding 50 Performance Reviews...");
    for (let i = 0; i < 50; i++) {
      const emp = employeesList[i];
      await Performance.create({
        employee: emp._id,
        rating: 3 + (i % 3),
        comments: "Exceeds expectations in core development sprints and metrics.",
        reward: i % 10 === 0 ? "Star of the Month" : "None",
        coding: 80 + (i % 20),
        teamwork: 85 + (i % 15),
        delivery: 80 + (i % 20),
        evaluatedBy: adminUser._id
      });
    }
    console.log("Seeded 50 Performance logs.");

    // 12. Seed 50 Recruitment Records (20 Jobs, 20 Candidates, 10 Interviews)
    console.log("Seeding 50 Recruitment Records...");
    const jobTitles = [
      "Software Engineer", "Frontend Dev", "HR Analyst", "Accountant", "Logistics Analyst",
      "Sales Representative", "DevOps Engineer", "SEO Specialist", "QA Architect", "Marketing Associate"
    ];

    const seededCandidates = [];

    // Create 20 Jobs
    for (let i = 1; i <= 20; i++) {
      await Job.create({
        jobId: `JOB_${String(i).padStart(3, "0")}`,
        title: jobTitles[i % jobTitles.length] + " " + (i > 10 ? "II" : "Lead"),
        department: departments[i % departments.length].name,
        openings: 1 + (i % 3),
        status: "Active"
      });
    }

    // Create 20 Candidates
    for (let i = 1; i <= 20; i++) {
      const can = await Candidate.create({
        candidateId: `CAN_${String(i).padStart(3, "0")}`,
        name: `Candidate ${i}`,
        email: `candidate${i}@gmail.com`,
        jobTitle: jobTitles[i % jobTitles.length],
        stage: i % 2 === 0 ? "Interview Scheduled" : "Applied"
      });
      seededCandidates.push(can);
    }

    // Create 10 Interviews
    for (let i = 1; i <= 10; i++) {
      const candidate = seededCandidates[i - 1];
      await Interview.create({
        interviewId: `INT_${String(i).padStart(3, "0")}`,
        candidate: candidate._id,
        candidateName: candidate.name,
        jobTitle: candidate.jobTitle,
        interviewer: "Admin Manager",
        date: "2026-07-15",
        time: "10:30"
      });
    }
    console.log("Seeded 50 total recruitment records (20 Jobs, 20 Candidates, 10 Interviews).");

    // 13. Seed 20 Announcements
    console.log("Seeding 20 Corporate Announcements...");
    const announcementTypes = ["Holiday", "Policy Update", "General", "Event"];
    for (let i = 1; i <= 20; i++) {
      await Announcement.create({
        title: `Announce Alert ${i}: New Corporate Policy Update`,
        content: `Details for announcement ${i}. We have updated our workflow structures and local settings guidelines.`,
        type: announcementTypes[i % announcementTypes.length],
        date: new Date()
      });
    }
    console.log("Seeded 20 Announcements.");

    // 14. Seed 20 Notifications
    console.log("Seeding 20 Notifications...");
    for (let i = 1; i <= 20; i++) {
      await Notification.create({
        title: `Broad Alert ${i}: Monthly Review Posted`,
        message: `Notification details ${i}. Please verify your details in the employee records board.`,
        type: i % 2 === 0 ? "success" : "info"
      });
    }
    console.log("Seeded 20 Notifications.");

    console.log("Seeding process completed successfully!");
    if (require.main === module) {
      await mongoose.connection.close();
      if (global.mongoServer) {
        await global.mongoServer.stop();
      }
    }
  } catch (error) {
    console.error("Seeder runtime failure:", error.message);
    if (require.main === module) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

if (require.main === module) {
  runSeeder();
}

module.exports = runSeeder;
