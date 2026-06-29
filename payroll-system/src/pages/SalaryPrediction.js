import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { employeeAPI, attendanceAPI } from "../services/api";

function SalaryPrediction() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await employeeAPI.getEmployees();
        const attRes = await attendanceAPI.getAttendance();

        if (empRes.data.success) setEmployees(empRes.data.data);
        if (attRes.data.success) setAttendance(attRes.data.data);
      } catch (err) {
        console.error("Failed to load forecast data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculatePrediction = (empId, salary) => {
    // Count days present/late this period
    const activeDays = attendance.filter(
      att => (att.employee?._id === empId || att.employee === empId) && 
             (att.status === "Present" || att.status === "Late")
    ).length;

    // Estimate daily rate
    const perDaySalary = salary / 30;
    const predictedSalary = perDaySalary * activeDays;

    return {
      days: activeDays,
      predicted: predictedSalary.toFixed(0)
    };
  };

  const totalPrediction = employees.reduce((sum, emp) => {
    const result = calculatePrediction(emp._id, emp.salary);
    return sum + parseInt(result.predicted);
  }, 0);

  return (
    <>
      <Sidebar />
      <div className="main-content" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <div className="container px-4">
          
          <h2 className="fw-bold mb-4 text-dark">
            <i className="bi bi-graph-up text-primary me-2"></i>AI Salary Forecast & Predictions
          </h2>

          {/* Summary Card */}
          <div className="card shadow-sm mb-4 p-4 text-white border-0" style={{
            background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
            borderRadius: "15px"
          }}>
            <h5 className="opacity-75 small text-uppercase mb-2">Total Estimated Salary Liability</h5>
            <h2 className="fw-bold m-0">₹{totalPrediction.toLocaleString()}</h2>
            <small className="opacity-50 mt-1 d-block">Based on real-time check-in stats and late clock-in deductions</small>
          </div>

          {/* Table Card */}
          <div className="card shadow-sm border-0 bg-white" style={{ borderRadius: "15px" }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3"><i className="bi bi-cpu text-primary me-2"></i>Employee Projections</h5>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>Employee ID</th>
                        <th>Name</th>
                        <th>Standard Salary</th>
                        <th>Active Logged Days</th>
                        <th>Projected Payout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center text-muted py-4">No employee logs available</td>
                        </tr>
                      ) : (
                        employees.map(emp => {
                          const result = calculatePrediction(emp._id, emp.salary);
                          return (
                            <tr key={emp._id}>
                              <td><span className="badge bg-secondary">{emp.employeeId}</span></td>
                              <td className="fw-semibold text-dark">{emp.name}</td>
                              <td>₹{emp.salary.toLocaleString()}</td>
                              <td><span className="badge bg-success">{result.days} Days</span></td>
                              <td className="fw-bold text-primary">₹{parseInt(result.predicted).toLocaleString()}</td>
                            </tr>
                          );
                        })
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

export default SalaryPrediction;
