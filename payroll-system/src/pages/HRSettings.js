import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { hrAPI } from "../services/api";

function HRSettings() {
  const [role, setRole] = useState("employee");

  // Dynamic selector lists from DB
  const [shifts, setShifts] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [weekendRule, setWeekendRule] = useState("Sunday");

  // Form States (Admin only)
  const [newShiftName, setNewShiftName] = useState("");
  const [newShiftStart, setNewShiftStart] = useState("");
  const [newShiftEnd, setNewShiftEnd] = useState("");

  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchHRConfig = useCallback(async () => {
    try {
      const userRole = localStorage.getItem("role") || "employee";
      setRole(userRole);

      const shiftRes = await hrAPI.getShifts();
      const holidayRes = await hrAPI.getHolidays();
      const compRes = await hrAPI.getCompany();

      if (shiftRes.data.success) setShifts(shiftRes.data.data);
      if (holidayRes.data.success) setHolidays(holidayRes.data.data);
      if (compRes.data.success) {
        setWeekendRule(compRes.data.data.weekendRule || "Sunday");
      }
    } catch (err) {
      console.error("Failed to load settings data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHRConfig();
  }, [fetchHRConfig]);

  const handleAddShift = async (e) => {
    e.preventDefault();
    if (!newShiftName || !newShiftStart || !newShiftEnd) {
      alert("Please fill in all shift configurations.");
      return;
    }

    try {
      const res = await hrAPI.createShift({
        name: newShiftName,
        start: newShiftStart,
        end: newShiftEnd
      });

      if (res.data.success) {
        alert("New shift added successfully!");
        setNewShiftName("");
        setNewShiftStart("");
        setNewShiftEnd("");
        fetchHRConfig();
      }
    } catch (err) {
      alert("Failed to add shift pattern");
    }
  };

  const handleDeleteShift = async (id) => {
    if (!window.confirm("Remove this shift structure?")) return;
    try {
      const res = await hrAPI.deleteShift(id);
      if (res.data.success) {
        alert(res.data.message);
        fetchHRConfig();
      }
    } catch (err) {
      alert("Failed to delete shift pattern");
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!newHolidayName || !newHolidayDate) {
      alert("Please fill in holiday details.");
      return;
    }

    try {
      const res = await hrAPI.createHoliday({
        name: newHolidayName,
        date: newHolidayDate
      });

      if (res.data.success) {
        alert("New holiday registered!");
        setNewHolidayName("");
        setNewHolidayDate("");
        fetchHRConfig();
      }
    } catch (err) {
      alert("Failed to add holiday");
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm("Delete this holiday date?")) return;
    try {
      const res = await hrAPI.deleteHoliday(id);
      if (res.data.success) {
        alert(res.data.message);
        fetchHRConfig();
      }
    } catch (err) {
      alert("Failed to delete holiday");
    }
  };

  const handleWeekendSave = async (e) => {
    const val = e.target.value;
    setWeekendRule(val);
    try {
      const res = await hrAPI.updateCompany({ weekendRule: val });
      if (res.data.success) {
        alert("Weekend rules updated successfully!");
        fetchHRConfig();
      }
    } catch (err) {
      alert("Failed to save weekend guidelines");
    }
  };

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
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold m-0 text-dark">HR Settings & Policies</h2>
            <span className="badge bg-warning text-dark px-3 py-2 fs-6">Module: Settings</span>
          </div>

          <div className="row">
            {/* Shifts & Weekends */}
            <div className="col-lg-6 mb-4">
              <div className="card shadow-sm border-0 p-4 mb-4 bg-white" style={{ borderRadius: "15px" }}>
                <h5 className="fw-bold mb-3 text-dark"><i className="bi bi-clock-fill text-primary me-2"></i>Shift Patterns</h5>
                {role === "admin" && (
                  <form onSubmit={handleAddShift} className="row g-2 mb-3 bg-light p-3 rounded">
                    <div className="col-md-4">
                      <input 
                        type="text" className="form-control form-control-sm" placeholder="Shift Name"
                        value={newShiftName} onChange={(e) => setNewShiftName(e.target.value)}
                      />
                    </div>
                    <div className="col-6 col-md-3">
                      <input 
                        type="time" className="form-control form-control-sm" 
                        value={newShiftStart} onChange={(e) => setNewShiftStart(e.target.value)}
                      />
                    </div>
                    <div className="col-6 col-md-3">
                      <input 
                        type="time" className="form-control form-control-sm" 
                        value={newShiftEnd} onChange={(e) => setNewShiftEnd(e.target.value)}
                      />
                    </div>
                    <div className="col-md-2">
                      <button type="submit" className="btn btn-primary btn-sm w-100 fw-bold">Add</button>
                    </div>
                  </form>
                )}

                <div className="row g-2">
                  {shifts.map(s => (
                    <div key={s._id} className="col-md-6">
                      <div className="card h-100 bg-light p-3 border-0" style={{ borderRadius: "8px" }}>
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="fw-bold m-0 text-primary">{s.name}</h6>
                          {role === "admin" && (
                            <button className="btn btn-link text-danger p-0" onClick={() => handleDeleteShift(s._id)}>
                              <i className="bi bi-trash-fill small"></i>
                            </button>
                          )}
                        </div>
                        <p className="small text-muted m-0 mt-2">
                          <i className="bi bi-alarm-fill text-warning me-1"></i>
                          {s.start} - {s.end}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="my-4"/>

                <h5 className="fw-bold mb-3 text-dark"><i className="bi bi-calendar-range-fill text-primary me-2"></i>Weekend Guidelines</h5>
                <div className="d-flex align-items-center justify-content-between bg-light p-3 rounded">
                  <span className="small">Weekly Day(s) Off:</span>
                  <select 
                    className="form-select form-select-sm w-auto fw-bold"
                    value={weekendRule}
                    onChange={handleWeekendSave}
                    disabled={role !== "admin"}
                  >
                    <option value="Sunday">Sunday Only</option>
                    <option value="Saturday & Sunday">Saturday & Sunday</option>
                    <option value="Alternate Saturdays & Sunday">Alternate Saturdays & Sunday</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Holiday Calendar List */}
            <div className="col-lg-6 mb-4">
              <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "15px" }}>
                <h5 className="fw-bold mb-3 text-dark"><i className="bi bi-calendar-check-fill text-primary me-2"></i>Corporate Holidays</h5>
                {role === "admin" && (
                  <form onSubmit={handleAddHoliday} className="row g-2 mb-3 bg-light p-3 rounded">
                    <div className="col-md-6">
                      <input 
                        type="text" className="form-control form-control-sm" placeholder="Holiday Occasion"
                        value={newHolidayName} onChange={(e) => setNewHolidayName(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <input 
                        type="date" className="form-control form-control-sm"
                        value={newHolidayDate} onChange={(e) => setNewHolidayDate(e.target.value)}
                      />
                    </div>
                    <div className="col-md-2">
                      <button type="submit" className="btn btn-primary btn-sm w-100 fw-bold">Register</button>
                    </div>
                  </form>
                )}

                <div className="list-group list-group-flush" style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {holidays.length === 0 ? (
                    <span className="text-muted text-center py-3">No holiday dates posted</span>
                  ) : (
                    holidays.map(h => (
                      <div key={h._id} className="list-group-item d-flex justify-content-between align-items-center border-0 border-bottom py-2">
                        <div>
                          <strong className="text-dark d-block small">{h.name}</strong>
                          <span className="small text-muted"><i className="bi bi-calendar-event me-1"></i>{new Date(h.date).toLocaleDateString()}</span>
                        </div>
                        {role === "admin" && (
                          <button className="btn btn-outline-danger btn-sm border-0" onClick={() => handleDeleteHoliday(h._id)}>
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HRSettings;
