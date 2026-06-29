import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { leaveAPI } from "../services/api";

function LeaveRequest() {
  const [leaveType, setLeaveType] = useState("Casual");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [leaveList, setLeaveList] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLeavesAndBalances = async () => {
    try {
      const listRes = await leaveAPI.getLeaves();
      const balRes = await leaveAPI.getLeaveBalance();

      if (listRes.data.success) setLeaveList(listRes.data.data);
      if (balRes.data.success) setBalances(balRes.data.balance);
    } catch (err) {
      console.error("Failed to load leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeavesAndBalances();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason || !leaveType) {
      alert("Please fill all required fields");
      return;
    }

    setActionLoading(true);
    try {
      const res = await leaveAPI.applyLeave({
        leaveType,
        startDate: fromDate,
        endDate: toDate,
        reason
      });

      if (res.data.success) {
        alert("Leave request applied successfully!");
        setFromDate("");
        setToDate("");
        setReason("");
        fetchLeavesAndBalances();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit request");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="main-content" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <div className="container px-4">
          
          <h3 className="mb-4 fw-bold text-dark">
            <i className="bi bi-calendar-x-fill text-primary me-2"></i>My Leaves Center
          </h3>

          {/* Leave Balances Grid */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card shadow-sm border-0 p-3 bg-white" style={{ borderRadius: "10px" }}>
                <h6 className="text-muted small text-uppercase m-0">Casual Leaves</h6>
                <div className="d-flex justify-content-between align-items-baseline mt-2">
                  <h3 className="fw-bold m-0 text-primary">{balances ? balances.Casual.balance : 12}</h3>
                  <small className="text-muted">Limit: {balances ? balances.Casual.limit : 12}</small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm border-0 p-3 bg-white" style={{ borderRadius: "10px" }}>
                <h6 className="text-muted small text-uppercase m-0">Sick Leaves</h6>
                <div className="d-flex justify-content-between align-items-baseline mt-2">
                  <h3 className="fw-bold m-0 text-success">{balances ? balances.Sick.balance : 10}</h3>
                  <small className="text-muted">Limit: {balances ? balances.Sick.limit : 10}</small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm border-0 p-3 bg-white" style={{ borderRadius: "10px" }}>
                <h6 className="text-muted small text-uppercase m-0">Paid Leaves</h6>
                <div className="d-flex justify-content-between align-items-baseline mt-2">
                  <h3 className="fw-bold m-0 text-warning">{balances ? balances.Paid.balance : 15}</h3>
                  <small className="text-muted">Limit: {balances ? balances.Paid.limit : 15}</small>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* FORM */}
            <div className="col-lg-5">
              <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "15px" }}>
                <h5 className="fw-bold mb-3">Apply For Time Off</h5>
                <form onSubmit={handleApplyLeave}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Leave Type</label>
                    <select
                      className="form-select"
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                    >
                      <option value="Casual">Casual Leave</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Paid">Paid Leave</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">From Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">To Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Reason Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="e.g. Attending sister's wedding in native town"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 fw-bold py-2 mt-2"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    ) : (
                      <i className="bi bi-send-fill me-2"></i>
                    )}
                    Submit Application
                  </button>
                </form>
              </div>
            </div>

            {/* TABLE */}
            <div className="col-lg-7">
              <div className="card shadow-sm border-0 bg-white" style={{ borderRadius: "15px" }}>
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3">My Request History</h5>
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status"></div>
                      <p className="mt-2 text-muted small">Loading history...</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-dark">
                          <tr>
                            <th>Type</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Reason</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaveList.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="text-center text-muted py-4">
                                No leave requests recorded
                              </td>
                            </tr>
                          ) : (
                            leaveList.map(leave => (
                              <tr key={leave._id}>
                                <td><span className="badge bg-secondary">{leave.leaveType}</span></td>
                                <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                                <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                                <td className="small text-truncate" style={{ maxWidth: "150px" }}>{leave.reason}</td>
                                <td>
                                  <span className={`badge ${
                                    leave.status === "Approved" ? "bg-success" :
                                    leave.status === "Rejected" ? "bg-danger" : "bg-warning text-dark"
                                  }`}>
                                    {leave.status}
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

        </div>
      </div>
    </>
  );
}

export default LeaveRequest;
