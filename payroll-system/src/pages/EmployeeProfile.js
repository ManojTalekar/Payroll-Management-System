import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { employeeAPI } from "../services/api";

function EmployeeProfile() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await employeeAPI.getProfile();
        if (res.data.success) {
          setEmployee(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load employee profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="main-content d-flex justify-content-center align-items-center vh-100 bg-light">
          <div className="spinner-border text-info" role="status"></div>
        </div>
      </>
    );
  }

  if (!employee) {
    return (
      <>
        <Sidebar />
        <div className="main-content">
          <div className="container mt-4">
            <div className="alert alert-warning shadow">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Employee data not found in corporate directory
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="main-content" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <div className="container">
          
          {/* HEADER */}
          <div className="card shadow-sm border-0 mb-4 text-white" style={{
            background: "linear-gradient(90deg, #00c6ff, #0072ff)",
            borderRadius: "15px"
          }}>
            <div className="card-body p-4">
              <h2 className="fw-bold m-0">
                <i className="bi bi-person-circle me-2"></i>My Workspace Profile
              </h2>
              <p className="mb-0 mt-1 opacity-75">Welcome, {employee.name}</p>
            </div>
          </div>

          {/* PROFILE CARD */}
          <div className="card shadow-sm border-0 bg-white" style={{ borderRadius: "20px" }}>
            <div className="card-body p-4">
              <div className="row align-items-center">
                {/* PHOTO */}
                <div className="col-md-4 text-center border-end">
                  <img
                    src={employee.photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                    alt="profile"
                    width="150"
                    height="150"
                    className="rounded-circle shadow border object-fit-cover"
                  />
                  <h4 className="mt-3 fw-bold text-dark">{employee.name}</h4>
                  <span className="badge bg-primary fs-6 mb-2">
                    <i className="bi bi-person-badge me-1"></i>{employee.designation?.title || "Contract Worker"}
                  </span>
                  <div>
                    <span className="badge bg-secondary-subtle text-secondary px-2 py-1">
                      {employee.department?.name || "Corporate"}
                    </span>
                  </div>
                </div>

                {/* INFO */}
                <div className="col-md-8">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted d-block">Employee ID</small>
                        <strong className="text-dark">{employee.employeeId}</strong>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted d-block">Joining Date</small>
                        <strong className="text-dark">{new Date(employee.joiningDate).toLocaleDateString()}</strong>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted d-block">Basic Salary Scale</small>
                        <strong className="text-success">₹{employee.salary.toLocaleString()} / month</strong>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted d-block">Shift Configuration</small>
                        <strong className="text-dark">{employee.shift?.name || "General Shift"}</strong>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted d-block">Personal Contact Phone</small>
                        <strong className="text-dark">{employee.phone || "-"}</strong>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <small className="text-muted d-block">Residential Address</small>
                        <strong className="text-dark small">{employee.address || "-"}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default EmployeeProfile;
