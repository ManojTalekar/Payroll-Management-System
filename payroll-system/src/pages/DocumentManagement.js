import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { employeeAPI, hrAPI } from "../services/api";

function DocumentManagement() {
  const [role, setRole] = useState("employee");
  const [employees, setEmployees] = useState([]);
  
  // Selection state for HR letter builder (Admin role)
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [activeLetterType, setActiveLetterType] = useState(""); // "appointment", "experience"
  const [generatedLetter, setGeneratedLetter] = useState(null);

  // File Upload lists from DB
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploadingType, setUploadingType] = useState("");

  const loadEmployeeDocuments = useCallback(async (empId) => {
    setLoadingDocs(true);
    try {
      const res = await hrAPI.getDocuments(empId);
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load documents list:", err);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  const fetchCorporateData = useCallback(async () => {
    try {
      const userRole = localStorage.getItem("role") || "employee";
      setRole(userRole);

      const empRes = await employeeAPI.getEmployees();
      if (empRes.data.success) {
        setEmployees(empRes.data.data);
        if (empRes.data.data.length > 0) {
          // Set initial target employee for admin inspection
          const firstEmp = empRes.data.data[0];
          setSelectedEmpId(firstEmp._id);
          loadEmployeeDocuments(firstEmp._id);
        } else {
          setLoadingDocs(false);
        }
      }
    } catch (err) {
      console.error("Failed to load document dashboard data:", err);
      setLoadingDocs(false);
    }
  }, [loadEmployeeDocuments]);

  useEffect(() => {
    fetchCorporateData();
  }, [fetchCorporateData]);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB. Please upload a smaller file.");
      return;
    }

    setUploadingType(type);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    
    const targetId = role === "admin" ? selectedEmpId : undefined; // Backend will default to self if not provided or admin chooses
    if (targetId) {
      formData.append("employeeId", targetId);
    }

    try {
      const res = await hrAPI.uploadDocument(formData);
      if (res.data.success) {
        alert(`${type} document uploaded successfully!`);
        // Refresh list
        loadEmployeeDocuments(role === "admin" ? selectedEmpId : undefined);
      }
    } catch (err) {
      alert(err.response?.data?.message || "File upload failed");
    } finally {
      setUploadingType("");
    }
  };

  const deleteDocument = async (id) => {
    if (!window.confirm("Remove this document permanently?")) return;

    try {
      const res = await hrAPI.deleteDocument(id);
      if (res.data.success) {
        alert(res.data.message);
        loadEmployeeDocuments(role === "admin" ? selectedEmpId : undefined);
      }
    } catch (err) {
      alert("Failed to delete document");
    }
  };

  const handleGenerateLetter = (type) => {
    const targetEmpId = role === "admin" ? selectedEmpId : undefined;
    const emp = employees.find(e => e._id === targetEmpId || e.employeeId === targetEmpId);
    if (!emp) {
      alert("Please select a valid employee first.");
      return;
    }

    setActiveLetterType(type);
    setGeneratedLetter({
      name: emp.name,
      id: emp.employeeId,
      department: emp.department?.name || "Corporate Dept",
      joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : "2024-01-01",
      salary: emp.salary || "50000",
      company: "Payroll Pro",
      currentDate: new Date().toLocaleDateString()
    });
  };

  // Check if specific document type is already uploaded
  const getDocByType = (type) => {
    return documents.find(d => d.type === type);
  };

  return (
    <>
      <Sidebar />
      <div className="main-content" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold m-0 text-dark">
              <i className="bi bi-folder2-open text-primary me-2"></i>Document Hub
            </h2>
            <span className="badge bg-success px-3 py-2 fs-6">Module: Corporate Vault</span>
          </div>

          <div className="row">
            {/* Left Column: File Repository */}
            <div className="col-lg-6 mb-4">
              <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "15px" }}>
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-3 g-2">
                  <h5 className="fw-bold m-0 text-dark">
                    <i className="bi bi-shield-lock-fill text-info me-2"></i>
                    {role === "admin" ? "Credentials Vault" : "My Credentials"}
                  </h5>
                  {role === "admin" && (
                    <select 
                      className="form-select form-select-sm w-auto"
                      value={selectedEmpId}
                      onChange={(e) => {
                        setSelectedEmpId(e.target.value);
                        loadEmployeeDocuments(e.target.value);
                        setGeneratedLetter(null);
                      }}
                    >
                      {employees.map(e => (
                        <option key={e._id} value={e._id}>{e.name} ({e.employeeId})</option>
                      ))}
                    </select>
                  )}
                </div>

                <p className="text-muted small">Securely upload and inspect identity papers (Resume, Aadhaar, PAN card). File size threshold limit: 5MB.</p>

                {/* Upload Rows */}
                {loadingDocs ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary"></div>
                  </div>
                ) : (
                  <div className="list-group list-group-flush mt-2">
                    {["Resume", "Aadhaar", "PAN"].map((docType) => {
                      const doc = getDocByType(docType);
                      return (
                        <div key={docType} className="list-group-item d-flex flex-column py-3 border-0 bg-light rounded-3 mb-2">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold text-dark">
                              <i className={`bi ${docType === "Resume" ? "bi-file-earmark-person-fill" : docType === "Aadhaar" ? "bi-shield-check" : "bi-card-heading"} me-2 text-primary`}></i>
                              {docType} Card / CV
                            </span>
                            {doc ? (
                              <span className="badge bg-success">Uploaded</span>
                            ) : (
                              <span className="badge bg-warning text-dark">Pending</span>
                            )}
                          </div>
                          
                          {doc ? (
                            <div className="d-flex justify-content-between align-items-center bg-white p-2 rounded border">
                              <small className="text-truncate text-muted" style={{ maxWidth: "200px" }}>{doc.name}</small>
                              <div>
                                <a 
                                  href={doc.fileUrl.startsWith("http") ? doc.fileUrl : `${(process.env.REACT_APP_API_URL || "http://localhost:10000/api").replace("/api", "")}${doc.fileUrl}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="btn btn-outline-primary btn-sm me-2"
                                  title="Download / View"
                                >
                                  <i className="bi bi-download"></i>
                                </a>
                                <button className="btn btn-outline-danger btn-sm" onClick={() => deleteDocument(doc._id)}>
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="input-group">
                              <input 
                                type="file" 
                                className="form-control form-control-sm"
                                accept={docType === "Resume" ? ".pdf,.doc,.docx" : "image/*,.pdf"}
                                onChange={(e) => handleFileUpload(e, docType)}
                                disabled={uploadingType === docType}
                              />
                              {uploadingType === docType && (
                                <span className="input-group-text bg-white"><span className="spinner-border spinner-border-sm text-primary"></span></span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: HR Letters */}
            <div className="col-lg-6 mb-4">
              <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "15px" }}>
                <h5 className="fw-bold mb-3"><i className="bi bi-file-earmark-medical-fill text-primary me-2"></i>Official HR Letters</h5>
                <p className="text-muted small">Draft corporate contracts, letters of appointments, or experience credentials.</p>
                
                <div className="row g-2 mb-4">
                  <div className="col-6">
                    <button 
                      className={`btn w-100 p-3 text-center fw-bold border ${activeLetterType === "appointment" ? "bg-primary text-white" : "bg-white text-dark"}`}
                      onClick={() => handleGenerateLetter("appointment")}
                    >
                      <i className="bi bi-briefcase display-6 d-block mb-1 text-info"></i>
                      Appointment Letter
                    </button>
                  </div>
                  <div className="col-6">
                    <button 
                      className={`btn w-100 p-3 text-center fw-bold border ${activeLetterType === "experience" ? "bg-primary text-white" : "bg-white text-dark"}`}
                      onClick={() => handleGenerateLetter("experience")}
                    >
                      <i className="bi bi-award display-6 d-block mb-1 text-warning"></i>
                      Experience Letter
                    </button>
                  </div>
                </div>

                {generatedLetter ? (
                  <div className="border p-4 bg-white rounded shadow-sm" style={{ borderTop: "5px solid #0072ff" }}>
                    <div className="text-center mb-3">
                      <h5 className="fw-bold text-uppercase m-0">{generatedLetter.company}</h5>
                      <small className="text-muted">Registered HQ Office: Cyber City, Gurugram, India</small>
                      <hr className="my-2"/>
                    </div>

                    {activeLetterType === "appointment" && (
                      <div className="small text-dark">
                        <p className="text-end text-muted"><strong>Date:</strong> {generatedLetter.currentDate}</p>
                        <h6 className="fw-bold text-center mb-3 text-uppercase">Letter of Appointment</h6>
                        <p>Dear <strong>{generatedLetter.name}</strong>,</p>
                        <p>
                          We are pleased to appoint you in <strong>{generatedLetter.company}</strong> as a team member in the <strong>{generatedLetter.department}</strong> department starting <strong>{generatedLetter.joiningDate}</strong>.
                        </p>
                        <p>
                          Your basic emoluments will be calculated on a monthly structured system equivalent to <strong>₹{parseInt(generatedLetter.salary).toLocaleString()} per month</strong>. 
                        </p>
                        <p className="mt-4">Authorized HR Officer Signatory,</p>
                        <div className="d-flex justify-content-between align-items-end mt-2">
                          <span className="text-decoration-underline font-monospace text-muted">Payroll Pro Human Resources</span>
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => window.print()}>
                            <i className="bi bi-printer me-1"></i>Print Letter
                          </button>
                        </div>
                      </div>
                    )}

                    {activeLetterType === "experience" && (
                      <div className="small text-dark">
                        <p className="text-end text-muted"><strong>Date:</strong> {generatedLetter.currentDate}</p>
                        <h6 className="fw-bold text-center mb-3 text-uppercase">TO WHOMSOEVER IT MAY CONCERN</h6>
                        <p>
                          This is to certify that <strong>{generatedLetter.name}</strong> (Employee ID: <strong>{generatedLetter.id}</strong>) was employed with <strong>{generatedLetter.company}</strong> in the <strong>{generatedLetter.department}</strong> department from <strong>{generatedLetter.joiningDate}</strong> to the present date.
                        </p>
                        <p>
                          During their tenure with us, they demonstrated exceptional professional aptitude and high work ethics. We wish them success in all future endeavors.
                        </p>
                        <p className="mt-4">Chief Corporate Administrator,</p>
                        <div className="d-flex justify-content-between align-items-end mt-2">
                          <span className="text-decoration-underline font-monospace text-muted">Payroll Pro Corporate Seal</span>
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => window.print()}>
                            <i className="bi bi-printer me-1"></i>Print Certificate
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="d-flex align-items-center justify-content-center border border-dashed rounded text-muted py-5" style={{ minHeight: "220px" }}>
                    <div className="text-center">
                      <i className="bi bi-file-earmark-richtext display-5 mb-2 d-block text-primary opacity-50"></i>
                      Select a letter template from above to draft the document.
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

export default DocumentManagement;
