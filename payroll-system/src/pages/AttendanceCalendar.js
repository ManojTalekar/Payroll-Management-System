import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Calendar from "react-calendar";
import { employeeAPI, attendanceAPI } from "../services/api";
import "react-calendar/dist/Calendar.css";
import "../App.css";

function AttendanceCalendar() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [loadingCal, setLoadingCal] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const empRes = await employeeAPI.getEmployees();
        if (empRes.data.success) {
          setEmployees(empRes.data.data);
          if (empRes.data.data.length > 0) {
            const firstId = empRes.data.data[0]._id;
            setSelectedEmpId(firstId);
            loadEmployeeLogs(firstId);
          }
        }
      } catch (err) {
        console.error("Failed to load employees list:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const loadEmployeeLogs = async (empId) => {
    if (!empId) return;
    setLoadingCal(true);
    try {
      const res = await attendanceAPI.getAttendance(empId);
      if (res.data.success) {
        setAttendance(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load employee logs:", err);
    } finally {
      setLoadingCal(false);
    }
  };

  const handleEmployeeChange = (e) => {
    const val = e.target.value;
    setSelectedEmpId(val);
    loadEmployeeLogs(val);
  };

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
            <p className="mt-2 text-muted small fw-bold">Synchronizing Compliance Loggers...</p>
          </div>
        </div>
      </>
    );
  }

  const selectedStatus = getStatus(selectedDate) || "No Record";
  const selectedEmpDetails = employees.find(e => e._id === selectedEmpId);

  return (
    <>
      <Sidebar />
      <div className="main-content" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold m-0 text-dark">
              <i className="bi bi-calendar-check text-primary me-2"></i>Employee Attendance Calendar
            </h2>
            
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small fw-bold">Select Profile:</span>
              <select 
                className="form-select form-select-sm w-auto"
                value={selectedEmpId}
                onChange={handleEmployeeChange}
              >
                {employees.map(e => (
                  <option key={e._id} value={e._id}>{e.name} ({e.employeeId})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-6 mb-4">
              <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "15px" }}>
                {loadingCal ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
                    <p className="mt-2 text-muted small">Loading history...</p>
                  </div>
                ) : (
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    tileClassName={tileClassName}
                  />
                )}
              </div>
            </div>

            <div className="col-lg-6 mb-4">
              <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "15px", height: "100%" }}>
                <h5 className="fw-bold mb-3">Logs & Compliance Checklist</h5>
                {selectedEmpDetails && (
                  <div className="bg-light p-3 rounded mb-3">
                    <div className="mb-2">
                      <span className="text-muted small d-block">Employee</span>
                      <strong className="text-dark">{selectedEmpDetails.name} ({selectedEmpDetails.employeeId})</strong>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted small d-block">Selected Date</span>
                      <strong className="text-dark">{selectedDate.toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span className="text-muted small d-block">Status on Selected Date</span>
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
                )}

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

export default AttendanceCalendar;
