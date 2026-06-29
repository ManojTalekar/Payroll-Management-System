import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { employeeAPI, hrAPI } from "../services/api";

function AddEmployee() {
  // Existing fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [salary, setSalary] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  
  // New upgraded fields
  const [pan, setPan] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [experienceYears, setExperienceYears] = useState("0");
  const [education, setEducation] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("Full-time");
  const [skills, setSkills] = useState("");

  // Emergency contact
  const [emergName, setEmergName] = useState("");
  const [emergRelation, setEmergRelation] = useState("");
  const [emergPhone, setEmergPhone] = useState("");

  // Bank details
  const [bankAcc, setBankAcc] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankBranch, setBankBranch] = useState("");

  // Selectors
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [shifts, setShifts] = useState([]);
  
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedDesig, setSelectedDesig] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [loading, setLoading] = useState(false);

  // Form Tab State
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    const fetchSelectors = async () => {
      try {
        const deptRes = await hrAPI.getDepartments();
        const desRes = await hrAPI.getDesignations();
        const shiftRes = await hrAPI.getShifts();

        if (deptRes.data.success) setDepartments(deptRes.data.data);
        if (desRes.data.success) setDesignations(desRes.data.data);
        if (shiftRes.data.success) setShifts(shiftRes.data.data);
      } catch (err) {
        console.error("Failed to load selectors:", err);
      }
    };
    fetchSelectors();
  }, []);

  const filteredDesignations = designations.filter(
    d => d.department?._id === selectedDept || d.department === selectedDept
  );

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const addEmployee = async (e) => {
    e.preventDefault();
    if (!name || !email || !salary || !selectedDept || !selectedDesig || !selectedShift) {
      alert("Please fill all required fields in the Basic Info section.");
      setActiveTab("basic");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("salary", salary);
    formData.append("department", selectedDept);
    formData.append("designation", selectedDesig);
    formData.append("shift", selectedShift);
    
    // Upgraded schema fields
    formData.append("pan", pan);
    formData.append("aadhaar", aadhaar);
    formData.append("bloodGroup", bloodGroup);
    formData.append("experienceYears", parseInt(experienceYears) || 0);
    formData.append("education", education);
    formData.append("employmentStatus", employmentStatus);
    
    // Skills array conversion
    const skillsArr = skills.split(",").map(s => s.trim()).filter(Boolean);
    skillsArr.forEach(s => formData.append("skills[]", s));

    // Emergency details
    formData.append("emergencyContact[name]", emergName);
    formData.append("emergencyContact[relationship]", emergRelation);
    formData.append("emergencyContact[phone]", emergPhone);

    // Bank details
    formData.append("bankDetails[accountNumber]", bankAcc);
    formData.append("bankDetails[bankName]", bankName);
    formData.append("bankDetails[ifscCode]", bankIfsc);
    formData.append("bankDetails[branch]", bankBranch);

    if (joiningDate) {
      formData.append("joiningDate", joiningDate);
    }
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    try {
      const res = await employeeAPI.createEmployee(formData);
      if (res.data.success) {
        alert("Employee Onboarded Successfully! Login credential created (initial password: '1234')");
        // Reset states
        setName(""); setEmail(""); setPhone(""); setAddress(""); setSalary(""); setJoiningDate("");
        setPan(""); setAadhaar(""); setBloodGroup(""); setExperienceYears("0"); setEducation("");
        setSkills(""); setEmergName(""); setEmergRelation(""); setEmergPhone("");
        setBankAcc(""); setBankName(""); setBankIfsc(""); setBankBranch("");
        setSelectedDept(""); setSelectedDesig(""); setSelectedShift("");
        setPhotoFile(null); setPhotoPreview("");
        setActiveTab("basic");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Sidebar />
      <div className="main-content" style={{ fontFamily: "'Outfit', sans-serif", background: "#0d131a", color: "#fff", minHeight: "100vh", paddingBottom: "40px" }}>
        <div className="row justify-content-center pt-4">
          <div className="col-lg-10">
            
            {/* Onboarding Nav Tabs */}
            <div className="card shadow-lg border-0 p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px" }}>
              <h3 className="mb-4 text-center fw-bold text-white"><i className="bi bi-person-plus-fill text-info me-2"></i>Onboard New Employee Profile</h3>
              
              <ul className="nav nav-tabs nav-fill mb-4 border-secondary border-opacity-25">
                <li className="nav-item">
                  <button className={`nav-link text-white ${activeTab === "basic" ? "active bg-info text-dark" : "bg-transparent border-0"}`} onClick={() => setActiveTab("basic")}>
                    1. Basic Info *
                  </button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link text-white ${activeTab === "personal" ? "active bg-info text-dark" : "bg-transparent border-0"}`} onClick={() => setActiveTab("personal")}>
                    2. Personal & Custom
                  </button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link text-white ${activeTab === "bank" ? "active bg-info text-dark" : "bg-transparent border-0"}`} onClick={() => setActiveTab("bank")}>
                    3. Bank Accounts Registry
                  </button>
                </li>
              </ul>

              <form onSubmit={addEmployee}>
                {activeTab === "basic" && (
                  <div className="row g-3">
                    <div className="text-center mb-3">
                      <img src={photoPreview || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                        alt="preview" width="90" height="90" className="rounded-circle border" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Employee Name *</label>
                      <input type="text" className="form-control bg-transparent text-white border-secondary" placeholder="Rahul Sharma" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Corporate Email *</label>
                      <input type="email" className="form-control bg-transparent text-white border-secondary" placeholder="rahul@technova.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Contact Phone</label>
                      <input type="text" className="form-control bg-transparent text-white border-secondary" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Joining Date</label>
                      <input type="date" className="form-control bg-transparent text-white border-secondary" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Basic Monthly Salary (₹) *</label>
                      <input type="number" className="form-control bg-transparent text-white border-secondary" value={salary} onChange={(e) => setSalary(e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Department *</label>
                      <select className="form-select bg-transparent text-white border-secondary" value={selectedDept} style={{ color: "#000" }} onChange={(e) => { setSelectedDept(e.target.value); setSelectedDesig(""); }} required>
                        <option value="" style={{ color: "#000" }}>Select Dept</option>
                        {departments.map(d => <option key={d._id} value={d._id} style={{ color: "#000" }}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Designation *</label>
                      <select className="form-select bg-transparent text-white border-secondary" value={selectedDesig} style={{ color: "#000" }} onChange={(e) => setSelectedDesig(e.target.value)} disabled={!selectedDept} required>
                        <option value="" style={{ color: "#000" }}>Select Designation</option>
                        {filteredDesignations.map(d => <option key={d._id} value={d._id} style={{ color: "#000" }}>{d.title}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Work Shift Pattern *</label>
                      <select className="form-select bg-transparent text-white border-secondary" value={selectedShift} style={{ color: "#000" }} onChange={(e) => setSelectedShift(e.target.value)} required>
                        <option value="" style={{ color: "#000" }}>Select Shift</option>
                        {shifts.map(s => <option key={s._id} value={s._id} style={{ color: "#000" }}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold">Upload Profile Photo</label>
                      <input type="file" className="form-control bg-transparent border-secondary text-white" accept="image/*" onChange={handlePhotoChange} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold">Residential Address</label>
                      <textarea className="form-control bg-transparent text-white border-secondary" rows="2" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                  </div>
                )}

                {activeTab === "personal" && (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">PAN Card Number</label>
                      <input type="text" className="form-control bg-transparent text-white border-secondary" placeholder="ABCDE1234F" value={pan} onChange={(e) => setPan(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Aadhaar Card Number</label>
                      <input type="text" className="form-control bg-transparent text-white border-secondary" placeholder="12-digit number" value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Blood Group</label>
                      <input type="text" className="form-control bg-transparent text-white border-secondary" placeholder="e.g. O+" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Prior Experience (Years)</label>
                      <input type="number" className="form-control bg-transparent text-white border-secondary" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Education Qualification</label>
                      <input type="text" className="form-control bg-transparent text-white border-secondary" placeholder="B.Tech, MBA etc" value={education} onChange={(e) => setEducation(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Employment Status</label>
                      <select className="form-select bg-transparent text-white border-secondary" style={{ color: "#000" }} value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value)}>
                        <option value="Full-time" style={{ color: "#000" }}>Full-time</option>
                        <option value="Part-time" style={{ color: "#000" }}>Part-time</option>
                        <option value="Intern" style={{ color: "#000" }}>Intern</option>
                        <option value="Contractor" style={{ color: "#000" }}>Contractor</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Skills (comma-separated)</label>
                      <input type="text" className="form-control bg-transparent text-white border-secondary" placeholder="React, Node.js, Express" value={skills} onChange={(e) => setSkills(e.target.value)} />
                    </div>
                    <div className="col-12 mt-4">
                      <h6 className="fw-bold text-info"><i className="bi bi-telephone-fill me-2"></i>Emergency Contact Details</h6>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Contact Person Name</label>
                      <input type="text" className="form-control bg-transparent text-white border-secondary" value={emergName} onChange={(e) => setEmergName(e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Relationship</label>
                      <input type="text" className="form-control bg-transparent text-white border-secondary" value={emergRelation} onChange={(e) => setEmergRelation(e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Emergency Phone</label>
                      <input type="text" className="form-control bg-transparent text-white border-secondary" value={emergPhone} onChange={(e) => setEmergPhone(e.target.value)} />
                    </div>
                  </div>
                )}

                {activeTab === "bank" && (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Bank Account Number</label>
                      <input type="text" className="form-control bg-transparent text-white border-secondary" value={bankAcc} onChange={(e) => setBankAcc(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Bank Name</label>
                      <input type="text" className="form-control bg-transparent text-white border-secondary" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">IFSC Code</label>
                      <input type="text" className="form-control bg-transparent text-white border-secondary" value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Branch Location</label>
                      <input type="text" className="form-control bg-transparent text-white border-secondary" value={bankBranch} onChange={(e) => setBankBranch(e.target.value)} />
                    </div>

                    <div className="col-12 mt-4 text-center">
                      <button type="submit" className="btn btn-info btn-lg fw-bold text-dark px-5" disabled={loading}>
                        {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-person-check-fill me-2"></i>}
                        Onboard Employee Contract
                      </button>
                    </div>
                  </div>
                )}

                {/* Next section hints */}
                <div className="d-flex justify-content-between mt-4 pt-3 border-top border-secondary border-opacity-10">
                  {activeTab !== "basic" && (
                    <button type="button" className="btn btn-outline-light" onClick={() => setActiveTab(activeTab === "personal" ? "basic" : "personal")}>Back</button>
                  )}
                  {activeTab !== "bank" ? (
                    <button type="button" className="btn btn-info text-dark fw-bold ms-auto" onClick={() => setActiveTab(activeTab === "basic" ? "personal" : "bank")}>Next Section</button>
                  ) : null}
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AddEmployee;
