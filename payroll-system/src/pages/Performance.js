import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { employeeAPI, performanceAPI } from "../services/api";

function Performance() {
  const [role, setRole] = useState("employee");
  const [currentEmpId, setCurrentEmpId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [performanceData, setPerformanceData] = useState({});
  const [loading, setLoading] = useState(true);

  // Review Form States
  const [newRating, setNewRating] = useState(5);
  const [newComments, setNewComments] = useState("");
  const [newReward, setNewReward] = useState("None");
  const [kpiCoding, setKpiCoding] = useState(80);
  const [kpiTeamwork, setKpiTeamwork] = useState(80);
  const [kpiDelivery, setKpiDelivery] = useState(80);

  // Certificate State
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateDetails, setCertificateDetails] = useState(null);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const userRole = localStorage.getItem("role") || "employee";
      setRole(userRole);

      // Fetch employee list (Admin needs all, Employee needs self for profiling)
      const empRes = await employeeAPI.getEmployees();
      if (empRes.data.success) {
        setEmployees(empRes.data.data);
      }

      if (userRole === "admin") {
        if (empRes.data.data.length > 0) {
          const firstEmpId = empRes.data.data[0]._id;
          setSelectedEmpId(firstEmpId);
        }
      } else {
        const profileRes = await employeeAPI.getProfile();
        if (profileRes.data.success) {
          setCurrentEmpId(profileRes.data.data._id);
        }
      }

      // Fetch reviews
      const perfRes = await performanceAPI.getReviews();
      if (perfRes.data.success) {
        const perfObj = {};
        perfRes.data.data.forEach(p => {
          const empId = p.employee?._id || p.employee;
          perfObj[empId] = p;
        });
        setPerformanceData(perfObj);
      }
    } catch (err) {
      console.error("Failed to load performance scorecard telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!selectedEmpId || !newComments) {
      alert("Please select an employee and fill in review comments.");
      return;
    }

    try {
      const reviewData = {
        employeeId: selectedEmpId,
        rating: newRating,
        comments: newComments,
        reward: newReward,
        coding: parseInt(kpiCoding),
        teamwork: parseInt(kpiTeamwork),
        delivery: parseInt(kpiDelivery)
      };

      const res = await performanceAPI.upsertReview(reviewData);
      if (res.data.success) {
        alert("Performance evaluation saved successfully!");
        setNewComments("");
        setNewReward("None");
        
        // Refresh local UI states
        const updated = { ...performanceData };
        updated[selectedEmpId] = res.data.data;
        setPerformanceData(updated);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save performance evaluation");
    }
  };

  const handleGenerateCertificate = (empId) => {
    const emp = employees.find(e => e._id === empId);
    const perf = performanceData[empId];
    if (!emp || !perf || perf.reward === "None") {
      alert("Only employees with active awards/rewards can receive certificates.");
      return;
    }

    setCertificateDetails({
      name: emp.name,
      department: emp.department?.name || "Corporate Department",
      rewardName: perf.reward,
      date: new Date(perf.updatedAt || new Date()).toLocaleDateString(),
      company: "TechNova Solutions Pvt Ltd"
    });
    setShowCertificate(true);
  };

  // Render Stars helper
  const renderStars = (ratingVal, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`bi ${i <= ratingVal ? "bi-star-fill text-warning" : "bi-star text-muted"} me-1`}
          onClick={() => interactive && setNewRating(i)}
          style={{ cursor: interactive ? "pointer" : "default" }}
        />
      );
    }
    return <div className="star-rating d-inline-block">{stars}</div>;
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="main-content d-flex justify-content-center align-items-center vh-100 bg-light">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted small fw-bold">Querying Performance Appraisals...</p>
          </div>
        </div>
      </>
    );
  }

  // Get active target details for employee view or admin selection view
  const targetId = role === "admin" ? selectedEmpId : currentEmpId;
  const currentReview = performanceData[targetId] || {
    rating: 0,
    comments: "No performance review uploaded yet for this period.",
    reward: "None",
    coding: 50,
    teamwork: 50,
    delivery: 50
  };

  return (
    <>
      <Sidebar />
      <div className="main-content" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold m-0 text-dark">Performance Portal</h2>
            <span className="badge bg-primary px-3 py-2 fs-6">Module: Reviews & Appraisals</span>
          </div>

          <div className="row">
            {/* Left Column: Log a review (Admin view) OR view KPIs (Employee view) */}
            {role === "admin" ? (
              <div className="col-lg-4 mb-4">
                <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "15px" }}>
                  <h4 className="fw-bold mb-3"><i className="bi bi-bookmark-star text-primary me-2"></i>Log Appraisal</h4>
                  <form onSubmit={handleAddReview}>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">Select Employee</label>
                      <select 
                        className="form-select"
                        value={selectedEmpId}
                        onChange={(e) => {
                          setSelectedEmpId(e.target.value);
                          setShowCertificate(false);
                        }}
                      >
                        {employees.map(e => (
                          <option key={e._id} value={e._id}>{e.name} ({e.employeeId})</option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label d-block text-muted small fw-bold">Appraisal Rating</label>
                      {renderStars(newRating, true)}
                    </div>

                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">Review Comments</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Detail the employee's work quality..."
                        value={newComments}
                        onChange={(e) => setNewComments(e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">HR Award / Reward</label>
                      <select 
                        className="form-select"
                        value={newReward}
                        onChange={(e) => setNewReward(e.target.value)}
                      >
                        <option value="None">None</option>
                        <option value="Star of the Month">Star of the Month</option>
                        <option value="Team Player Award">Team Player Award</option>
                        <option value="Exceptional Performance">Exceptional Performance</option>
                        <option value="Innovator of the Quarter">Innovator of the Quarter</option>
                      </select>
                    </div>

                    <h5 className="fw-bold fs-6 mt-4 mb-2 text-dark">KPI Rating Scorecard (%)</h5>
                    
                    <div className="mb-2">
                      <label className="form-label small d-flex justify-content-between text-muted">
                        <span>Quality of Work</span>
                        <span className="fw-bold">{kpiCoding}%</span>
                      </label>
                      <input 
                        type="range" className="form-range" min="0" max="100" 
                        value={kpiCoding} onChange={(e) => setKpiCoding(e.target.value)}
                      />
                    </div>
                    
                    <div className="mb-2">
                      <label className="form-label small d-flex justify-content-between text-muted">
                        <span>Team Collaboration</span>
                        <span className="fw-bold">{kpiTeamwork}%</span>
                      </label>
                      <input 
                        type="range" className="form-range" min="0" max="100" 
                        value={kpiTeamwork} onChange={(e) => setKpiTeamwork(e.target.value)}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label small d-flex justify-content-between text-muted">
                        <span>Task Delivery Speed</span>
                        <span className="fw-bold">{kpiDelivery}%</span>
                      </label>
                      <input 
                        type="range" className="form-range" min="0" max="100" 
                        value={kpiDelivery} onChange={(e) => setKpiDelivery(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 fw-bold mt-2">
                      <i className="bi bi-save me-2"></i>Save Evaluation
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="col-lg-4 mb-4">
                <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "15px" }}>
                  <h4 className="fw-bold mb-3"><i className="bi bi-sliders text-primary me-2"></i>My KPI Scorecard</h4>
                  <p className="text-muted small">These indicators measure core performance across key target values.</p>

                  <div className="my-4">
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-semibold">Quality of Work</span>
                        <span className="text-primary fw-bold">{currentReview.coding}%</span>
                      </div>
                      <div className="progress" style={{ height: "8px" }}>
                        <div className="progress-bar bg-success" role="progressbar" style={{ width: `${currentReview.coding}%` }}></div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-semibold">Team Collaboration</span>
                        <span className="text-primary fw-bold">{currentReview.teamwork}%</span>
                      </div>
                      <div className="progress" style={{ height: "8px" }}>
                        <div className="progress-bar bg-info" role="progressbar" style={{ width: `${currentReview.teamwork}%` }}></div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-semibold">Task Delivery Speed</span>
                        <span className="text-primary fw-bold">{currentReview.delivery}%</span>
                      </div>
                      <div className="progress" style={{ height: "8px" }}>
                        <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${currentReview.delivery}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-light border-start border-4 border-primary">
                    <small className="d-block mb-1 text-muted">Manager Comments:</small>
                    <span className="fst-italic">"{currentReview.comments}"</span>
                  </div>
                </div>
              </div>
            )}

            {/* Right Column: Performance Summary / Certificate Builder */}
            <div className="col-lg-8 mb-4">
              <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "15px" }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="fw-bold m-0"><i className="bi bi-trophy text-primary me-2"></i>Appraisal Metrics</h4>
                  {role === "admin" && (
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleGenerateCertificate(selectedEmpId)}
                      disabled={currentReview.reward === "None"}
                    >
                      <i className="bi bi-award me-1"></i>Award Digital Certificate
                    </button>
                  )}
                </div>

                <div className="bg-light p-3 rounded-3 mb-4">
                  <div className="row align-items-center">
                    <div className="col-md-6 mb-2 mb-md-0">
                      <span className="text-muted d-block small">Evaluation Stars</span>
                      {renderStars(currentReview.rating)}
                    </div>
                    <div className="col-md-6 text-md-end">
                      <span className="text-muted d-block small">Award / Distinction</span>
                      <span className="badge bg-warning text-dark fs-6 py-2 px-3">
                        <i className="bi bi-gift me-1"></i>
                        {currentReview.reward}
                      </span>
                    </div>
                  </div>
                </div>

                {role === "employee" && currentReview.reward !== "None" && !showCertificate && (
                  <div className="text-center py-4 border border-dashed rounded mb-4">
                    <i className="bi bi-patch-check display-6 text-success d-block mb-2"></i>
                    <h5>Congratulations! You have received the <strong>{currentReview.reward}</strong>.</h5>
                    <button className="btn btn-primary mt-2" onClick={() => handleGenerateCertificate(currentEmpId)}>
                      <i className="bi bi-file-earmark-image me-1"></i>View Appreciation Certificate
                    </button>
                  </div>
                )}

                {showCertificate && certificateDetails && (
                  <div className="certificate-preview-container border p-4 bg-light rounded mt-3">
                    <div className="certificate-frame border border-secondary p-5 bg-white text-center shadow-sm" style={{ borderStyle: "double", borderWidth: "5px" }}>
                      <h2 className="fw-bold text-uppercase text-decoration-underline mb-1" style={{ color: "#c5a059" }}>Certificate of Appreciation</h2>
                      <p className="text-muted mb-4 small">ESTABLISHED BY CORPORATE LEADERSHIP BOARD</p>
                      
                      <p className="fs-6">This certificate is proudly presented to</p>
                      <h3 className="fw-bold text-primary my-3">{certificateDetails.name}</h3>
                      <p className="text-muted mb-2 small">from the <strong>{certificateDetails.department}</strong> department.</p>
                      
                      <p className="mt-4 px-4 fs-6">
                        In recognition of outstanding performance, professional commitment, and demonstrating the honor of the 
                        <strong className="d-block text-warning mt-2 fs-5">"{certificateDetails.rewardName}"</strong>
                      </p>
                      
                      <div className="d-flex justify-content-between align-items-end mt-5 pt-3 border-top">
                        <div className="text-start">
                          <small className="text-muted d-block" style={{ fontSize: "10px" }}>Award Date:</small>
                          <strong className="small">{certificateDetails.date}</strong>
                        </div>
                        <div>
                          <small className="text-muted d-block" style={{ fontSize: "10px" }}>Authorized Issuer:</small>
                          <strong className="small">{certificateDetails.company} HR</strong>
                        </div>
                        <button className="btn btn-outline-dark btn-sm d-print-none" onClick={() => window.print()}>
                          <i className="bi bi-printer me-1"></i>Print Certificate
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!showCertificate && (role === "admin" || currentReview.reward === "None") && (
                  <div className="d-flex align-items-center justify-content-center border border-dashed rounded text-muted py-5" style={{ minHeight: "300px" }}>
                    <div className="text-center">
                      <i className="bi bi-award-fill display-5 mb-2 d-block text-warning"></i>
                      {role === "admin" 
                        ? "Select an employee on the left with an active award distinction, and click 'Award Digital Certificate'."
                        : "No official appreciation award issued for this cycle."
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Performance;
