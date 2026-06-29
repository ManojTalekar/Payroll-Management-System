import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { leaveAPI } from "../services/api";

function AdminLeaveManagement() {
  const [leaveList, setLeaveList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaveRequests = async () => {
    try {
      const res = await leaveAPI.getLeaves();
      if (res.data.success) {
        setLeaveList(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch leave requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await leaveAPI.updateLeaveStatus(id, newStatus);
      if (res.data.success) {
        alert(res.data.message);
        fetchLeaveRequests();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update leave request status");
    }
  };

  return (
    <>
      <Sidebar />
      <div className="main-content" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <div className="container-fluid">
          
          {/* HEADER */}
          <h2 className="fw-bold mb-4 text-dark">
            <i className="bi bi-person-check-fill me-2 text-primary"></i>Leave Requests Management
          </h2>

          {/* TABLE CARD */}
          <div className="card shadow-sm border-0" style={{ borderRadius: "15px" }}>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2 text-muted small">Loading leave requests...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th className="ps-4">Employee</th>
                        <th>Leave Type</th>
                        <th>From Date</th>
                        <th>To Date</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th className="pe-4 text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaveList.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center text-muted py-5">
                            <i className="bi bi-inbox fs-3 d-block mb-2"></i>
                            No leave applications submitted
                          </td>
                        </tr>
                      ) : (
                        leaveList.map(leave => (
                          <tr key={leave._id}>
                            <td className="ps-4 fw-semibold text-dark">
                              {leave.employee?.name || "Corporate Employee"} <br />
                              <small className="text-muted">ID: {leave.employee?.employeeId || "-"}</small>
                            </td>
                            <td>
                              <span className="badge bg-secondary">{leave.leaveType}</span>
                            </td>
                            <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                            <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                            <td>{leave.reason}</td>
                            <td>
                              <span className={`badge ${
                                leave.status === "Approved" ? "bg-success" :
                                leave.status === "Rejected" ? "bg-danger" :
                                "bg-warning text-dark"
                              }`}>
                                {leave.status}
                              </span>
                            </td>
                            <td className="pe-4 text-end">
                              {leave.status === "Pending" ? (
                                <>
                                  <button
                                    className="btn btn-success btn-sm me-2"
                                    onClick={() => updateStatus(leave._id, "Approved")}
                                  >
                                    <i className="bi bi-check-circle me-1"></i> Approve
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => updateStatus(leave._id, "Rejected")}
                                  >
                                    <i className="bi bi-x-circle me-1"></i> Reject
                                  </button>
                                </>
                              ) : (
                                <span className="text-muted small">Processed</span>
                              )}
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

export default AdminLeaveManagement;
