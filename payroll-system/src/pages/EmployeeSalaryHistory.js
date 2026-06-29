import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { employeeAPI, salaryAPI } from "../services/api";

function EmployeeSalaryHistory() {
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const profRes = await employeeAPI.getProfile();
        if (profRes.data.success) {
          const emp = profRes.data.data;
          const res = await salaryAPI.getSalaries(emp._id);
          if (res.data.success) {
            setSalaryHistory(res.data.data);
          }
        }
      } catch (err) {
        console.error("Failed to load employee salary ledger:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <>
      <Sidebar />
      <div className="main-content" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <div className="container-fluid">
          
          <h2 className="fw-bold mb-4 text-dark">
            <i className="bi bi-clock-history text-primary me-2"></i>My Salary History Ledger
          </h2>

          <div className="card shadow-sm border-0" style={{ borderRadius: "15px" }}>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2 text-muted small">Loading salary statements history...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th className="ps-4">Period</th>
                        <th>Basic Salary</th>
                        <th>HRA + DA</th>
                        <th>Overtime Pay</th>
                        <th>PF + Taxes Deducted</th>
                        <th>Net Credited</th>
                        <th className="pe-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryHistory.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center text-muted py-4">
                            No salary statement records found in database
                          </td>
                        </tr>
                      ) : (
                        salaryHistory.map((item) => (
                          <tr key={item._id}>
                            <td className="ps-4 fw-semibold text-dark">
                              {item.month}/{item.year}
                            </td>
                            <td>₹{item.basicSalary.toLocaleString()}</td>
                            <td>₹{(item.hra + item.da).toLocaleString()}</td>
                            <td className="text-success">+ ₹{item.overtimePay.toLocaleString()}</td>
                            <td className="text-danger">- ₹{(item.pf + item.esi + item.professionalTax + item.incomeTax).toLocaleString()}</td>
                            <td className="fw-bold text-primary">₹{item.netSalary.toLocaleString()}</td>
                            <td className="pe-4">
                              <span className={`badge ${item.status === "Paid" ? "bg-success" : "bg-warning text-dark"}`}>
                                {item.status}
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

export default EmployeeSalaryHistory;
