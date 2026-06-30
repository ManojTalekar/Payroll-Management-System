import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { employeeAPI, salaryAPI } from "../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function EmployeeSalarySlip() {
  const [employee, setEmployee] = useState(null);
  const [salariesList, setSalariesList] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [loading, setLoading] = useState(true);
  const slipRef = useRef();

  useEffect(() => {
    const fetchSlips = async () => {
      try {
        const profRes = await employeeAPI.getProfile();
        if (profRes.data.success) {
          const emp = profRes.data.data;
          setEmployee(emp);

          const salariesRes = await salaryAPI.getSalaries(emp._id);
          if (salariesRes.data.success) {
            setSalariesList(salariesRes.data.data);
            if (salariesRes.data.data.length > 0) {
              setSelectedSlip(salariesRes.data.data[0]);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load employee salary details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlips();
  }, []);

  const downloadPDF = () => {
    const input = slipRef.current;
    if (!input) return;

    html2canvas(input, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const width = 190;
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, width, height);
      pdf.save(`Payslip_${selectedSlip.month}_${selectedSlip.year}.pdf`);
    });
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="main-content d-flex justify-content-center align-items-center vh-100" style={{ background: "#0d131a", color: "#fff" }}>
          <div className="spinner-border text-info" role="status"></div>
        </div>
      </>
    );
  }

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
            <i className="bi bi-receipt-cutoff text-info me-2"></i>My Salary Statements
          </h3>

          <div className="row g-4">
            {/* Left selector */}
            <div className="col-lg-4">
              <div className="card border-0 p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px" }}>
                <h6 className="fw-bold text-white mb-3">Select Statement Month</h6>
                <div className="list-group">
                  {salariesList.length === 0 ? (
                    <small className="text-muted text-center py-2">No pay slips posted yet.</small>
                  ) : (
                    salariesList.map(s => (
                      <button
                        key={s._id}
                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center bg-transparent border-secondary text-white ${selectedSlip?._id === s._id ? "active bg-info text-dark" : ""}`}
                        onClick={() => setSelectedSlip(s)}
                      >
                        <span>Month: {s.month}/{s.year}</span>
                        <span className={`badge ${s.status === "Paid" ? "bg-success" : "bg-warning text-dark"}`}>{s.status}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right slip view */}
            <div className="col-lg-8">
              {selectedSlip ? (
                <div>
                  <div ref={slipRef} className="card border-0 p-4 text-dark shadow-2xl" style={{ borderRadius: "16px", background: "#fff" }}>
                    
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom border-dark border-opacity-10">
                      <div>
                        <h4 className="fw-bold m-0 text-primary"><i className="bi bi-cpu-fill me-1"></i>PAYROLL PRO</h4>
                        <small className="text-muted">Thane, Maharashtra, India</small>
                      </div>
                      <div className="text-end">
                        <span className="badge bg-success px-3 py-2 text-white">VERIFIED PAYMENT</span>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="row g-2 mb-3 bg-light p-3 rounded">
                      <div className="col-md-7 d-flex align-items-center gap-3">
                        <img src={employee?.photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                          alt="profile" width="55" height="55" className="rounded-circle border" />
                        <div className="small">
                          <strong>Name:</strong> {employee?.name} <br />
                          <strong>ID:</strong> {employee?.employeeId} <br />
                          <strong>Dept:</strong> {employee?.department?.name || "Corporate"}
                        </div>
                      </div>
                      <div className="col-md-5 text-md-end small">
                        <strong>Period:</strong> {selectedSlip.month}/{selectedSlip.year} <br />
                        <strong>Status:</strong> <span className="fw-bold text-success">{selectedSlip.status}</span>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-bordered align-middle small">
                        <thead className="table-dark">
                          <tr>
                            <th>Earnings & Allowances</th>
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
                              <div className="d-flex justify-content-between"><span>PF (12%):</span> <strong className="text-danger">₹{selectedSlip.pf.toLocaleString()}</strong></div>
                              <div className="d-flex justify-content-between mt-1"><span>ESI (1%):</span> <strong className="text-danger">₹{selectedSlip.esi.toLocaleString()}</strong></div>
                              <div className="d-flex justify-content-between mt-1"><span>Professional Tax:</span> <strong className="text-danger">₹{selectedSlip.professionalTax.toLocaleString()}</strong></div>
                              <div className="d-flex justify-content-between mt-1"><span>Income Tax:</span> <strong className="text-danger">₹{selectedSlip.incomeTax.toLocaleString()}</strong></div>
                            </td>
                          </tr>
                          <tr className="table-secondary fw-bold">
                            <td>Gross Total: ₹{(selectedSlip.basicSalary + selectedSlip.hra + selectedSlip.da + (selectedSlip.overtimePay || 0)).toLocaleString()}</td>
                            <td>Deductions Total: ₹{(selectedSlip.pf + selectedSlip.esi + selectedSlip.professionalTax + selectedSlip.incomeTax).toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-success bg-opacity-10 text-success p-3 text-center my-3 rounded" style={{ border: "1px solid rgba(40,167,69,0.2)" }}>
                      <span className="small text-uppercase fw-bold d-block text-muted">Net Credited Payout</span>
                      <h3 className="fw-bold m-0">₹{selectedSlip.netSalary.toLocaleString()}</h3>
                    </div>

                    {/* QR Code and digital signatures */}
                    <div className="row align-items-center mt-3 pt-3 border-top">
                      <div className="col-6">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=65x65&data=VERIFIED_PAYSLIP_ID_${selectedSlip._id}`} 
                          alt="verification qr" width="65" height="65" />
                        <span className="d-block text-muted" style={{ fontSize: "8px" }}>Scan to verify audit ID</span>
                      </div>
                      <div className="col-6 text-end small">
                        <div className="fst-italic fw-bold text-dark mb-1">Payroll Pro HR Signature</div>
                        <span className="d-block text-muted" style={{ fontSize: "10px" }}>Authorized Digital Signatory</span>
                      </div>
                    </div>
                  </div>

                  <button className="btn btn-info text-dark fw-bold mt-3" onClick={downloadPDF}>
                    <i className="bi bi-download me-1"></i> Download Signed Payslip PDF
                  </button>
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-center border border-dashed rounded text-muted py-5 h-100 bg-white bg-opacity-5" style={{ minHeight: "350px" }}>
                  <div className="text-center">
                    <i className="bi bi-receipt display-4 d-block mb-2 text-info opacity-50"></i>
                    No statements available for your profile currently.
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

export default EmployeeSalarySlip;
