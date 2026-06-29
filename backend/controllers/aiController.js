const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Salary = require("../models/Salary");
const Department = require("../models/Department");

// @desc    AI Assistant Chatbot Responder targeting Google Gemini API
// @route   POST /api/ai/chat
// @access  Private
const chatbotReply = async (req, res, next) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: "Please provide a query message" });
  }

  try {
    // 1. Fetch live corporate telemetry to inject context
    const empCount = await Employee.countDocuments();
    const deptCount = await Department.countDocuments();
    const activeLeaves = await Leave.countDocuments({ status: "Approved" });
    const pendingLeaves = await Leave.countDocuments({ status: "Pending" });
    
    const salaries = await Salary.find({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    const totalExp = salaries.reduce((sum, s) => sum + s.netSalary, 0);

    const contextPrompt = `You are TechNova AI, the official corporate virtual assistant for TechNova Solutions Pvt Ltd.
Your tone should be professional, warm, supportive, and objective.
Here is the live company database telemetry for context (use this to answer questions where relevant):
- Company Name: TechNova Solutions Pvt Ltd
- Total Active Employees: ${empCount}
- Active Departments: ${deptCount}
- Current Approved Leaves: ${activeLeaves}
- Pending Leave Approvals: ${pendingLeaves}
- Active Month Payroll Liability: ₹${totalExp.toLocaleString()}
- Official Work Time: General Shift is 09:00 to 18:00. Weekly day off is Sunday.
- Dress Code Policy: Smart casuals are allowed on weekdays, formal wear is recommended for client interactions.
- Leave Categories: Sick Leave, Casual Leave, Paid Leave, Unpaid Leave, Emergency Leave.
- User Role querying you: ${req.user.role} (${req.user.email}).

Please respond to the employee's message. Use Markdown formatting (bold, bullet points, headers, tables) for visual structure. Keep answers concise.
If they ask payroll, attendance, or policy questions, relate it back to the corporate metrics above.
User Message: "${message}"`;

    let replyText = "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== "dummy_api_key" && !apiKey.startsWith("YOUR_")) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: contextPrompt
                    }
                  ]
                }
              ]
            })
          }
        );

        if (response.ok) {
          const json = await response.json();
          if (json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts[0]) {
            replyText = json.candidates[0].content.parts[0].text;
          }
        } else {
          const errBody = await response.text();
          console.error("Gemini API call failed with response error status:", response.status, errBody);
        }
      } catch (geminiErr) {
        console.error("Gemini API request exception:", geminiErr.message);
      }
    }

    // 2. Fallback to keyword heuristics if Gemini is not configured or failed
    if (!replyText) {
      console.log("Gemini API fallback triggered. Using localized rule execution.");
      const query = message.toLowerCase();
      
      if (query.includes("employee") || query.includes("staff") || query.includes("count")) {
        replyText = `**System Status:** TechNova currently has **${empCount}** active employees onboarded across **${deptCount}** departments. All corporate logins are operational.`;
      } 
      else if (query.includes("salary") || query.includes("payroll") || query.includes("expense") || query.includes("budget")) {
        replyText = `**Financial Ledger:** The calculated payroll liability for this calendar month is **₹${totalExp.toLocaleString()}**. IT department accounts represent the highest operational allocation.`;
      } 
      else if (query.includes("policy") || query.includes("dress") || query.includes("hours")) {
        replyText = `### TechNova Office Guidelines
* **Work Hours:** General Shift runs from **09:00 AM - 06:00 PM**.
* **Weekly Off:** Sundays.
* **Dress Code:** Smart casuals. Formals for client meetings.`;
      } 
      else if (query.includes("leave") || query.includes("absent") || query.includes("holiday")) {
        replyText = `### Leaves Telemetry
* **Approved Leaves:** ${activeLeaves} active requests.
* **Pending Approvals:** ${pendingLeaves} requests awaiting review.
* *Note:* You can apply for Casual, Sick, or Paid leaves directly in the **Leave Request** panel.`;
      } 
      else if (query.includes("attrition") || query.includes("retention") || query.includes("sentiment")) {
        replyText = `Our organizational retention rate stands at **94.6%** with employee satisfaction currently sitting at **84% positive**.`;
      } 
      else {
        replyText = `Hello! I am your **TechNova AI assistant**. I have full database access to provide context-aware responses. 
Feel free to ask me questions like:
- "How many employees work here?"
- "What is the payroll budget for this month?"
- "Tell me about the leave policy."
- "What are the standard office hours?"`;
      }
    }

    res.json({
      success: true,
      reply: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI Analytics, predictions & forecasts
// @route   GET /api/ai/analytics
// @access  Private
const getAIAnalytics = async (req, res, next) => {
  try {
    const employees = await Employee.find();
    const attendance = await Attendance.find();
    const leaves = await Leave.find();
    const salaries = await Salary.find();

    // 1. Employee Growth (simulation of past months)
    const growthData = [
      { month: "Jan", employees: Math.max(10, employees.length - 20) },
      { month: "Feb", employees: Math.max(20, employees.length - 15) },
      { month: "Mar", employees: Math.max(30, employees.length - 10) },
      { month: "Apr", employees: Math.max(50, employees.length - 5) },
      { month: "May", employees: employees.length }
    ];

    // 2. Attendance Trend
    const presentCount = attendance.filter(a => a.status === "Present").length;
    const absentCount = attendance.filter(a => a.status === "Absent").length;
    const lateCount = attendance.filter(a => a.status === "Late").length;
    const halfDayCount = attendance.filter(a => a.status === "Half-Day").length;

    // 3. Predicted Attrition & Sentiment
    const sentimentRate = 84; // 84%
    const attritionRisk = 5.8; // 5.8%

    // 4. Department allocations
    const depts = await Department.find();
    const deptStats = [];
    for (let d of depts) {
      const count = await Employee.countDocuments({ department: d._id });
      deptStats.push({
        department: d.name,
        count
      });
    }

    // 5. Salary forecasts (future months cost estimate)
    const baseExpense = salaries.reduce((sum, s) => sum + s.netSalary, 0) || (employees.reduce((sum, e) => sum + e.salary, 0) * 1.4); // basic estimation
    const salaryForecast = [
      { month: "Current", expense: Math.round(baseExpense) },
      { month: "Next Month", expense: Math.round(baseExpense * 1.02) },
      { month: "In 3 Months", expense: Math.round(baseExpense * 1.05) },
      { month: "In 6 Months", expense: Math.round(baseExpense * 1.10) }
    ];

    res.json({
      success: true,
      data: {
        growthData,
        attendanceStats: {
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          halfDay: halfDayCount
        },
        sentimentRate,
        attritionRisk,
        deptStats,
        salaryForecast
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatbotReply,
  getAIAnalytics
};
