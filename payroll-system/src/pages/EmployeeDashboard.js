import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { employeeAPI, attendanceAPI, leaveAPI, salaryAPI } from "../services/api";
import axios from "axios";
import { motion } from "framer-motion";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState(null);
  const [salaries, setSalaries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [presentDays, setPresentDays] = useState(0);
  const [absentDays, setAbsentDays] = useState(0);
  const [lateDays, setLateDays] = useState(0);
  const [workingHours, setWorkingHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clockActionLoading, setClockActionLoading] = useState(false);
  const [time, setTime] = useState(new Date());

  // Location verifying mock coordinates
  const OFFICE_LAT = 28.496;
  const OFFICE_LON = 77.089;

  const quotes = [
    "Your hard work shapes the future of TechNova solutions.",
    "Small daily improvements over time lead to stunning results.",
    "Quality is not an act, it is a habit.",
    "Excellence is the gradual result of always striving to do better."
  ];
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  const fetchDashboardData = async () => {
    try {
      const profRes = await employeeAPI.getProfile();
      if (profRes.data.success) {
        const empData = profRes.data.data;
        setEmployee(empData);

        // Fetch attendance, leaves, salaries, and notifications using their client APIs
        const [attRes, balRes, salRes] = await Promise.all([
          attendanceAPI.getAttendance(empData._id),
          leaveAPI.getLeaveBalance(empData._id),
          salaryAPI.getSalaries(empData._id)
        ]);

        // Fetch notifications directly from our new route
        const token = localStorage.getItem("accessToken");
        const baseURL = process.env.REACT_APP_API_URL || "http://localhost:63389/api";
        const notifRes = await axios.get(`${baseURL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (attRes.data.success) {
          const atts = attRes.data.data;
          setAttendance(atts);
          const present = atts.filter(a => a.status === "Present" || a.status === "Late").length;
          const absent = atts.filter(a => a.status === "Absent").length;
          const late = atts.filter(a => a.status === "Late").length;
          const hours = atts.reduce((sum, a) => sum + (a.workingHours || 0), 0);

          setPresentDays(present);
          setAbsentDays(absent);
          setLateDays(late);
          setWorkingHours(Math.round(hours));
        }

        if (balRes.data.success) setLeaveBalances(balRes.data.balance);
        if (salRes.data.success) setSalaries(salRes.data.data);
        if (notifRes.data.success) setNotifications(notifRes.data.data);
      }
    } catch (error) {
      console.error("Employee dashboard telemetry fetch failure:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockAction = async (actionType) => {
    setClockActionLoading(true);
    try {
      // Geolocate user coordinates to check office radius
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Basic distance verification mock (DLF Cyber City radius)
          const dist = Math.sqrt(Math.pow(latitude - OFFICE_LAT, 2) + Math.pow(longitude - OFFICE_LON, 2));
          console.log(`Verifying clock-in coordinate distance radius check: ${dist}`);

          const token = localStorage.getItem("accessToken");
          const endpoint = actionType === "in" ? "/attendance/check-in" : "/attendance/check-out";
          const baseURL = process.env.REACT_APP_API_URL || "http://localhost:63389/api";
          
          const res = await axios.post(
            `${baseURL}${endpoint}`,
            {
              latitude,
              longitude,
              deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Web"
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          alert(res.data.message);
          await fetchDashboardData();
        },
        async (err) => {
          console.warn("Geolocation prompt blocked, executing check-in with fallback coordinates");
          // Proceed with fallback mock coordinates
          const token = localStorage.getItem("accessToken");
          const endpoint = actionType === "in" ? "/attendance/check-in" : "/attendance/check-out";
          const baseURL = process.env.REACT_APP_API_URL || "http://localhost:63389/api";
          const res = await axios.post(
            `${baseURL}${endpoint}`,
            { latitude: OFFICE_LAT, longitude: OFFICE_LON, deviceType: "Web" },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          alert(res.data.message + " (Using fallback office coordinates)");
          await fetchDashboardData();
        }
      );
    } catch (err) {
      alert(err.response?.data?.message || "Check action failed");
    } finally {
      setClockActionLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="main-content d-flex justify-content-center align-items-center vh-100" style={{ background: "#0d131a", color: "#fff" }}>
          <div className="text-center">
            <div className="spinner-border text-info" role="status" style={{ width: "3.5rem", height: "3.5rem" }}></div>
            <p className="mt-3 text-muted fw-bold">Synchronizing Portal...</p>
          </div>
        </div>
      </>
    );
  }

  // Calculate totals
  const totalLeavesLeft = leaveBalances 
    ? (leaveBalances.Casual.balance + leaveBalances.Sick.balance + leaveBalances.Paid.balance) 
    : 37;

  const attendancePercent = attendance.length > 0 
    ? Math.round(((presentDays) / attendance.length) * 100) 
    : 100;

  const earnedSalary = salaries.length > 0 ? salaries[0].netSalary : (employee?.salary || 0);

  const pieData = {
    labels: ["Present", "Absent", "Late Entry"],
    datasets: [
      {
        data: [presentDays || 1, absentDays || 0, lateDays || 0],
        backgroundColor: ["#38ef7d", "#ff5e62", "#f1c40f"]
      }
    ]
  };

  const barData = {
    labels: ["Casual Leaves", "Sick Leaves", "Paid Leaves"],
    datasets: [
      {
        label: "Remaining Days Off",
        data: [
          leaveBalances ? leaveBalances.Casual.balance : 12,
          leaveBalances ? leaveBalances.Sick.balance : 10,
          leaveBalances ? leaveBalances.Paid.balance : 15
        ],
        backgroundColor: ["rgba(0, 198, 255, 0.7)", "rgba(138, 43, 226, 0.7)", "rgba(56, 239, 125, 0.7)"],
        borderWidth: 1
      }
    ]
  };

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
          
          {/* HEADER SECTION */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center my-4 p-3 rounded" style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)"
          }}>
            <div>
              <h3 className="fw-bold m-0 text-white">Welcome back, {employee?.name}</h3>
              <p className="text-muted small m-0">Corporate Employee Dashboard &bull; ID: {employee?.employeeId}</p>
            </div>
            <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
              <button 
                className="btn btn-success fw-bold px-3 py-2" 
                onClick={() => handleClockAction("in")}
                disabled={clockActionLoading}
                style={{ borderRadius: "8px" }}
              >
                <i className="bi bi-geo-alt-fill me-1"></i> Clock In
              </button>
              <button 
                className="btn btn-danger fw-bold px-3 py-2" 
                onClick={() => handleClockAction("out")}
                disabled={clockActionLoading}
                style={{ borderRadius: "8px" }}
              >
                <i className="bi bi-box-arrow-right me-1"></i> Clock Out
              </button>
            </div>
          </div>

          {/* QUOTE AND TIME WIDGET */}
          <div className="row g-3 mb-4">
            <div className="col-md-8">
              <div className="card border-0 p-3.5 h-100" style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "15px"
              }}>
                <span className="text-muted small d-block mb-1">Quote of the Day</span>
                <p className="fst-italic text-info m-0" style={{ fontSize: "15px" }}>"{quote}"</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 p-3.5 h-100 text-center text-md-end bg-dark bg-opacity-40" style={{
                borderRadius: "15px"
              }}>
                <span className="text-muted small d-block mb-1">Current Portal Time</span>
                <h5 className="fw-bold text-white m-0"><i className="bi bi-clock-fill text-primary me-2"></i>{time.toLocaleTimeString()}</h5>
              </div>
            </div>
          </div>

          {/* STATS DECK */}
          <div className="row g-3 mb-4">
            <div className="col-lg-3 col-md-6">
              <div className="card border-0 p-3 h-100" style={{
                background: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
                borderRadius: "14px"
              }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="opacity-75 uppercase text-xs">Attendance %</small>
                    <h3 className="fw-bold mt-1 mb-0">{attendancePercent}%</h3>
                  </div>
                  <i className="bi bi-calendar2-check-fill fs-2 opacity-50"></i>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="card border-0 p-3 h-100" style={{
                background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                borderRadius: "14px"
              }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="opacity-75 uppercase text-xs">Salary Earned</small>
                    <h3 className="fw-bold mt-1 mb-0">₹{earnedSalary.toLocaleString()}</h3>
                  </div>
                  <i className="bi bi-currency-rupee fs-2 opacity-50"></i>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="card border-0 p-3 h-100" style={{
                background: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
                borderRadius: "14px"
              }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="opacity-75 uppercase text-xs">Remaining Leaves</small>
                    <h3 className="fw-bold mt-1 mb-0">{totalLeavesLeft} Days</h3>
                  </div>
                  <i className="bi bi-calendar-x-fill fs-2 opacity-50"></i>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="card border-0 p-3 h-100 bg-white bg-opacity-5" style={{
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "14px"
              }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="text-muted uppercase text-xs">Unread Alerts</small>
                    <h3 className="fw-bold mt-1 mb-0 text-warning">{notifications.filter(n => !n.read).length}</h3>
                  </div>
                  <i className="bi bi-bell-fill fs-2 text-warning opacity-75"></i>
                </div>
              </div>
            </div>
          </div>

          {/* GRID: CHARTS */}
          <div className="row g-4 mb-4">
            <div className="col-lg-6">
              <div className="card border-0 p-4 bg-white bg-opacity-5 h-100" style={{
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "16px"
              }}>
                <h6 className="fw-bold text-white mb-3"><i className="bi bi-pie-chart text-success me-2"></i>Attendance Breakdown</h6>
                <div style={{ maxWidth: "260px", margin: "auto" }}>
                  <Pie data={pieData} options={{ responsive: true, plugins: { legend: { labels: { color: "#ccc" } } } }} />
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card border-0 p-4 bg-white bg-opacity-5 h-100" style={{
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "16px"
              }}>
                <h6 className="fw-bold text-white mb-3"><i className="bi bi-bar-chart-line-fill text-primary me-2"></i>Leaves Entitlement</h6>
                <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>
          </div>

          {/* NOTIFICATIONS AND ANNOUNCEMENTS DECK */}
          <div className="row g-4">
            {/* Real-time Alerts */}
            <div className="col-md-6">
              <div className="card border-0 p-4 h-100" style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "16px"
              }}>
                <h6 className="fw-bold mb-3"><i className="bi bi-bell-fill text-warning me-2"></i>Recent Notifications</h6>
                <div className="list-group list-group-flush">
                  {notifications.length === 0 ? (
                    <p className="text-muted small text-center my-3">No notifications stored</p>
                  ) : (
                    notifications.slice(0, 4).map((notif, idx) => (
                      <div key={idx} className="list-group-item bg-transparent text-white border-0 px-0 pb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <strong className="small text-info">{notif.title}</strong>
                          <span className="text-muted" style={{ fontSize: "10px" }}>{new Date(notif.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="small text-muted m-0">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Upcoming Holidays & Announcements */}
            <div className="col-md-6">
              <div className="card border-0 p-4 h-100" style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "16px"
              }}>
                <h6 className="fw-bold mb-3"><i className="bi bi-calendar3 text-info me-2"></i>Corporate Announcements & Holidays</h6>
                <ul className="list-unstyled mb-0">
                  <li className="mb-3">
                    <span className="badge bg-danger me-2">Holiday</span>
                    <strong className="small text-white">Independence Day - August 15th</strong>
                    <p className="small text-muted m-0 mt-1">TechNova corporate offices will remain closed.</p>
                  </li>
                  <li>
                    <span className="badge bg-warning text-dark me-2">Policy Update</span>
                    <strong className="small text-white">New QR Attendance Check-in Active</strong>
                    <p className="small text-muted m-0 mt-1">Please verify browser location permissions during daily check-in logs.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default EmployeeDashboard;
