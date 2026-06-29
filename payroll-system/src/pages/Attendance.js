import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { employeeAPI, attendanceAPI } from "../services/api";

function Attendance() {
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        await employeeAPI.getEmployees(); // Call it in case of side effects/caching, but ignore the result
        const attRes = await attendanceAPI.getAttendance("", selectedMonth, selectedYear);

        if (attRes.data.success) setAttendanceList(attRes.data.data);
      } catch (err) {
        console.error("Failed to load attendance logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [selectedMonth, selectedYear]);

  // Aggregate Stats
  const presentCount = attendanceList.filter(a => a.status === "Present" || a.status === "Late").length;
  const lateCount = attendanceList.filter(a => a.status === "Late").length;
  const halfDayCount = attendanceList.filter(a => a.status === "Half-Day").length;
  const absentCount = attendanceList.filter(a => a.status === "Absent").length;

  return (
    <>
      <Sidebar />
      <div className="main-content" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <div className="container-fluid">
          
          {/* HEADER */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
            <div>
              <h2 className="fw-bold text-dark m-0">Attendance Dashboard</h2>
              <p className="text-muted small m-0">Monitor corporate check-in compliance logs</p>
            </div>
            
            {/* Filter selectors */}
            <div className="d-flex gap-2 mt-3 mt-md-0">
              <select 
                className="form-select form-select-sm"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
              <select
                className="form-select form-select-sm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card shadow-sm border-0 p-3 text-center bg-white" style={{ borderRadius: "10px" }}>
                <h6 className="text-muted small text-uppercase">Present Days</h6>
                <h3 className="text-success fw-bold m-0">{presentCount}</h3>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-0 p-3 text-center bg-white" style={{ borderRadius: "10px" }}>
                <h6 className="text-muted small text-uppercase">Late Entries</h6>
                <h3 className="text-warning fw-bold m-0">{lateCount}</h3>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-0 p-3 text-center bg-white" style={{ borderRadius: "10px" }}>
                <h6 className="text-muted small text-uppercase">Half Days</h6>
                <h3 className="text-info fw-bold m-0">{halfDayCount}</h3>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-0 p-3 text-center bg-white" style={{ borderRadius: "10px" }}>
                <h6 className="text-muted small text-uppercase">Absences</h6>
                <h3 className="text-danger fw-bold m-0">{absentCount}</h3>
              </div>
            </div>
          </div>

          {/* RECORDS TABLE */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: "15px" }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3"><i className="bi bi-clock-history me-2 text-primary"></i>Check-in Logs</h5>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2 text-muted small">Loading attendance logs...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>Employee ID</th>
                        <th>Name</th>
                        <th>Date</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Working Hours</th>
                        <th>Overtime</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceList.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center text-muted py-4">
                            No attendance records registered for this month
                          </td>
                        </tr>
                      ) : (
                        attendanceList.map((att, idx) => (
                          <tr key={att._id || idx}>
                            <td>
                              <span className="badge bg-secondary">{att.employee?.employeeId || "-"}</span>
                            </td>
                            <td className="fw-semibold text-dark">{att.employee?.name || "-"}</td>
                            <td>{new Date(att.date).toLocaleDateString()}</td>
                            <td>{att.checkIn || "-"}</td>
                            <td>{att.checkOut || "-"}</td>
                            <td>{att.workingHours ? `${att.workingHours} hrs` : "-"}</td>
                            <td>{att.overtimeHours ? `${att.overtimeHours} hrs` : "-"}</td>
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

export default Attendance;
