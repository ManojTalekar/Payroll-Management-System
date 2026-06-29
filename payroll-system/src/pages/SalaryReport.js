import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { employeeAPI } from "../services/api";

function SalaryReport() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await employeeAPI.getEmployees();
        if (res.data.success) {
          setEmployees(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load salary report employees:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const totalSalary = employees.reduce(
    (sum, emp) => sum + parseInt(emp.salary || 0),
    0
  );

  const totalEmployees = employees.length;

  return (
    <div>
      <Sidebar />
      <div className="main-content" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <h2 className="fw-bold mb-4 text-dark">
          <i className="bi bi-file-earmark-bar-graph-fill text-primary me-2"></i>Monthly Salaries Report
        </h2>

        {/* Summary cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "12px" }}>
              <h6 className="text-muted small text-uppercase">Contract Strength</h6>
              <h3 className="fw-bold text-dark m-0">{totalEmployees}</h3>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "12px" }}>
              <h6 className="text-muted small text-uppercase">Aggregate Monthly Basic Expense</h6>
              <h3 className="fw-bold text-success m-0">₹{totalSalary.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Salary table */}
        <div className="card shadow-sm border-0 bg-white" style={{ borderRadius: "15px" }}>
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">Employee Salary Details</h5>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Photo</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Salary scale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          No employees found
                        </td>
                      </tr>
                    ) : (
                      employees.map(emp => (
                        <tr key={emp._id}>
                          <td><span className="badge bg-secondary">{emp.employeeId}</span></td>
                          <td>
                            <img
                              src={emp.photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                              alt="profile"
                              width="40"
                              height="40"
                              className="rounded-circle border shadow-sm"
                            />
                          </td>
                          <td className="fw-semibold text-dark">{emp.name}</td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                              {emp.department?.name || "Corporate"}
                            </span>
                          </td>
                          <td className="text-muted">{emp.designation?.title || "Staff"}</td>
                          <td className="fw-bold text-success">
                            ₹{emp.salary.toLocaleString()}
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
  );
}

export default SalaryReport;
