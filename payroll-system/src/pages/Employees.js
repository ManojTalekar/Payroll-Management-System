import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { employeeAPI, hrAPI } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Search states
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(8);

  // View modal state
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Fetch from backend
  const loadData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        employeeAPI.getEmployees(),
        hrAPI.getDepartments()
      ]);
      if (empRes.data.success) setEmployees(empRes.data.data);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
    } catch (err) {
      console.error("Failed to load employee directory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const deleteEmployee = async (id) => {
    if (!window.confirm("Permanently remove this employee profile?")) return;
    try {
      const res = await employeeAPI.deleteEmployee(id);
      if (res.data.success) {
        alert(res.data.message);
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove employee");
    }
  };

  // CSV Export Trigger
  const handleExportCSV = () => {
    if (employees.length === 0) return;
    const headers = ["EmployeeID", "Name", "Email", "Phone", "Department", "Designation", "EmploymentStatus", "Status", "BasicSalary", "PAN", "Aadhaar"];
    const rows = employees.map(emp => [
      emp.employeeId,
      emp.name,
      emp.email,
      emp.phone || "",
      emp.department?.name || "",
      emp.designation?.title || "",
      emp.employmentStatus || "Full-time",
      emp.status || "Active",
      emp.salary,
      emp.pan || "",
      emp.aadhaar || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payrollpro_employees_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock CSV Import Trigger
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      console.log("Imported CSV telemetry content:", text);
      alert("CSV Employee profiles queued for programmatic ingestion database. Seeding details printed to developer logs.");
    };
    reader.readAsText(file);
  };

  // Sort and Filter logic
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const filtered = employees.filter(emp => {
    const matchesSearch = 
      emp.name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesDept = selectedDept === "" || emp.department?._id === selectedDept;
    const matchesStatus = selectedStatus === "" || emp.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortBy] || "";
    let valB = b[sortBy] || "";

    if (sortBy === "department") {
      valA = a.department?.name || "";
      valB = b.department?.name || "";
    } else if (sortBy === "designation") {
      valA = a.designation?.title || "";
      valB = b.designation?.title || "";
    }

    if (typeof valA === "string") {
      return sortOrder === "asc" 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    } else {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
  });

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sorted.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(sorted.length / rowsPerPage);

  return (
    <>
      <Sidebar />
      <div className="main-content" style={{ 
        fontFamily: "'Outfit', sans-serif", 
        background: "#0d131a", 
        minHeight: "100vh", 
        color: "#fff",
        paddingBottom: "40px" 
      }}>
        <div className="container-fluid px-4">
          
          {/* Header Row */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center my-4">
            <div>
              <h3 className="fw-bold m-0"><i className="bi bi-people-fill text-info me-2"></i>Employee Directory</h3>
              <p className="text-muted small m-0">Review profiles, assign roles, and download spreadsheet sheets.</p>
            </div>
            {/* Actions */}
            <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
              <label className="btn btn-outline-info m-0" style={{ cursor: "pointer" }}>
                <i className="bi bi-file-earmark-arrow-up-fill me-1"></i> Import CSV
                <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: "none" }} />
              </label>
              <button className="btn btn-info text-dark fw-bold" onClick={handleExportCSV}>
                <i className="bi bi-file-earmark-arrow-down-fill me-1"></i> Export CSV
              </button>
              <a href="/add-employee" className="btn btn-primary fw-bold">
                <i className="bi bi-person-plus-fill me-1"></i> Add Employee
              </a>
            </div>
          </div>

          {/* FILTERS & SEARCH ROW */}
          <div className="card border-0 p-3 mb-4" style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "12px"
          }}>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 border-secondary text-muted">🔍</span>
                  <input
                    type="text"
                    className="form-control bg-transparent text-white border-start-0 border-secondary"
                    placeholder="Search by ID, name or email..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <select className="form-select bg-transparent text-white border-secondary"
                  value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(1); }}
                  style={{ color: "#000" }}>
                  <option value="" style={{ color: "#000" }}>All Departments</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id} style={{ color: "#000" }}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <select className="form-select bg-transparent text-white border-secondary"
                  value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                  style={{ color: "#000" }}>
                  <option value="" style={{ color: "#000" }}>All Statuses</option>
                  <option value="Active" style={{ color: "#000" }}>Active</option>
                  <option value="On Leave" style={{ color: "#000" }}>On Leave</option>
                  <option value="Terminated" style={{ color: "#000" }}>Terminated</option>
                </select>
              </div>
            </div>
          </div>

          {/* DIRECTORY TABLE */}
          <div className="card border-0 shadow-lg" style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "16px"
          }}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 text-white">
                <thead className="table-dark">
                  <tr>
                    <th className="ps-4 cursor-pointer" onClick={() => handleSort("employeeId")}>
                      Emp ID {sortBy === "employeeId" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                    </th>
                    <th>Photo</th>
                    <th className="cursor-pointer" onClick={() => handleSort("name")}>
                      Name {sortBy === "name" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                    </th>
                    <th className="cursor-pointer" onClick={() => handleSort("department")}>
                      Department {sortBy === "department" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                    </th>
                    <th className="cursor-pointer" onClick={() => handleSort("designation")}>
                      Designation {sortBy === "designation" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                    </th>
                    <th>Status</th>
                    <th className="pe-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <div className="spinner-border text-info" role="status"></div>
                      </td>
                    </tr>
                  ) : currentRows.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No employees found matching the filters
                      </td>
                    </tr>
                  ) : (
                    currentRows.map(emp => (
                      <tr key={emp._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td className="ps-4">
                          <span className="badge bg-secondary">{emp.employeeId}</span>
                        </td>
                        <td>
                          <img
                            src={emp.photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                            alt={emp.name}
                            width="40"
                            height="40"
                            className="rounded-circle border"
                          />
                        </td>
                        <td>
                          <span className="fw-semibold">{emp.name}</span>
                          <span className="d-block small text-muted">{emp.email}</span>
                        </td>
                        <td>{emp.department?.name || "-"}</td>
                        <td>{emp.designation?.title || "-"}</td>
                        <td>
                          <span className={`badge ${
                            emp.status === "Active" ? "bg-success" :
                            emp.status === "On Leave" ? "bg-warning text-dark" : "bg-danger"
                          }`}>
                            {emp.status || "Active"}
                          </span>
                        </td>
                        <td className="pe-4 text-end">
                          <button className="btn btn-xs btn-outline-info me-2" onClick={() => setSelectedEmp(emp)}>
                            <i className="bi bi-eye"></i> View Profile
                          </button>
                          <button className="btn btn-xs btn-outline-danger" onClick={() => deleteEmployee(emp._id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center p-3 border-top border-secondary border-opacity-10">
                <span className="small text-muted">Page {currentPage} of {totalPages}</span>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-light" 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}>Previous</button>
                  <button className="btn btn-sm btn-outline-light"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}>Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE VIEW PROFILE MODAL */}
      <AnimatePresence>
        {selectedEmp && (
          <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)" }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal-dialog modal-dialog-centered modal-lg"
            >
              <div className="modal-content text-white" style={{ background: "#131a26", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="modal-header border-secondary border-opacity-20">
                  <h5 className="modal-title fw-bold"><i className="bi bi-person-badge-fill text-info me-2"></i>Corporate Profile Details</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedEmp(null)}></button>
                </div>
                <div className="modal-body p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                  
                  {/* Top Stats */}
                  <div className="d-flex align-items-center gap-3 pb-3 mb-3 border-bottom border-secondary border-opacity-10">
                    <img src={selectedEmp.photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                      alt={selectedEmp.name} width="70" height="70" className="rounded-circle border" />
                    <div>
                      <h5 className="fw-bold m-0">{selectedEmp.name}</h5>
                      <small className="text-info">{selectedEmp.designation?.title || "Staff"} &bull; {selectedEmp.department?.name || "Corporate"}</small>
                      <small className="d-block text-muted">ID: {selectedEmp.employeeId} | Joined: {new Date(selectedEmp.joiningDate).toLocaleDateString()}</small>
                    </div>
                  </div>

                  {/* Multi Tab Info */}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <h6 className="fw-bold text-info"><i className="bi bi-card-text me-1"></i>Personal Information</h6>
                      <ul className="list-unstyled small">
                        <li className="mb-2"><strong>Blood Group:</strong> {selectedEmp.bloodGroup || "O+"}</li>
                        <li className="mb-2"><strong>Phone:</strong> {selectedEmp.phone || "Not set"}</li>
                        <li className="mb-2"><strong>PAN Card:</strong> {selectedEmp.pan || "Not verified"}</li>
                        <li className="mb-2"><strong>Aadhaar Number:</strong> {selectedEmp.aadhaar || "Not verified"}</li>
                        <li className="mb-2"><strong>Experience:</strong> {selectedEmp.experienceYears || 0} years</li>
                        <li className="mb-2"><strong>Education:</strong> {selectedEmp.education || "Bachelor's Degree"}</li>
                      </ul>
                    </div>

                    <div className="col-md-6">
                      <h6 className="fw-bold text-info"><i className="bi bi-wallet2 me-1"></i>Financial & Bank Registry</h6>
                      <ul className="list-unstyled small">
                        <li className="mb-2"><strong>Account Number:</strong> {selectedEmp.bankDetails?.accountNumber || "N/A"}</li>
                        <li className="mb-2"><strong>Bank Name:</strong> {selectedEmp.bankDetails?.bankName || "N/A"}</li>
                        <li className="mb-2"><strong>IFSC Code:</strong> {selectedEmp.bankDetails?.ifscCode || "N/A"}</li>
                        <li className="mb-2"><strong>Branch:</strong> {selectedEmp.bankDetails?.branch || "N/A"}</li>
                        <li className="mb-2"><strong>Basic Monthly Salary:</strong> ₹{selectedEmp.salary.toLocaleString()}</li>
                        <li className="mb-2"><strong>Employment Type:</strong> {selectedEmp.employmentStatus || "Full-time"}</li>
                      </ul>
                    </div>

                    <div className="col-12 border-top border-secondary border-opacity-10 pt-3">
                      <h6 className="fw-bold text-info"><i className="bi bi-lightbulb-fill me-1"></i>Skills Inventory</h6>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {selectedEmp.skills && selectedEmp.skills.length > 0 ? (
                          selectedEmp.skills.map((skill, index) => (
                            <span key={index} className="badge bg-secondary px-2.5 py-1.5">{skill}</span>
                          ))
                        ) : (
                          <span className="badge bg-secondary-subtle text-muted px-2 py-1">No custom skills configured</span>
                        )}
                      </div>
                    </div>

                    <div className="col-12 border-top border-secondary border-opacity-10 pt-3">
                      <h6 className="fw-bold text-info"><i className="bi bi-telephone-outfill me-1"></i>Emergency Contact</h6>
                      <p className="small mb-0">
                        <strong>Contact Name:</strong> {selectedEmp.emergencyContact?.name || "N/A"}<br />
                        <strong>Relationship:</strong> {selectedEmp.emergencyContact?.relationship || "N/A"}<br />
                        <strong>Contact Number:</strong> {selectedEmp.emergencyContact?.phone || "N/A"}
                      </p>
                    </div>
                  </div>

                </div>
                <div className="modal-footer border-secondary border-opacity-20">
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedEmp(null)}>Close</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Employees;
