import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Calendar from "react-calendar";
import { employeeAPI, attendanceAPI } from "../services/api";
import "react-calendar/dist/Calendar.css";
import "../App.css";

function EmployeeAttendanceCalendar() {
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const profileRes = await employeeAPI.getProfile();
        if (profileRes.data.success) {
          const emp = profileRes.data.data;
          const attRes = await attendanceAPI.getAttendance(emp._id);
          if (attRes.data.success) {
            setAttendance(attRes.data.data);
          }
        }
      } catch (err) {
        console.error("Failed to load personal calendar metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Check status for a specific date
  const getStatus = (date) => {
    const checkDateStr = new Date(date).toDateString();
    const record = attendance.find(
      (att) => new Date(att.date).toDateString() === checkDateStr
    );
    return record ? record.status : null;
  };

  // Calendar tile color handler
  const tileClassName = ({ date }) => {
    const status = getStatus(date);
    if (status === "Present" || status === "Late") {
      return "present-date";
    }
    if (status === "Absent") {
      return "absent-date";
    }
    return null;
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="main-content d-flex justify-content-center align-items-center vh-100 bg-light">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted small fw-bold">Synchronizing Calendar Telemetry...</p>
          </div>
        </div>
      </>
    );
  }

  const selectedStatus = getStatus(selectedDate) || "No Record";

  return (
    <>
      <Sidebar />
      <div className="main-content" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <div className="container-fluid">
          <h2 className="fw-bold mb-4 text-dark">
            <i className="bi bi-calendar3 text-primary me-2"></i>My Attendance Calendar
          </h2>

          <div className="row">
            <div className="col-lg-6 mb-4">
              <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "15px" }}>
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  tileClassName={tileClassName}
                />
              </div>
            </div>

            <div className="col-lg-6 mb-4">
              <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "15px", height: "100%" }}>
                <h5 className="fw-bold mb-3">Day Details</h5>
                <div className="bg-light p-3 rounded mb-3">
                  <div className="mb-2">
                    <span className="text-muted small d-block">Selected Date</span>
                    <strong className="text-dark fs-5">{selectedDate.toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span className="text-muted small d-block">Attendance Status</span>
                    <span className={`badge fs-6 ${
                      selectedStatus === "Present" ? "bg-success" :
                      selectedStatus === "Late" ? "bg-warning text-dark" :
                      selectedStatus === "Half-Day" ? "bg-info text-dark" :
                      selectedStatus === "Absent" ? "bg-danger" : "bg-secondary"
                    }`}>
                      {selectedStatus}
                    </span>
                  </div>
                </div>

                <h6 className="fw-bold mb-2">Legend:</h6>
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge bg-success-subtle text-success border border-success-subtle py-2 px-3">Present / Late (Green)</span>
                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle py-2 px-3">Absent (Red)</span>
                  <span className="badge bg-light text-dark border py-2 px-3">No Record (Gray)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EmployeeAttendanceCalendar;
