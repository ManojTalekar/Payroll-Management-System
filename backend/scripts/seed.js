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

dotenv.config();

// Realistic data pools for generating 100+ profiles
const firstNames = [
  "Amit", "Priya", "Rahul", "Neha", "Vikram", "Anjali", "Sanjay", "Ritu", "Deepak", "Sneha",
  "Alok", "Kiran", "Vijay", "Jyoti", "Sunil", "Aarti", "Manoj", "Meena", "Rajesh", "Pooja",
  "Aditya", "Shweta", "Suresh", "Divya", "Harish", "Preeti", "Karan", "Tanvi", "Arjun", "Kriti",
  "Rohan", "Rani", "Nitin", "Poonam", "Ajay", "Kavita", "Mohan", "Rekha", "Varun", "Simran",
  "Gaurav", "Nisha", "Manish", "Sapna", "Abhishek", "Kusum", "Vivek", "Pallavi", "Sandip", "Komal",
  "Rakesh", "Sonia", "Anil", "Bhawna", "Yash", "Dolly", "Kartik", "Kajal", "Dev", "Monika",
  "Pranav", "Nidhi", "Vinay", "Richa", "Hemant", "Ridhima", "Pankaj", "Vandana", "Ravi", "Garima"
];

const lastNames = [
  "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Joshi", "Mehta", "Jha", "Mishra",
  "Trivedi", "Rao", "Nair", "Reddy", "Choudhury", "Bose", "Das", "Sen", "Roy", "Banerjee",
  "Saxena", "Malhotra", "Kapoor", "Khanna", "Chawla", "Arora", "Bhatia", "Grover", "Jindal", "Garg",
  "Goel", "Bansal", "Mittal", "Shah", "Desai", "Kulkarni", "Patil", "Pillai", "Menon", "Balakrishnan"
];

const cities = ["Gurugram", "Delhi", "Noida", "Mumbai", "Bengaluru", "Pune", "Hyderabad", "Chennai"];

