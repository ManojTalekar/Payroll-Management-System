import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { employeeAPI, salaryAPI } from "../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function SalarySlip() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [salariesList, setSalariesList] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [genLoading, setGenLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const slipRef = useRef();

  const loadEmployees = async () => {
    try {
      const res = await employeeAPI.getEmployees();
      if (res.data.success) setEmployees(res.data.data);
    } catch (err) {
      console.error("Failed to load employees:", err);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleEmployeeChange = async (e) => {
    const empId = e.target.value;
    setSelectedEmpId(empId);
    setSelectedSlip(null);
    if (!empId) {
      setSalariesList([]);
      return;
    }

    setDataLoading(true);
    try {
      const res = await salaryAPI.getSalaries(empId);
      if (res.data.success) setSalariesList(res.data.data);
    } catch (err) {
      console.error("Failed to fetch salary slips:", err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleGeneratePayroll = async (e) => {
    e.preventDefault();
    setGenLoading(true);
    try {
      const res = await salaryAPI.generatePayroll(genMonth, genYear);
      if (res.data.success) {
        alert(res.data.message);
        if (selectedEmpId) {
          const slips = await salaryAPI.getSalaries(selectedEmpId);
          if (slips.data.success) setSalariesList(slips.data.data);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate payroll");
    } finally {
      setGenLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await salaryAPI.updateSalaryStatus(id, status);
      if (res.data.success) {
        alert(`Salary slip marked as ${status}! Automated email dispatched to employee.`);
        const slips = await salaryAPI.getSalaries(selectedEmpId);
        if (slips.data.success) {
          setSalariesList(slips.data.data);
          const updated = slips.data.data.find(s => s._id === id);
          setSelectedSlip(updated);
        }
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const downloadPDF = () => {
    const input = slipRef.current;
    if (!input) return;

    html2canvas(input, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const width = 190;
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, width, height);
      pdf.save(`${selectedSlip.employee.name.replace(" ", "_")}_Payslip_${selectedSlip.month}_${selectedSlip.year}.pdf`);
    });
  };

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
          
          <h3 className="fw-bold my-4 text-white">
            <i className="bi bi-wallet2 text-info me-2"></i>Payroll & Payslip Generator
          </h3>

          <div className="row g-4">
            {/* Left Controls */}
            <div className="col-lg-5">
              
              {/* Process Card */}
              <div className="card border-0 p-4 mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px" }}>
                <h6 className="fw-bold text-white mb-2"><i className="bi bi-calculator-fill text-info me-2"></i>Process System Payroll</h6>
                <p className="text-muted small">Execute tax computations and PF allocations for all active workforce profiles.</p>
                
                <form onSubmit={handleGeneratePayroll} className="row g-2">
                  <div className="col-6">
                    <select className="form-select bg-dark text-white border-secondary" value={genMonth} onChange={(e) => setGenMonth(Number(e.target.value))}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="col-6">
                    <select className="form-select bg-dark text-white border-secondary" value={genYear} onChange={(e) => setGenYear(Number(e.target.value))}>
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-info text-dark fw-bold w-100 mt-2" disabled={genLoading}>
                    {genLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-gear-wide-connected me-1"></i>}
                    Process System Payroll
                  </button>
                </form>
              </div>

              {/* Selector */}
              <div className="card border-0 p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px" }}>
                <h6 className="fw-bold text-white mb-3"><i className="bi bi-search me-2 text-info"></i>Audit Payroll Files</h6>
                <div className="mb-3">
                  <select className="form-select bg-dark text-white border-secondary" value={selectedEmpId} onChange={handleEmployeeChange}>
                    <option value="">Choose Employee</option>
                    {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>)}
                  </select>
                </div>

                {dataLoading ? (
                  <div className="text-center py-3"><div className="spinner-border spinner-border-sm text-info"></div></div>
                ) : (
                  selectedEmpId && (
                    <div className="list-group">
                      <h6 className="fw-bold small text-muted mb-2">Available Statement Files:</h6>
                      {salariesList.length === 0 ? (
                        <small className="text-muted text-center py-2">No files calculated</small>
                      ) : (
                        salariesList.map(s => (
                          <button
                            key={s._id}
                            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center bg-transparent text-white border-secondary ${selectedSlip?._id === s._id ? "active bg-info text-dark" : ""}`}
                            onClick={() => setSelectedSlip(s)}
                          >
                            <span>Month: {s.month}/{s.year}</span>
                            <span className={`badge ${s.status === "Paid" ? "bg-success" : "bg-warning text-dark"}`}>{s.status}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Right Payslip Document */}
            <div className="col-lg-7">
              {selectedSlip ? (
                <div>
                  <div ref={slipRef} className="card border-0 p-4 text-dark" style={{ borderRadius: "16px", background: "#fff" }}>
                    
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom border-dark border-opacity-10">
                      <div>
                        <h4 className="fw-bold m-0 text-primary"><i className="bi bi-cpu-fill me-1"></i>TECHNOVA SOLUTIONS</h4>
                        <small className="text-muted">DLF Cyber City, Sector 24, Gurugram, India</small>
                      </div>
                      <div className="text-end">
                        <span className="badge bg-dark text-white px-3 py-2">PAYSLIP LEDGER</span>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="row g-2 mb-3 bg-light p-3 rounded">
                      <div className="col-md-7 d-flex align-items-center gap-3">
                        <img src={selectedSlip.employee?.photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                          alt="profile" width="55" height="55" className="rounded-circle border" />
                        <div className="small">
                          <strong>Name:</strong> {selectedSlip.employee?.name} <br />
                          <strong>ID:</strong> {selectedSlip.employee?.employeeId} <br />
                          <strong>Dept:</strong> {selectedSlip.employee?.department?.name || "Corporate"}
                        </div>
                      </div>
                      <div className="col-md-5 text-md-end small">
                        <strong>Period:</strong> {selectedSlip.month}/{selectedSlip.year} <br />
                        <strong>Status:</strong> <span className={`fw-bold ${selectedSlip.status === "Paid" ? "text-success" : "text-warning"}`}>{selectedSlip.status}</span>
                      </div>
                    </div>

                    {/* Ledgers */}
                    <table className="table table-bordered align-middle small">
                      <thead className="table-dark">
                        <tr>
                          <th>Earnings & Allocances</th>
                          <th>Deductions & Taxes</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div className="d-flex justify-content-between"><span>Basic Salary:</span> <strong>₹{selectedSlip.basicSalary.toLocaleString()}</strong></div>
                            <div className="d-flex justify-content-between mt-1"><span>HRA (40%):</span> <strong>₹{selectedSlip.hra.toLocaleString()}</strong></div>
                            <div className="d-flex justify-content-between mt-1"><span>DA (10%):</span> <strong>₹{selectedSlip.da.toLocaleString()}</strong></div>
                            <div className="d-flex justify-content-between mt-1"><span>Overtime Pay:</span> <strong>₹{(selectedSlip.overtimePay || 0).toLocaleString()}</strong></div>
                          </td>
                          <td>
                            <div className="d-flex justify-content-between"><span>Provident Fund (12%):</span> <strong className="text-danger">₹{selectedSlip.pf.toLocaleString()}</strong></div>
                            <div className="d-flex justify-content-between mt-1"><span>ESIC (1%):</span> <strong className="text-danger">₹{selectedSlip.esi.toLocaleString()}</strong></div>
                            <div className="d-flex justify-content-between mt-1"><span>Professional Tax:</span> <strong className="text-danger">₹{selectedSlip.professionalTax.toLocaleString()}</strong></div>
                            <div className="d-flex justify-content-between mt-1"><span>Income Tax:</span> <strong className="text-danger">₹{selectedSlip.incomeTax.toLocaleString()}</strong></div>
                          </td>
                        </tr>
                        <tr className="table-secondary fw-bold">
                          <td>Gross: ₹{(selectedSlip.basicSalary + selectedSlip.hra + selectedSlip.da + (selectedSlip.overtimePay || 0)).toLocaleString()}</td>
                          <td>Deductions: ₹{(selectedSlip.pf + selectedSlip.esi + selectedSlip.professionalTax + selectedSlip.incomeTax).toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="bg-primary bg-opacity-10 text-primary p-3 text-center my-3 rounded" style={{ border: "1px solid rgba(0,114,255,0.2)" }}>
                      <span className="small text-uppercase fw-bold d-block text-muted">Net Credited Payout</span>
                      <h3 className="fw-bold m-0">₹{selectedSlip.netSalary.toLocaleString()}</h3>
                    </div>

                    {/* Verification and signature block */}
                    <div className="row align-items-center mt-3 pt-3 border-top">
                      <div className="col-6">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=65x65&data=VERIFIED_PAYSLIP_ID_${selectedSlip._id}`} 
                          alt="verification qr" width="65" height="65" />
                        <span className="d-block text-muted" style={{ fontSize: "8px" }}>Scan to verify audit ID</span>
                      </div>
                      <div className="col-6 text-end small">
                        <div className="fst-italic fw-bold text-dark mb-1">TechNova HR Signature</div>
                        <span className="d-block text-muted" style={{ fontSize: "10px" }}>Authorized Digital Signatory</span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between mt-3">
                    <button className="btn btn-outline-info" onClick={downloadPDF}>
                      <i className="bi bi-download me-1"></i> Export PDF Slip
                    </button>
                    {selectedSlip.status === "Unpaid" ? (
                      <button className="btn btn-success fw-bold text-white" onClick={() => handleUpdateStatus(selectedSlip._id, "Paid")}>
                        <i className="bi bi-check-circle-fill me-1"></i> Release Payment
                      </button>
                    ) : (
                      <button className="btn btn-outline-warning text-white" onClick={() => handleUpdateStatus(selectedSlip._id, "Unpaid")}>
                        <i className="bi bi-arrow-counterclockwise me-1"></i> Mark as Unpaid
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-center border border-dashed rounded text-muted py-5 h-100 bg-white bg-opacity-5" style={{ minHeight: "350px" }}>
                  <div className="text-center">
                    <i className="bi bi-receipt display-4 d-block mb-2 text-info opacity-50"></i>
                    Select an employee and statement month to verify details.
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default SalarySlip;
