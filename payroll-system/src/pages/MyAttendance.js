import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { employeeAPI, attendanceAPI } from "../services/api";
import axios from "axios";

function MyAttendance() {
  const [attendanceList, setAttendanceList] = useState([]);
  const [presentDays, setPresentDays] = useState(0);
  const [absentDays, setAbsentDays] = useState(0);
  const [lateDays, setLateDays] = useState(0);
  const [halfDays, setHalfDays] = useState(0);
  const [salaryEarned, setSalaryEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  // Office Coordinate Limits
  const OFFICE_LAT = 28.496;
  const OFFICE_LON = 77.089;

  const fetchLogs = async () => {
    try {
      const profRes = await employeeAPI.getProfile();
      if (profRes.data.success) {
        const emp = profRes.data.data;
        const attRes = await attendanceAPI.getAttendance(emp._id);

        if (attRes.data.success) {
          const list = attRes.data.data;
          setAttendanceList(list);

          const present = list.filter(a => a.status === "Present").length;
          const late = list.filter(a => a.status === "Late").length;
          const absent = list.filter(a => a.status === "Absent").length;
          const half = list.filter(a => a.status === "Half-Day").length;

          setPresentDays(present);
          setLateDays(late);
          setAbsentDays(absent);
          setHalfDays(half);

          // Salary calculation
          const perDay = emp.salary / 30;
          const activeDays = present + late + (half * 0.5);
          setSalaryEarned(Math.round(perDay * activeDays));
        }
      }
    } catch (err) {
      console.error("Failed to load personal logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSimulatedQRCheckIn = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const baseURL = process.env.REACT_APP_API_URL || "http://localhost:10000/api";
      const res = await axios.post(
        `${baseURL}/attendance/check-in`,
        { latitude: OFFICE_LAT, longitude: OFFICE_LON, deviceType: "Mobile (QR)" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message + " via QR Verification Code!");
      setShowQR(false);
      fetchLogs();
    } catch (err) {
      alert(err.response?.data?.message || "QR Check-in failed");
    }
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
          
          {/* HEADER */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center my-4 p-3 rounded" style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.05)"
          }}>
            <div>
              <h3 className="fw-bold m-0"><i className="bi bi-calendar2-check-fill text-info me-2"></i>My Attendance Tracker</h3>
              <p className="text-muted small m-0">Review daily log history, overtime hours, and check-in locations.</p>
            </div>
            <button className="btn btn-info text-dark fw-bold mt-3 mt-md-0" onClick={() => setShowQR(!showQR)}>
              <i className="bi bi-qr-code-scan me-1"></i> QR Check-In Terminal
            </button>
          </div>

          {/* QR CHECK IN MODAL FALLBACK */}
          {showQR && (
            <div className="card border-0 p-4 mb-4 text-center" style={{
              background: "rgba(0, 198, 255, 0.05)",
              border: "1px solid rgba(0, 198, 255, 0.2)",
              borderRadius: "16px"
            }}>
              <h5 className="fw-bold"><i className="bi bi-qr-code text-info me-2"></i>Payroll Pro QR Check-In Terminal</h5>
              <p className="text-muted small">Scan this dynamic code with your mobile app or click check-in to simulate scans within the DLF Cyber City radius bounds.</p>
              <div className="my-3 d-inline-block p-3 bg-white rounded" style={{ width: "fit-content", margin: "auto" }}>
                {/* Simulated QR Code representation */}
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PayrollPro_CheckIn_LiveToken" alt="Checkin QR" />
              </div>
              <div>
                <button className="btn btn-success fw-bold me-2" onClick={handleSimulatedQRCheckIn}>
                  Simulate QR Scan (Gate 3)
                </button>
                <button className="btn btn-outline-light" onClick={() => setShowQR(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* STATS CARDS */}
          <div className="row g-3 mb-4">
            <div className="col-md-3 col-6">
              <div className="card text-white p-3 border-0" style={{ background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", borderRadius: "12px" }}>
                <i className="bi bi-check-circle fs-3"></i>
                <h6 className="mt-2 small text-uppercase opacity-75">On-Time Days</h6>
                <h4 className="fw-bold m-0">{presentDays}</h4>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card text-white p-3 border-0" style={{ background: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)", borderRadius: "12px" }}>
                <i className="bi bi-x-circle fs-3"></i>
                <h6 className="mt-2 small text-uppercase opacity-75">Absent Days</h6>
                <h4 className="fw-bold m-0">{absentDays}</h4>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card text-white p-3 border-0" style={{ background: "linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)", borderRadius: "12px" }}>
                <i className="bi bi-alarm fs-3 text-dark"></i>
                <h6 className="mt-2 small text-uppercase text-dark opacity-75">Late Entries</h6>
                <h4 className="fw-bold m-0 text-dark">{lateDays}</h4>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card text-white p-3 border-0" style={{ background: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)", borderRadius: "12px" }}>
                <i className="bi bi-wallet2 fs-3"></i>
                <h6 className="mt-2 small text-uppercase opacity-75">Calculated Earned</h6>
                <h4 className="fw-bold m-0">₹{salaryEarned.toLocaleString()}</h4>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="card border-0 shadow-sm" style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "16px"
          }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3 text-white"><i className="bi bi-clock-history me-2 text-info"></i>Check-in & Location History</h5>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-info" role="status"></div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 text-white">
                    <thead className="table-dark">
                      <tr>
                        <th>Date</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Logged Hours</th>
                        <th>Device/Method</th>
                        <th>IP Address</th>
                        <th>Checkin Radius Coordinates</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceList.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center text-muted py-4">
                            No attendance history logs.
                          </td>
                        </tr>
                      ) : (
                        attendanceList.map((att, idx) => (
                          <tr key={att._id || idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td>{new Date(att.date).toLocaleDateString()}</td>
                            <td>{att.checkIn || "-"}</td>
                            <td>{att.checkOut || "-"}</td>
                            <td>{att.workingHours ? `${att.workingHours} hrs` : "-"}</td>
                            <td>
                              <span className="badge bg-secondary">{att.deviceType || "Web"}</span>
                            </td>
                            <td><span className="small font-monospace opacity-75">{att.checkInIp || "127.0.0.1"}</span></td>
                            <td>
                              {att.checkInLocation?.latitude ? (
                                <span className="small text-muted font-monospace">{att.checkInLocation.latitude.toFixed(3)}, {att.checkInLocation.longitude.toFixed(3)}</span>
                              ) : (
                                <span className="small text-muted">Radius verified</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${
                                att.status === "Present" ? "bg-success" :
                                att.status === "Late" ? "bg-warning text-dark" :
                                att.status === "Half-Day" ? "bg-info text-dark" : "bg-danger"
                              }`}>
                                {att.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default MyAttendance;
