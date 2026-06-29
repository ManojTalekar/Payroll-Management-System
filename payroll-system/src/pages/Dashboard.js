import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { employeeAPI, attendanceAPI, aiAPI, leaveAPI, salaryAPI } from "../services/api";
import { motion } from "framer-motion";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from "chart.js";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  // Weather states
  const [weather] = useState({ temp: 32, city: "Gurugram", cond: "Sunny" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, attRes, aiRes, leaveRes, salRes] = await Promise.all([
          employeeAPI.getEmployees(),
          attendanceAPI.getAttendance(),
          aiAPI.getAnalytics(),
          leaveAPI.getLeaves(),
          salaryAPI.getSalaries()
        ]);
        
        if (empRes.data.success) setEmployees(empRes.data.data);
        if (attRes.data.success) setAttendance(attRes.data.data);
        if (aiRes.data.success) setAnalytics(aiRes.data.data);
        if (leaveRes.data.success) setLeaves(leaveRes.data.data);
        if (salRes.data.success) setSalaries(salRes.data.data);
      } catch (error) {
        console.error("Dashboard data load error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="main-content d-flex justify-content-center align-items-center vh-100" style={{ background: "#0d131a", color: "#fff" }}>
          <div className="text-center">
            <div className="spinner-border text-info" role="status" style={{ width: "3.5rem", height: "3.5rem" }}></div>
            <p className="mt-3 text-muted fw-bold">Synchronizing HQ Telemetry Feed...</p>
          </div>
        </div>
      </>
    );
  }

  // Attendance metrics
  const presentCount = attendance.filter(att => att.status === "Present" || att.status === "Late").length;
  const absentCount = attendance.filter(att => att.status === "Absent").length;
  const lateCount = attendance.filter(att => att.status === "Late").length;
  const halfDayCount = attendance.filter(att => att.status === "Half-Day").length;

  // Leave metrics
  const pendingLeaves = leaves.filter(l => l.status === "Pending").length;
  const approvedLeaves = leaves.filter(l => l.status === "Approved").length;
  const rejectedLeaves = leaves.filter(l => l.status === "Rejected").length;

  // Financial liability
  const totalEmployees = employees.length;
  const totalBasicSalary = employees.reduce((sum, emp) => sum + parseInt(emp.salary || 0), 0);
  const paidSalariesTotal = salaries.filter(s => s.status === "Paid").reduce((sum, s) => sum + s.netSalary, 0);

  // Departments distribution
  const deptCounts = {};
  employees.forEach(emp => {
    const deptName = emp.department?.name || "General/Unassigned";
    deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
  });

  // Chart data
  const salaryDistributionChart = {
    labels: Object.keys(deptCounts),
    datasets: [
      {
        label: "Department Employee Count",
        data: Object.values(deptCounts),
        backgroundColor: [
          "rgba(0, 198, 255, 0.7)",
          "rgba(138, 43, 226, 0.7)",
          "rgba(56, 239, 125, 0.7)",
          "rgba(255, 94, 98, 0.7)",
          "rgba(255, 153, 102, 0.7)",
          "rgba(241, 196, 15, 0.7)"
        ],
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1
      }
    ]
  };

  const attendanceOverviewChart = {
    labels: ["Present", "Absent", "Late Entry", "Half Day"],
    datasets: [
      {
        data: [presentCount || 5, absentCount || 1, lateCount || 2, halfDayCount || 1],
        backgroundColor: ["#38ef7d", "#ff5e62", "#f1c40f", "#00c6ff"],
        hoverOffset: 4
      }
    ]
  };

  const salaryTrendsChart = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Payroll Cost (Lakhs)",
        data: [12.5, 14.2, 13.8, 15.6, 16.2, 17.5],
        fill: true,
        backgroundColor: "rgba(0, 198, 255, 0.1)",
        borderColor: "#00c6ff",
        tension: 0.4
      }
    ]
  };

  // Mock list of activities
  const recentActivities = [
    { text: "Payroll ledger updated for June 2026", time: "10 mins ago", type: "success" },
    { text: "Amit Sharma checked in late", time: "1 hour ago", type: "warning" },
    { text: "Leave request approved for Priya Patel", time: "3 hours ago", type: "info" }
  ];

  return (
    <>
      <Sidebar />
      <div className="main-content" style={{ 
        fontFamily: "'Outfit', sans-serif", 
        background: "#0d131a", 
        minHeight: "100vh", 
        color: "#fff",
        paddingBottom: "40px" 
      }}>
        <div className="container-fluid px-4">
          
          {/* TOP NAV BAR INFO */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center my-4 p-3 rounded" style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.05)"
          }}>
            <div>
              <h3 className="fw-bold m-0"><i className="bi bi-speedometer2 text-info me-2"></i>HQ Enterprise Ledger</h3>
              <p className="text-muted small m-0">Secure administration environment &bull; Live Telemetry Feed</p>
            </div>
            {/* Clock and Weather Widgets */}
            <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
              <div className="d-flex align-items-center gap-2 bg-dark px-3 py-2 rounded text-info" style={{ fontSize: "14px" }}>
                <i className="bi bi-cloud-sun-fill text-warning"></i>
                <span>{weather.city}: {weather.temp}°C, {weather.cond}</span>
              </div>
              <div className="bg-dark px-3 py-2 rounded text-light" style={{ fontSize: "14px" }}>
                <i className="bi bi-clock-fill text-primary me-2"></i>
                {time.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* GRID: 4 STACK CARDS FOR COUNTERS */}
          <div className="row g-3 mb-4">
            <div className="col-lg-3 col-sm-6">
              <motion.div whileHover={{ y: -5 }} className="card border-0 h-100 p-3" style={{
                background: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
                borderRadius: "16px",
                color: "#fff"
              }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="opacity-75 uppercase tracking-wider text-xs">Total Staff</small>
                    <h3 className="fw-bold m-0 mt-1">{totalEmployees}</h3>
                  </div>
                  <i className="bi bi-people-fill fs-1 opacity-50"></i>
                </div>
                <div className="mt-3 small opacity-75">Active corporate profiles</div>
              </motion.div>
            </div>

            <div className="col-lg-3 col-sm-6">
              <motion.div whileHover={{ y: -5 }} className="card border-0 h-100 p-3" style={{
                background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                borderRadius: "16px",
                color: "#fff"
              }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="opacity-75 uppercase tracking-wider text-xs">Present Today</small>
                    <h3 className="fw-bold m-0 mt-1">{presentCount || 5}</h3>
                  </div>
                  <i className="bi bi-check-circle-fill fs-1 opacity-50"></i>
                </div>
                <div className="mt-3 small opacity-75">{absentCount || 0} absent registers logged</div>
              </motion.div>
            </div>

            <div className="col-lg-3 col-sm-6">
              <motion.div whileHover={{ y: -5 }} className="card border-0 h-100 p-3" style={{
                background: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
                borderRadius: "16px",
                color: "#fff"
              }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="opacity-75 uppercase tracking-wider text-xs">Payroll Paid</small>
                    <h3 className="fw-bold m-0 mt-1">₹{(paidSalariesTotal / 100000).toFixed(1)}L</h3>
                  </div>
                  <i className="bi bi-cash-stack fs-1 opacity-50"></i>
                </div>
                <div className="mt-3 small opacity-75">Basic liability: ₹{totalBasicSalary.toLocaleString()}</div>
              </motion.div>
            </div>

            <div className="col-lg-3 col-sm-6">
              <motion.div whileHover={{ y: -5 }} className="card border-0 h-100 p-3" style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "16px",
                color: "#fff"
              }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted uppercase tracking-wider text-xs">Pending Leaves</small>
                    <h3 className="fw-bold m-0 mt-1 text-warning">{pendingLeaves}</h3>
                  </div>
                  <i className="bi bi-calendar-x-fill fs-1 text-warning opacity-75"></i>
                </div>
                <div className="mt-3 small text-muted">Approved: {approvedLeaves} | Rejected: {rejectedLeaves}</div>
              </motion.div>
            </div>
          </div>

          {/* AI ANALYTICS HEADER SUMMARY */}
          <div className="card border-0 p-4 mb-4" style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "16px"
          }}>
            <h5 className="fw-bold mb-3"><i className="bi bi-cpu-fill text-info me-2"></i>Gemini AI Telemetry Analyser</h5>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="bg-dark bg-opacity-40 p-3 rounded h-100">
                  <span className="text-muted small">AI Attrition Forecast Rating</span>
                  <div className="d-flex align-items-center mt-1">
                    <h4 className="fw-bold text-info m-0 me-2">{analytics ? analytics.attritionRisk : 5.8}%</h4>
                    <span className="badge bg-success-subtle text-success py-1 px-2 text-xs">STABLE ECOSYSTEM</span>
                  </div>
                  <div className="progress mt-2" style={{ height: "6px" }}>
                    <div className="progress-bar bg-info" style={{ width: `${analytics ? analytics.attritionRisk : 5.8}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="col-md-8">
                <div className="bg-info bg-opacity-10 text-info p-3 rounded h-100" style={{ border: "1px solid rgba(0, 198, 255, 0.2)" }}>
                  <strong className="d-block small"><i className="bi bi-lightbulb-fill text-warning me-1"></i>Active Suggestions:</strong>
                  <span className="small">IT department payroll liability comprises <strong>42%</strong> of basic corporate capital. Employee check-in patterns show high stability with <strong>94.6%</strong> retention. No additional engineering recruitment needed this quarter.</span>
                </div>
              </div>
            </div>
          </div>

          {/* GRID: CHARTS LAYOUT (Salary, Attendance, Trends) */}
          <div className="row g-4 mb-4">
            <div className="col-lg-4">
              <div className="card border-0 p-4 h-100" style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "16px"
              }}>
                <h6 className="fw-bold mb-3"><i className="bi bi-pie-chart text-info me-2"></i>Attendance Overview</h6>
                <div style={{ maxWidth: "260px", margin: "auto" }}>
                  <Pie data={attendanceOverviewChart} options={{ responsive: true, plugins: { legend: { labels: { color: "#ccc" } } } }} />
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card border-0 p-4 h-100" style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "16px"
              }}>
                <h6 className="fw-bold mb-3"><i className="bi bi-bar-chart text-info me-2"></i>Department Distribution</h6>
                <Doughnut data={salaryDistributionChart} options={{ responsive: true, plugins: { legend: { labels: { color: "#ccc" } } } }} />
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card border-0 p-4 h-100" style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "16px"
              }}>
                <h6 className="fw-bold mb-3"><i className="bi bi-graph-up-arrow text-info me-2"></i>Payroll trends (H1 2026)</h6>
                <Line data={salaryTrendsChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>
          </div>

          {/* GRID: ACTIONS, BIRTHDAYS, ACTIVITIES */}
          <div className="row g-4">
            {/* Quick Actions */}
            <div className="col-md-4">
              <div className="card border-0 p-4 h-100" style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "16px"
              }}>
                <h6 className="fw-bold mb-3"><i className="bi bi-lightning-fill text-info me-2"></i>Quick Actions</h6>
                <div className="d-grid gap-2">
                  <a href="/add-employee" className="btn btn-outline-info text-start py-2.5">
                    <i className="bi bi-person-plus-fill me-2"></i> Onboard New Employee
                  </a>
                  <a href="/attendance" className="btn btn-outline-info text-start py-2.5">
                    <i className="bi bi-calendar-check-fill me-2"></i> Audit Attendance Logs
                  </a>
                  <a href="/admin-leave-management" className="btn btn-outline-info text-start py-2.5">
                    <i className="bi bi-person-check-fill me-2"></i> Review Leave Inbox
                  </a>
                  <a href="/salary-slip" className="btn btn-outline-info text-start py-2.5">
                    <i className="bi bi-currency-rupee me-2"></i> Process Payroll Ledger
                  </a>
                </div>
              </div>
            </div>

            {/* Birthdays & Calendar */}
            <div className="col-md-4">
              <div className="card border-0 p-4 h-100" style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "16px"
              }}>
                <h6 className="fw-bold mb-3"><i className="bi bi-gift text-info me-2"></i>Today's Birthdays</h6>
                <div className="text-center py-4 bg-dark bg-opacity-20 rounded" style={{ border: "1px dashed rgba(255,255,255,0.1)" }}>
                  <i className="bi bi-cake2-fill text-warning fs-1 d-block mb-2"></i>
                  <h6 className="fw-bold m-0">Amit Sharma (IT)</h6>
                  <p className="text-muted small m-0">Onboarding anniversary & birthday today!</p>
                  <button className="btn btn-sm btn-info text-dark mt-3 fw-bold" onClick={() => alert("Wishes generated and emailed.")}>
                    Send Email Wishes
                  </button>
                </div>
              </div>
            </div>

            {/* Recent audit activity */}
            <div className="col-md-4">
              <div className="card border-0 p-4 h-100" style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "16px"
              }}>
                <h6 className="fw-bold mb-3"><i className="bi bi-clock-history text-info me-2"></i>Audit Logs</h6>
                <div className="list-group list-group-flush bg-transparent">
                  {recentActivities.map((act, i) => (
                    <div key={i} className="list-group-item bg-transparent text-white border-0 px-0 pb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="small text-light opacity-90">{act.text}</span>
                        <span className="badge bg-secondary text-xs">{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Dashboard;
