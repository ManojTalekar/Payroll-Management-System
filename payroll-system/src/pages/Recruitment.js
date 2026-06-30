import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { recruitmentAPI } from "../services/api";

function Recruitment() {
  const [activeTab, setActiveTab] = useState("jobs");
  const [loading, setLoading] = useState(true);
  
  // States for Recruitment Data
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  
  // Job Form States
  const [jobTitle, setJobTitle] = useState("");
  const [jobDept, setJobDept] = useState("");
  const [jobOpenings, setJobOpenings] = useState("");
  const [jobStatus, setJobStatus] = useState("Active");

  // Candidate Form States
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidateJob, setCandidateJob] = useState("");
  const [candidateStage, setCandidateStage] = useState("Applied");

  // Interview Form States
  const [intCandidateId, setIntCandidateId] = useState("");
  const [intInterviewer, setIntInterviewer] = useState("");
  const [intDate, setIntDate] = useState("");
  const [intTime, setIntTime] = useState("");

  // Offer Letter Form States
  const [offerCandidateId, setOfferCandidateId] = useState("");
  const [offerSalary, setOfferSalary] = useState("");
  const [offerJoiningDate, setOfferJoiningDate] = useState("");
  const [selectedOfferLetter, setSelectedOfferLetter] = useState(null);

  const fetchRecruitmentData = async () => {
    setLoading(true);
    try {
      const jobRes = await recruitmentAPI.getJobs();
      const candRes = await recruitmentAPI.getCandidates();
      const intRes = await recruitmentAPI.getInterviews();

      if (jobRes.data.success) setJobs(jobRes.data.data);
      if (candRes.data.success) setCandidates(candRes.data.data);
      if (intRes.data.success) setInterviews(intRes.data.data);
    } catch (err) {
      console.error("Failed to load recruitment data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load and initialize data
  useEffect(() => {
    fetchRecruitmentData();
  }, []);

  // Handlers
  const handleAddJob = async (e) => {
    e.preventDefault();
    if (!jobTitle || !jobDept || !jobOpenings) {
      alert("Please fill in all job opening fields.");
      return;
    }

    try {
      const newJob = {
        title: jobTitle,
        department: jobDept,
        openings: parseInt(jobOpenings),
        status: jobStatus
      };

      const res = await recruitmentAPI.createJob(newJob);
      if (res.data.success) {
        alert("Job opening posted successfully!");
        setJobTitle("");
        setJobDept("");
        setJobOpenings("");
        setJobStatus("Active");
        // Reload list
        const refreshedJobs = await recruitmentAPI.getJobs();
        if (refreshedJobs.data.success) setJobs(refreshedJobs.data.data);
      }
    } catch (err) {
      alert("Failed to post job vacancy");
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!candidateName || !candidateEmail || !candidateJob) {
      alert("Please fill in all candidate details.");
      return;
    }

    try {
      const newCandidate = {
        name: candidateName,
        email: candidateEmail,
        jobTitle: candidateJob,
        stage: candidateStage
      };

      const res = await recruitmentAPI.createCandidate(newCandidate);
      if (res.data.success) {
        alert("Candidate added successfully!");
        setCandidateName("");
        setCandidateEmail("");
        setCandidateJob("");
        setCandidateStage("Applied");
        // Reload candidates list
        const refreshedCands = await recruitmentAPI.getCandidates();
        if (refreshedCands.data.success) setCandidates(refreshedCands.data.data);
      }
    } catch (err) {
      alert("Failed to add candidate");
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!intCandidateId || !intInterviewer || !intDate || !intTime) {
      alert("Please fill in all interview scheduling fields.");
      return;
    }

    try {
      const newInt = {
        candidateId: intCandidateId,
        interviewer: intInterviewer,
        date: intDate,
        time: intTime
      };

      const res = await recruitmentAPI.createInterview(newInt);
      if (res.data.success) {
        alert("Interview scheduled successfully!");
        setIntCandidateId("");
        setIntInterviewer("");
        setIntDate("");
        setIntTime("");
        // Reload lists
        const refreshedInts = await recruitmentAPI.getInterviews();
        const refreshedCands = await recruitmentAPI.getCandidates();
        if (refreshedInts.data.success) setInterviews(refreshedInts.data.data);
        if (refreshedCands.data.success) setCandidates(refreshedCands.data.data);
      }
    } catch (err) {
      alert("Failed to schedule interview");
    }
  };

  const handleGenerateOffer = async (e) => {
    e.preventDefault();
    if (!offerCandidateId || !offerSalary || !offerJoiningDate) {
      alert("Please fill in all offer letter fields.");
      return;
    }

    const cand = candidates.find(c => c._id === offerCandidateId);
    if (!cand) return;

    try {
      // Update candidate stage to Offered in MongoDB
      const res = await recruitmentAPI.updateCandidateStage(offerCandidateId, "Offered");
      if (res.data.success) {
        const generated = {
          candidateName: cand.name,
          jobTitle: cand.jobTitle,
          salary: offerSalary,
          joiningDate: offerJoiningDate,
          company: "Payroll Pro"
        };
        setSelectedOfferLetter(generated);

        // Reload candidates list
        const refreshedCands = await recruitmentAPI.getCandidates();
        if (refreshedCands.data.success) setCandidates(refreshedCands.data.data);
      }
    } catch (err) {
      alert("Failed to generate offer letter");
    }
  };

  const updateCandidateStage = async (id, newStage) => {
    try {
      const res = await recruitmentAPI.updateCandidateStage(id, newStage);
      if (res.data.success) {
        const refreshedCands = await recruitmentAPI.getCandidates();
        if (refreshedCands.data.success) setCandidates(refreshedCands.data.data);
      }
    } catch (err) {
      alert("Failed to update candidate pipeline stage");
    }
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="main-content d-flex justify-content-center align-items-center vh-100 bg-light">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted small fw-bold">Synchronizing Recruitment Engine...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="main-content" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold m-0 text-dark">Recruitment Hub</h2>
            <span className="badge bg-primary px-3 py-2 fs-6">Module: Recruitment & Hiring</span>
          </div>

          {/* Navigation Tabs */}
          <div className="card shadow-sm border-0 mb-4 bg-light">
            <div className="card-body p-2">
              <ul className="nav nav-pills nav-fill">
                <li className="nav-item">
                  <button 
                    className={`nav-link fw-bold ${activeTab === "jobs" ? "active bg-primary text-white" : "text-dark"}`}
                    onClick={() => setActiveTab("jobs")}
                  >
                    <i className="bi bi-briefcase me-2"></i> Job Openings
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link fw-bold ${activeTab === "candidates" ? "active bg-primary text-white" : "text-dark"}`}
                    onClick={() => setActiveTab("candidates")}
                  >
                    <i className="bi bi-people me-2"></i> Candidates Pipeline
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link fw-bold ${activeTab === "interviews" ? "active bg-primary text-white" : "text-dark"}`}
                    onClick={() => setActiveTab("interviews")}
                  >
                    <i className="bi bi-calendar-event me-2"></i> Interview Schedules
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link fw-bold ${activeTab === "offers" ? "active bg-primary text-white" : "text-dark"}`}
                    onClick={() => setActiveTab("offers")}
                  >
                    <i className="bi bi-file-earmark-pdf me-2"></i> Offer Letters
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Tab Contents */}
          {activeTab === "jobs" && (
            <div className="row">
              {/* Post a Job Form */}
              <div className="col-lg-4 mb-4">
                <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "15px" }}>
                  <h4 className="fw-bold mb-3"><i className="bi bi-plus-circle-dotted me-2 text-primary"></i>Post Job Opening</h4>
                  <form onSubmit={handleAddJob}>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">Job Title</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Node.js Developer"
                        value={jobTitle} 
                        onChange={(e) => setJobTitle(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">Department</label>
                      <select 
                        className="form-select"
                        value={jobDept} 
                        onChange={(e) => setJobDept(e.target.value)}
                      >
                        <option value="">Select Department</option>
                        <option value="IT">IT</option>
                        <option value="HR">HR</option>
                        <option value="Sales">Sales</option>
                        <option value="Finance">Finance</option>
                        <option value="Marketing">Marketing</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">No. of Openings</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        min="1"
                        placeholder="e.g. 3"
                        value={jobOpenings} 
                        onChange={(e) => setJobOpenings(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">Status</label>
                      <select 
                        className="form-select"
                        value={jobStatus} 
                        onChange={(e) => setJobStatus(e.target.value)}
                      >
                        <option value="Active">Active</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 fw-bold">
                      <i className="bi bi-send me-2"></i>Post Job
                    </button>
                  </form>
                </div>
              </div>

              {/* Active Jobs List */}
              <div className="col-lg-8 mb-4">
                <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "15px" }}>
                  <h4 className="fw-bold mb-3"><i className="bi bi-list-task me-2 text-primary"></i>Active Vacancies</h4>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-dark">
                        <tr>
                          <th>Job ID</th>
                          <th>Title</th>
                          <th>Department</th>
                          <th>Openings</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map(j => (
                          <tr key={j._id}>
                            <td><span className="badge bg-secondary">{j.jobId}</span></td>
                            <td className="fw-bold text-dark">{j.title}</td>
                            <td>{j.department}</td>
                            <td>{j.openings}</td>
                            <td>
                              <span className={`badge ${j.status === "Active" ? "bg-success" : "bg-danger"}`}>
                                {j.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "candidates" && (
            <div className="row">
              {/* Add Candidate Form */}
              <div className="col-lg-4 mb-4">
                <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "15px" }}>
                  <h4 className="fw-bold mb-3"><i className="bi bi-person-plus-fill me-2 text-primary"></i>Add Candidate</h4>
                  <form onSubmit={handleAddCandidate}>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">Candidate Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Ramesh Kumar"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">Email Address</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        placeholder="e.g. ramesh@example.com"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">Applying For Job</label>
                      <select 
                        className="form-select"
                        value={candidateJob}
                        onChange={(e) => setCandidateJob(e.target.value)}
                      >
                        <option value="">Select Applied Job</option>
                        {jobs.map(j => (
                          <option key={j._id} value={j.title}>{j.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">Initial Stage</label>
                      <select 
                        className="form-select"
                        value={candidateStage}
                        onChange={(e) => setCandidateStage(e.target.value)}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                        <option value="Offered">Offered</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 fw-bold">
                      <i className="bi bi-check2-circle me-2"></i>Add to Pipeline
                    </button>
                  </form>
                </div>
              </div>

              {/* Candidate Pipeline Tracker */}
              <div className="col-lg-8 mb-4">
                <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "15px" }}>
                  <h4 className="fw-bold mb-3"><i className="bi bi-funnel-fill me-2 text-primary"></i>Hiring Funnel</h4>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-dark">
                        <tr>
                          <th>Candidate</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Current Stage</th>
                          <th>Update Stage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidates.map(c => (
                          <tr key={c._id}>
                            <td>
                              <div className="fw-bold text-dark">{c.name}</div>
                              <small className="text-muted">{c.candidateId}</small>
                            </td>
                            <td>{c.email}</td>
                            <td>{c.jobTitle}</td>
                            <td>
                              <span className={`badge ${
                                c.stage === "Applied" ? "bg-info" :
                                c.stage === "Interview Scheduled" ? "bg-warning text-dark" :
                                c.stage === "Offered" ? "bg-success" : "bg-danger"
                              }`}>
                                {c.stage}
                              </span>
                            </td>
                            <td>
                              <select 
                                className="form-select form-select-sm w-auto"
                                value={c.stage}
                                onChange={(e) => updateCandidateStage(c._id, e.target.value)}
                              >
                                <option value="Applied">Applied</option>
                                <option value="Interview Scheduled">Interview Scheduled</option>
                                <option value="Offered">Offered</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "interviews" && (
            <div className="row">
              {/* Schedule Form */}
              <div className="col-lg-4 mb-4">
                <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "15px" }}>
                  <h4 className="fw-bold mb-3"><i className="bi bi-calendar-plus me-2 text-primary"></i>Schedule Interview</h4>
                  <form onSubmit={handleScheduleInterview}>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">Select Candidate</label>
                      <select 
                        className="form-select"
                        value={intCandidateId}
                        onChange={(e) => setIntCandidateId(e.target.value)}
                      >
                        <option value="">Select Candidate</option>
                        {candidates.filter(c => c.stage !== "Offered" && c.stage !== "Rejected").map(c => (
                          <option key={c._id} value={c._id}>{c.name} ({c.jobTitle})</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">Interviewer Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Siddharth (Tech Lead)"
                        value={intInterviewer}
                        onChange={(e) => setIntInterviewer(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={intDate}
                        onChange={(e) => setIntDate(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">Time</label>
                      <input 
                        type="time" 
                        className="form-control" 
                        value={intTime}
                        onChange={(e) => setIntTime(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 fw-bold">
                      <i className="bi bi-clock-history me-2"></i>Save Interview
                    </button>
                  </form>
                </div>
              </div>

              {/* Schedule List */}
              <div className="col-lg-8 mb-4">
                <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "15px" }}>
                  <h4 className="fw-bold mb-3"><i className="bi bi-calendar-check-fill me-2 text-primary"></i>Upcoming Schedules</h4>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-dark">
                        <tr>
                          <th>Candidate</th>
                          <th>Role</th>
                          <th>Interviewer</th>
                          <th>Date & Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {interviews.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="text-center text-muted py-3">No upcoming interviews scheduled</td>
                          </tr>
                        ) : (
                          interviews.map(i => (
                            <tr key={i._id}>
                              <td className="fw-bold text-dark">{i.candidateName || (i.candidate && i.candidate.name)}</td>
                              <td>{i.jobTitle}</td>
                              <td>{i.interviewer}</td>
                              <td>
                                <span className="badge bg-light text-dark border me-2"><i className="bi bi-calendar3 me-1 text-primary"></i>{i.date}</span>
                                <span className="badge bg-light text-dark border"><i className="bi bi-clock me-1 text-primary"></i>{i.time}</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "offers" && (
            <div className="row">
              {/* Offer Letter Creator */}
              <div className="col-lg-5 mb-4">
                <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "15px" }}>
                  <h4 className="fw-bold mb-3"><i className="bi bi-file-earmark-plus me-2 text-primary"></i>Generate Offer</h4>
                  <form onSubmit={handleGenerateOffer}>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">Select Offered Candidate</label>
                      <select 
                        className="form-select"
                        value={offerCandidateId}
                        onChange={(e) => setOfferCandidateId(e.target.value)}
                      >
                        <option value="">Select Candidate</option>
                        {candidates.filter(c => c.stage === "Offered" || c.stage === "Interview Scheduled" || c.stage === "Applied").map(c => (
                          <option key={c._id} value={c._id}>{c.name} ({c.jobTitle})</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">Offered Salary (₹ Per Annum)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="e.g. 850000"
                        value={offerSalary}
                        onChange={(e) => setOfferSalary(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">Proposed Joining Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={offerJoiningDate}
                        onChange={(e) => setOfferJoiningDate(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 fw-bold">
                      <i className="bi bi-file-earmark-pdf-fill me-2"></i>Generate Offer Letter
                    </button>
                  </form>
                </div>
              </div>

              {/* Offer Letter Preview Frame */}
              <div className="col-lg-7 mb-4">
                <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "15px" }}>
                  <h4 className="fw-bold mb-3"><i className="bi bi-eye-fill me-2 text-primary"></i>Offer Document Preview</h4>
                  {selectedOfferLetter ? (
                    <div className="border p-4 bg-white rounded shadow-sm" style={{ minHeight: "350px", borderLeft: "5px solid #ffc107" }}>
                      <div className="text-center mb-4">
                        <h4 className="fw-bold text-uppercase m-0">{selectedOfferLetter.company}</h4>
                        <small className="text-muted">Corporate Headquarters | Human Resources Department</small>
                        <hr className="my-2"/>
                      </div>
                      <p className="small"><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                      <p className="small">To,</p>
                      <h5 className="fw-bold m-0 text-dark">{selectedOfferLetter.candidateName}</h5>
                      <p className="text-muted small">Offered Candidate</p>
                      
                      <p className="mt-3 small" style={{ lineHeight: "1.6" }}>
                        We are pleased to offer you employment with <strong>{selectedOfferLetter.company}</strong> in the position of <strong>{selectedOfferLetter.jobTitle}</strong>. 
                        Your starting salary will be <strong>₹{parseInt(selectedOfferLetter.salary).toLocaleString()} per annum</strong>, payable in accordance with the company payroll cycles.
                      </p>
                      <p className="small" style={{ lineHeight: "1.6" }}>
                        Your scheduled joining date is <strong>{selectedOfferLetter.joiningDate}</strong>. On your first day, please report to the HR Induction desk with your identification documents.
                      </p>
                      <p className="mt-4 small">
                        Sincerely,
                      </p>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div>
                          <p className="fw-bold m-0 small text-dark">Manoj Talekar</p>
                          <small className="text-muted">Chief Human Resource Officer</small>
                        </div>
                        <button className="btn btn-outline-dark btn-sm" onClick={() => window.print()}>
                          <i className="bi bi-printer me-2"></i>Print / Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center border border-dashed rounded text-muted py-5" style={{ minHeight: "350px" }}>
                      <div className="text-center">
                        <i className="bi bi-file-earmark-text display-4 mb-2 d-block"></i>
                        Generate an offer letter on the left to see preview here.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Recruitment;
