const Salary = require("../models/Salary");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendPayslipEmail } = require("../config/emailService");

// @desc    Get salary history
// @route   GET /api/salaries
// @access  Private
const getSalaries = async (req, res, next) => {
  try {
    const { employeeId, month, year } = req.query;
    let query = {};

    if (req.user.role === "employee") {
      query.employee = req.user.employeeRef._id;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const salaries = await Salary.find(query)
      .populate({
        path: "employee",
        populate: [{ path: "department" }, { path: "designation" }]
      })
      .sort({ year: -1, month: -1 });

    res.json({ success: true, count: salaries.length, data: salaries });
  } catch (error) {
    next(error);
  }
};

// @desc    Process payroll for a month
// @route   POST /api/salaries/generate
// @access  Private/Admin
const generatePayroll = async (req, res, next) => {
  const { month, year } = req.body;

  if (!month || !year) {
    return res.status(400).json({ success: false, message: "Please specify month and year" });
  }

  try {
    const employees = await Employee.find({ status: "Active" });
    const generatedSalaries = [];

    // Calculate dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    for (let emp of employees) {
      // Calculate overtime from attendance
      const attendanceList = await Attendance.find({
        employee: emp._id,
        date: { $gte: startDate, $lte: endDate }
      });

      let totalOvertimeHours = 0;
      attendanceList.forEach(a => {
        totalOvertimeHours += a.overtimeHours || 0;
      });

      const basic = emp.salary;
      const hra = Math.round(basic * 0.40); // 40% HRA
      const da = Math.round(basic * 0.10);  // 10% DA
      const bonus = 0; // default
      const allowance = 0; // default

      // Deductions
      const pf = Math.round(basic * 0.12);  // 12% PF
      const esi = Math.round(basic * 0.01); // 1% ESI
      const professionalTax = basic > 15000 ? 200 : 0; // Flat PT if salary > 15000

      // Dynamic Income Tax
      let incomeTax = 0;
      const annualBase = basic * 12;
      if (annualBase > 1000000) {
        incomeTax = Math.round(basic * 0.15); // 15% rate
      } else if (annualBase > 500000) {
        incomeTax = Math.round(basic * 0.05); // 5% rate
      }

      // Overtime Pay rate: (Basic / 30 / 8) * 1.5 per overtime hour
      const hourlyRate = (basic / 30) / 8;
      const overtimePay = Math.round(totalOvertimeHours * hourlyRate * 1.5);

      const loanDeduction = 0; // default

      const netSalary = Math.round(
        basic + hra + da + bonus + allowance + overtimePay - (pf + esi + professionalTax + incomeTax + loanDeduction)
      );

      // Check if already generated, update or create
      let salaryRecord = await Salary.findOne({
        employee: emp._id,
        month: parseInt(month),
        year: parseInt(year)
      });

      if (salaryRecord) {
        salaryRecord.basicSalary = basic;
        salaryRecord.hra = hra;
        salaryRecord.da = da;
        salaryRecord.bonus = bonus;
        salaryRecord.allowance = allowance;
        salaryRecord.pf = pf;
        salaryRecord.esi = esi;
        salaryRecord.professionalTax = professionalTax;
        salaryRecord.incomeTax = incomeTax;
        salaryRecord.loanDeduction = loanDeduction;
        salaryRecord.overtimePay = overtimePay;
        salaryRecord.netSalary = netSalary;
      } else {
        salaryRecord = new Salary({
          employee: emp._id,
          month: parseInt(month),
          year: parseInt(year),
          basicSalary: basic,
          hra,
          da,
          bonus,
          allowance,
          pf,
          esi,
          professionalTax,
          incomeTax,
          loanDeduction,
          overtimePay,
          netSalary,
          status: "Unpaid"
        });
      }

      await salaryRecord.save();
      generatedSalaries.push(salaryRecord);
    }

    res.json({
      success: true,
      message: `Payroll processed successfully for ${month}/${year}`,
      count: generatedSalaries.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update salary status (Paid / Unpaid)
// @route   PUT /api/salaries/:id/status
// @access  Private/Admin
const updateSalaryStatus = async (req, res, next) => {
  const { status } = req.body;

  if (!status || !["Paid", "Unpaid"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    let salary = await Salary.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({ success: false, message: "Salary slip not found" });
    }

    salary.status = status;
    salary.paidOn = status === "Paid" ? new Date() : null;
    await salary.save();

    // Trigger Notification & Email
    if (status === "Paid") {
      const employee = await Employee.findById(salary.employee);
      if (employee) {
        sendPayslipEmail(employee, salary).catch(err => console.error("Payslip email error:", err));

        const userAccount = await User.findOne({ employeeRef: employee._id });
        if (userAccount) {
          await Notification.create({
            recipient: userAccount._id,
            title: "Salary Credited",
            message: `Your payroll for ${salary.month}/${salary.year} has been processed and paid. Net Amount: ₹${salary.netSalary.toLocaleString()}`,
            type: "success"
          });
        }
      }
    }

    res.json({ success: true, message: `Salary record updated to ${status}`, data: salary });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalaries,
  generatePayroll,
  updateSalaryStatus
};