const runSeeder = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hrms_db");
    console.log("Seeding process started. Connecting to database...");

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
    const holidays = await Holiday.create([
      { name: "New Year's Day", date: new Date("2026-01-01") },
      { name: "Republic Day", date: new Date("2026-01-26") },
      { name: "Independence Day", date: new Date("2026-08-15") },
      { name: "Gandhi Jayanti", date: new Date("2026-10-02") },
      { name: "Diwali festival", date: new Date("2026-11-08") },
      { name: "Christmas Day", date: new Date("2026-12-25") }
    ]);

    // 4. Create Departments
    const deptHR = await Department.create({ name: "Human Resources", code: "HR", description: "Talent Management and culture" });
    const deptIT = await Department.create({ name: "Information Technology", code: "IT", description: "Engineering, QA and IT infrastructure" });
    const deptFinance = await Department.create({ name: "Finance", code: "FIN", description: "Accounting, payroll audits and billing" });
    const deptMarketing = await Department.create({ name: "Marketing", code: "MKT", description: "SEO, ads, content and events" });
    const deptSales = await Department.create({ name: "Sales", code: "SLS", description: "Enterprise deals and lead closings" });
    const deptOps = await Department.create({ name: "Operations", code: "OPS", description: "Workplace maintenance and logistical support" });
    
    const departments = [deptHR, deptIT, deptFinance, deptMarketing, deptSales, deptOps];

    // 5. Create Designations
    const designations = {};
    designations[deptHR.code] = await Designation.create([
      { title: "HR Analyst", department: deptHR._id },
      { title: "Talent Recruiter", department: deptHR._id },
      { title: "HR Manager", department: deptHR._id }
    ]);
    designations[deptIT.code] = await Designation.create([
      { title: "Software Engineer", department: deptIT._id },
      { title: "Senior Dev", department: deptIT._id },
      { title: "QA Specialist", department: deptIT._id },
      { title: "IT Director", department: deptIT._id }
    ]);
    designations[deptFinance.code] = await Designation.create([
      { title: "Accountant", department: deptFinance._id },
      { title: "Finance Associate", department: deptFinance._id },
      { title: "Audit Lead", department: deptFinance._id }
    ]);
    designations[deptMarketing.code] = await Designation.create([
      { title: "SEO Executive", department: deptMarketing._id },
      { title: "Content Manager", department: deptMarketing._id },
      { title: "Marketing VP", department: deptMarketing._id }
    ]);
    designations[deptSales.code] = await Designation.create([
      { title: "Sales Executive", department: deptSales._id },
      { title: "Account Representative", department: deptSales._id },
      { title: "Sales Director", department: deptSales._id }
    ]);
    designations[deptOps.code] = await Designation.create([
      { title: "Operations Analyst", department: deptOps._id },
      { title: "Logistics Manager", department: deptOps._id }
    ]);

    // 6. Create Admin User
    const adminUser = new User({
      email: "admin@technova.com",
      password: "1234", // Hashed by User Schema
      role: "admin"
    });
    await adminUser.save();

    console.log("Admin account created (admin@technova.com / 1234)");

    const employeesList = [];

    // 6.1 Create HR User and Employee Profile
    const hrEmp = await Employee.create({
      employeeId: "EMP_HR",
      name: "HR Executive",
      email: "hr@technova.com",
      phone: "+91 9999999991",
      address: "DLF Cyber City, Sector 24, Gurugram, Haryana - 122002",
      joiningDate: new Date("2025-01-15"),
      salary: 75000,
      department: deptHR._id,
      designation: designations[deptHR.code][2]._id, // HR Manager
      shift: shiftGeneral._id,
      photo: "https://i.pravatar.cc/150?img=10",
      performanceStars: 5,
      status: "Active"
    });
    
    await User.create({
      email: "hr@technova.com",
      password: "1234",
      role: "hr",
      employeeRef: hrEmp._id
    });
    employeesList.push(hrEmp);
    console.log("HR account created (hr@technova.com / 1234)");

    // 6.2 Create Manager User and Employee Profile
    const managerEmp = await Employee.create({
      employeeId: "EMP_MGR",
      name: "Ops Manager",
      email: "manager@technova.com",
      phone: "+91 9999999992",
      address: "DLF Cyber City, Sector 24, Gurugram, Haryana - 122002",
      joiningDate: new Date("2025-02-10"),
      salary: 90000,
      department: deptOps._id,
      designation: designations[deptOps.code][1]._id, // Logistics Manager
      shift: shiftGeneral._id,
      photo: "https://i.pravatar.cc/150?img=12",
      performanceStars: 5,
      status: "Active"
    });

    await User.create({
      email: "manager@technova.com",
      password: "1234",
      role: "manager",
      employeeRef: managerEmp._id
    });
    employeesList.push(managerEmp);
    console.log("Manager account created (manager@technova.com / 1234)");

    // 7. Generate 100 Employees (exactly as requested)
    console.log("Generating 100 realistic employee profiles...");

    for (let i = 1; i <= 100; i++) {
      let fName, lName, email, fullName;
      if (i === 1) {
        fName = "Amit";
        lName = "Sharma";
        email = "amit.sharma@technova.com";
        fullName = "Amit Sharma";
      } else if (i === 2) {
        fName = "Priya";
        lName = "Patel";
        email = "priya.patel@technova.com";
        fullName = "Priya Patel";
      } else if (i === 3) {
        fName = "Rahul";
        lName = "Verma";
        email = "rahul.verma@technova.com";
        fullName = "Rahul Verma";
      } else if (i === 4) {
        fName = "Neha";
        lName = "Gupta";
        email = "neha.gupta@technova.com";
        fullName = "Neha Gupta";
      } else if (i === 5) {
        fName = "Vikram";
        lName = "Singh";
        email = "vikram.singh@technova.com";
        fullName = "Vikram Singh";
      } else {
        fName = firstNames[Math.floor(Math.random() * firstNames.length)];
        lName = lastNames[Math.floor(Math.random() * lastNames.length)];
        if (fName === lName) {
          lName = lastNames[(Math.floor(Math.random() * lastNames.length) + 1) % lastNames.length];
        }
        fullName = `${fName} ${lName}`;
        email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@technova.com`;
      }
      const phone = `+91 ${9000000000 + Math.floor(Math.random() * 999999999)}`;
      const city = cities[Math.floor(Math.random() * cities.length)];
      const address = `Flat ${Math.floor(Math.random() * 500)}, Highrise Heights, Sector ${Math.floor(Math.random() * 120)}, ${city}`;
      
      const dept = departments[Math.floor(Math.random() * departments.length)];
      const desList = designations[dept.code];
      const designation = desList[Math.floor(Math.random() * desList.length)];
      const shift = shiftList[Math.floor(Math.random() * shiftList.length)];

      // Salary scale based on seniority or title
      let salary = 40000;
      if (designation.title.includes("Director") || designation.title.includes("VP") || designation.title.includes("Manager")) {
        salary = 95000 + Math.floor(Math.random() * 40000);
      } else if (designation.title.includes("Senior") || designation.title.includes("Lead") || designation.title.includes("Associate")) {
        salary = 65000 + Math.floor(Math.random() * 25000);
      } else {
        salary = 35000 + Math.floor(Math.random() * 15000);
      }

      // Random join date in past 2 years
      const joinDate = new Date();
      joinDate.setDate(joinDate.getDate() - (45 + Math.floor(Math.random() * 600)));

      const employee = await Employee.create({
        employeeId: "EMP" + String(i).padStart(3, "0"),
        name: fullName,
        email: email,
        phone: phone,
        address: address,
        joiningDate: joinDate,
        salary: salary,
        department: dept._id,
        designation: designation._id,
        shift: shift._id,
        photo: `https://i.pravatar.cc/150?img=${i % 70 + 1}`, // Pravatar service
        performanceStars: Math.floor(Math.random() * 3) + 3, // stars 3 to 5
        status: "Active"
      });

      // User account creation
      await User.create({
        email: email,
        password: "1234",
        role: "employee",
        employeeRef: employee._id
      });

      employeesList.push(employee);
    }


    console.log("Seeding historical Attendance logs for the past 20 working days...");
    const attendanceDates = [];
    const today = new Date();
    // Get last 28 days but skip weekends
    for (let dayOffset = 28; dayOffset >= 1; dayOffset--) {
      const d = new Date(today);
      d.setDate(today.getDate() - dayOffset);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6; // Sunday or Saturday
      if (!isWeekend) {
        d.setHours(0, 0, 0, 0);
        attendanceDates.push(d);
      }
    }

    // Seed attendance for each employee
    for (let emp of employeesList) {
      for (let attDate of attendanceDates) {
        const rand = Math.random();
        let status = "Present";
        let checkIn = "09:00";
        let checkOut = "18:00";
        let workingHours = 9;
        let overtimeHours = 1;
        let lateEntry = false;

        if (rand < 0.05) {
          status = "Absent";
          checkIn = "";
          checkOut = "";
          workingHours = 0;
          overtimeHours = 0;
        } else if (rand < 0.12) {
          status = "Late";
          checkIn = "09:25"; // late clock in
          checkOut = "18:00";
          workingHours = 8.58;
          overtimeHours = 0.58;
          lateEntry = true;
        } else if (rand < 0.15) {
          status = "Half-Day";
          checkIn = "09:00";
          checkOut = "12:45"; // early departure
          workingHours = 3.75;
          overtimeHours = 0;
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
      }
    }

    console.log("Seeding Leaves history (approved, pending, rejected)...");
    const leaveTypes = ["Casual", "Sick", "Paid"];
    const leaveReasons = [
      "Family gathering in native town",
      "Experiencing high fever and cold",
      "Personal bank appointments and dental treatment",
      "Urgent domestic renovation work",
      "Going on vacation with family"
    ];

    // Seed 2 leave requests per employee
    for (let emp of employeesList) {
      const lType1 = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
      const lReason1 = leaveReasons[Math.floor(Math.random() * leaveReasons.length)];
      const start1 = new Date();
      start1.setDate(today.getDate() - (5 + Math.floor(Math.random() * 20)));
      const end1 = new Date(start1);
      end1.setDate(start1.getDate() + 2);

      await Leave.create({
        employee: emp._id,
        leaveType: lType1,
        startDate: start1,
        endDate: end1,
        reason: lReason1,
        status: "Approved",
        approvedBy: adminUser._id
      });

      // Pending/rejected future leave
      const lType2 = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
      const lReason2 = leaveReasons[Math.floor(Math.random() * leaveReasons.length)];
      const start2 = new Date();
      start2.setDate(today.getDate() + (3 + Math.floor(Math.random() * 15)));
      const end2 = new Date(start2);
      end2.setDate(start2.getDate() + 1);

      await Leave.create({
        employee: emp._id,
        leaveType: lType2,
        startDate: start2,
        endDate: end2,
        reason: lReason2,
        status: Math.random() > 0.4 ? "Pending" : "Rejected"
      });
    }

    console.log("Seeding Salary statements for past 2 months (April & May 2026)...");
    // Generate slips
    const monthsToSeed = [
      { m: 4, y: 2026 },
      { m: 5, y: 2026 }
    ];

    for (let emp of employeesList) {
      for (let mRecord of monthsToSeed) {
        const basic = emp.salary;
        const hra = Math.round(basic * 0.4);
        const da = Math.round(basic * 0.1);
        const pf = Math.round(basic * 0.12);
        const esi = Math.round(basic * 0.01);
        const professionalTax = basic > 15000 ? 200 : 0;
        
        let incomeTax = 0;
        if (basic * 12 > 1000000) incomeTax = Math.round(basic * 0.15);
        else if (basic * 12 > 500000) incomeTax = Math.round(basic * 0.05);

        const netSalary = Math.round(
          basic + hra + da - (pf + esi + professionalTax + incomeTax)
        );

        await Salary.create({
          employee: emp._id,
          month: mRecord.m,
          year: mRecord.y,
          basicSalary: basic,
          hra,
          da,
          pf,
          esi,
          professionalTax,
          incomeTax,
          netSalary,
          status: "Paid",
          paidOn: new Date(mRecord.y, mRecord.m - 1, 30)
        });
      }
    }

    console.log("Seeding employee credentials verification documents...");
    for (let emp of employeesList) {
      await Document.create([
        {
          employee: emp._id,
          name: `${emp.name.toLowerCase().replace(" ", "_")}_resume.pdf`,
          type: "Resume",
          fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        },
        {
          employee: emp._id,
          name: `aadhaar_card_${emp.employeeId}.jpg`,
          type: "Aadhaar",
          fileUrl: "https://cdn.pixabay.com/photo/2016/08/17/04/43/template-1599667_1280.png"
        }
      ]);
    }

    console.log("Seeding general notifications board...");
    await Notification.create([
      {
        title: "TechNova HR System Upgraded",
        message: "We have migrated our Payroll system to the secure, Enterprise HRMS Portal. Access documents, leaves and chatbot features online.",
        type: "success"
      },
      {
        title: "Upcoming Holiday Notice",
        message: "Office will remain closed on August 15th on account of Independence Day celebration.",
        type: "info"
      },
      {
        title: "Performance Appraisal Stars Posted",
        message: "Q2 performance appraisals have been verified. Star of the Month awards are displayed on profiles.",
        type: "warning"
      }
    ]);
    // 8. Seeding Performance Appraisals for some employees
    console.log("Seeding employee performance appraisals...");
    const Job = require("../models/Job");
    const Candidate = require("../models/Candidate");
    const Interview = require("../models/Interview");
    const Performance = require("../models/Performance");

    await Performance.create([
      {
        employee: employeesList[0]._id,
        rating: 5,
        comments: "Excellent developer, exceeds delivery timelines consistently.",
        reward: "Star of the Month",
        coding: 95,
        teamwork: 88,
        delivery: 92,
        evaluatedBy: adminUser._id
      },
      {
        employee: employeesList[1]._id,
        rating: 4,
        comments: "Great client support and design aptitude.",
        reward: "Team Player Award",
        coding: 80,
        teamwork: 94,
        delivery: 85,
        evaluatedBy: adminUser._id
      },
      {
        employee: employeesList[2]._id,
        rating: 3,
        comments: "Good performer, solid operational delivery.",
        reward: "None",
        coding: 75,
        teamwork: 78,
        delivery: 80,
        evaluatedBy: adminUser._id
      }
    ]);

    // 9. Seeding Recruitment Jobs, Candidates, and Interviews
    console.log("Seeding recruitment jobs, candidates, and interviews...");
    const jobIT = await Job.create({
      jobId: "JOB001",
      title: "Senior Full Stack Dev",
      department: "Information Technology",
      openings: 3,
      status: "Active"
    });
    const jobHR = await Job.create({
      jobId: "JOB002",
      title: "HR Executive",
      department: "Human Resources",
      openings: 1,
      status: "Active"
    });

    const candidate1 = await Candidate.create({
      candidateId: "CAN001",
      name: "Rohit Deshmukh",
      email: "rohit.deshmukh@gmail.com",
      jobTitle: "Senior Full Stack Dev",
      stage: "Interview Scheduled"
    });
    const candidate2 = await Candidate.create({
      candidateId: "CAN002",
      name: "Shreya Ghoshal",
      email: "shreya.g@gmail.com",
      jobTitle: "HR Executive",
      stage: "Applied"
    });

    await Interview.create({
      interviewId: "INT001",
      candidate: candidate1._id,
      candidateName: "Rohit Deshmukh",
      jobTitle: "Senior Full Stack Dev",
      interviewer: "Admin Manager",
      date: "2026-07-05",
      time: "11:00"
    });

    console.log("Seeding complete! Successfully created:");
    console.log("\nDEMO EMPLOYEE CREDENTIALS (Initial Password is '1234'):");
    employeesList.slice(0, 5).forEach(emp => {
      console.log(`  - Name: "${emp.name}" | Email: "${emp.email}"`);
    });
    console.log("\n");
    console.log("- Company config");
    console.log("- 3 Shift Configurations");
    console.log("- 6 Department definitions");
    console.log("- 15+ Designation roles");
    console.log("- 105 Employees & logins");
    console.log("- 2000+ Attendance logs");
    console.log("- 210 Leave requests");
    console.log("- 210 Paid salary slips");
    console.log("- 210 Verify documents uploads");
    console.log("- 3 System broadcast alerts");

    if (require.main === module) {
      mongoose.connection.close();
      process.exit(0);
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

