import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { employeeAPI } from "../services/api";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await employeeAPI.getProfile();
        if (res.data.success) {
          setProfile(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load admin profile:", err);
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
          <div className="spinner-border text-primary" role="status"></div>
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
            background: "linear-gradient(90deg, #667eea, #764ba2)",
            borderRadius: "15px"
          }}>
            <div className="card-body p-4">
              <h2 className="fw-bold m-0">
                <i className="bi bi-person-badge-fill me-2"></i>My Profile Console
              </h2>
              <p className="mb-0 mt-1 opacity-75">Control and inspect administrative credentials</p>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card shadow-sm border-0 text-center bg-white p-4" style={{ borderRadius: "20px" }}>
                <div className="mb-3">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    alt="profile"
                    width="120"
                    height="120"
                    className="rounded-circle border shadow-sm"
                  />
                </div>

                <h3 className="fw-bold text-dark">{profile?.name || "HR Administrator"}</h3>
                <span className="badge bg-primary fs-6 mb-3">
                  <i className="bi bi-shield-check me-1"></i>System Administrator
                </span>
                
                <hr />

                <div className="text-start p-2">
                  <div className="mb-3">
                    <i className="bi bi-envelope-fill text-primary me-2"></i>
                    <strong>Corporate Email:</strong>
                    <div className="text-muted small">{profile?.email || "admin@technova.com"}</div>
                  </div>
                  <div className="mb-3">
                    <i className="bi bi-building text-success me-2"></i>
                    <strong>Department Authority:</strong>
                    <div className="text-muted small">Human Resources Operations</div>
                  </div>
                  <div className="mb-3">
                    <i className="bi bi-calendar-check text-warning me-2"></i>
                    <strong>Registry Creation Date:</strong>
                    <div className="text-muted small">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "01/01/2026"}
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

export default Profile;
