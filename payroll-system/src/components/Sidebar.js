import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("role") || "";
    setRole(userRole);

    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      document.body.classList.add("dark");
      setDarkMode(true);
    }

    // Handle screen resize listeners to manage responsive states
    const handleResize = () => {
      const isMobile = window.innerWidth <= 992;
      setIsMobileScreen(isMobile);
      if (!isMobile) setIsMobileOpen(false); // Close mobile tray on desktop resize
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleDarkMode = () => {
    if (darkMode) {
      document.body.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    } else {
      document.body.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    }
    setDarkMode(!darkMode);
  };

  const getLinkClass = (path) => {
    return location.pathname === path
      ? "nav-link text-info bg-dark fw-bold border-start border-4 border-info"
      : "nav-link text-white opacity-75 hover-opacity-100";
  };

  return (
    <>
      {/* MOBILE HEADER FOR TOGGLE BUTTON */}
      {isMobileScreen && (
        <div className="d-flex align-items-center justify-content-between px-3 py-2 text-white bg-dark position-fixed w-100 top-0 start-0" style={{ zIndex: 1050, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <span className="fw-bold d-flex align-items-center" style={{ fontSize: "16px" }}>
            <i className="bi bi-cpu-fill text-info me-2"></i> TECHNOVA
          </span>
          <button className="btn btn-outline-light border-0" onClick={() => setIsMobileOpen(!isMobileOpen)}>
            <i className={`bi ${isMobileOpen ? "bi-x-lg" : "bi-list"} fs-3`}></i>
          </button>
        </div>
      )}

      {/* MOBILE SEMI-TRANSPARENT BACKGROUND OVERLAY */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 1040
          }}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <div
        className="d-flex flex-column flex-shrink-0 p-3 text-white transition-transform"
        style={{
          width: "260px",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          background: "linear-gradient(180deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
          overflowY: "auto",
          zIndex: 1045,
          transition: "transform 0.3s ease-in-out",
          transform: isMobileScreen && !isMobileOpen ? "translateX(-260px)" : "translateX(0)"
        }}
      >
        {/* LOGO AREA */}
        <div className="text-center mb-4 mt-4 mt-lg-2 border-bottom border-secondary border-opacity-25 pb-3">
          <h5 className="fw-bold m-0 d-flex align-items-center justify-content-center">
            <i className="bi bi-cpu-fill text-info me-2 fs-4"></i>
            TECH<span className="text-info">NOVA</span>
          </h5>
          <small className="text-muted text-uppercase tracking-wider" style={{ fontSize: "9px" }}>
            HR & Payroll Portal
          </small>
        </div>

        {/* MENU DIRECTORY */}
        <ul className="nav nav-pills flex-column mb-auto">
          {/* ADMIN & HR DIRECTORY */}
          {(role === "admin" || role === "hr" || role === "manager") && (
            <>
              <li className="nav-item mb-1.5">
                <Link to="/dashboard" className={getLinkClass("/dashboard")} onClick={() => setIsMobileOpen(false)}>
                  <i className="bi bi-speedometer2 me-2"></i> Dashboard
                </Link>
              </li>
              <li className="nav-item mb-1.5">
                <Link to="/profile" className={getLinkClass("/profile")} onClick={() => setIsMobileOpen(false)}>
                  <i className="bi bi-person-circle me-2"></i> HQ Profile
                </Link>
              </li>
              <li className="nav-item mb-1.5">
                <Link to="/employees" className={getLinkClass("/employees")} onClick={() => setIsMobileOpen(false)}>
                  <i className="bi bi-people me-2"></i> Employee Directory
                </Link>
              </li>
              <li className="nav-item mb-1.5">
                <Link to="/add-employee" className={getLinkClass("/add-employee")} onClick={() => setIsMobileOpen(false)}>
                  <i className="bi bi-person-plus me-2"></i> Onboard Employee
                </Link>
              </li>
              <li className="nav-item mb-1.5">
                <Link to="/attendance" className={getLinkClass("/attendance")} onClick={() => setIsMobileOpen(false)}>
                  <i className="bi bi-calendar-check me-2"></i> Attendance Audit
                </Link>
              </li>
              <li className="nav-item mb-1.5">
                <Link to="/admin-leave-management" className={getLinkClass("/admin-leave-management")} onClick={() => setIsMobileOpen(false)}>
                  <i className="bi bi-person-check me-2"></i> Leaves Desk
                </Link>
              </li>
              <li className="nav-item mb-1.5">
                <Link to="/recruitment" className={getLinkClass("/recruitment")} onClick={() => setIsMobileOpen(false)}>
                  <i className="bi bi-briefcase me-2"></i> Recruitment
                </Link>
              </li>
              <li className="nav-item mb-1.5">
                <Link to="/salary-slip" className={getLinkClass("/salary-slip")} onClick={() => setIsMobileOpen(false)}>
                  <i className="bi bi-currency-rupee me-2"></i> Salary Generator
                </Link>
              </li>
              <li className="nav-item mb-1.5">
                <Link to="/salary-report" className={getLinkClass("/salary-report")} onClick={() => setIsMobileOpen(false)}>
                  <i className="bi bi-file-earmark-bar-graph me-2"></i> Payroll Reports
                </Link>
              </li>
              <li className="nav-item mb-1.5">
                <Link to="/salary-prediction" className={getLinkClass("/salary-prediction")} onClick={() => setIsMobileOpen(false)}>
                  <i className="bi bi-graph-up-arrow me-2"></i> Predictive Finance
                </Link>
              </li>
            </>
          )}

          {/* EMPLOYEE PORTAL DIRECTORY */}
          {role === "employee" && (
            <>
              <li className="nav-item mb-1.5">
                <Link to="/employee-dashboard" className={getLinkClass("/employee-dashboard")} onClick={() => setIsMobileOpen(false)}>
                  <i className="bi bi-speedometer2 me-2"></i> My Dashboard
                </Link>
              </li>
              <li className="nav-item mb-1.5">
                <Link to="/employee-profile" className={getLinkClass("/employee-profile")} onClick={() => setIsMobileOpen(false)}>
                  <i className="bi bi-person me-2"></i> My Profile File
                </Link>
              </li>
              <li className="nav-item mb-1.5">
                <Link to="/my-attendance" className={getLinkClass("/my-attendance")} onClick={() => setIsMobileOpen(false)}>
                  <i className="bi bi-calendar2-week me-2"></i> Clock logs
                </Link>
              </li>
              <li className="nav-item mb-1.5">
                <Link to="/employee-salary-slip" className={getLinkClass("/employee-salary-slip")} onClick={() => setIsMobileOpen(false)}>
                  <i className="bi bi-receipt-cutoff me-2"></i> Payslips
                </Link>
              </li>
              <li className="nav-item mb-1.5">
                <Link to="/employee-salary-history" className={getLinkClass("/employee-salary-history")} onClick={() => setIsMobileOpen(false)}>
                  <i className="bi bi-clock-history me-2"></i> Payout Ledger
                </Link>
              </li>
              <li className="nav-item mb-1.5">
                <Link to="/employee-attendance-calendar" className={getLinkClass("/employee-attendance-calendar")} onClick={() => setIsMobileOpen(false)}>
                  <i className="bi bi-calendar3 me-2"></i> Duty Calendar
                </Link>
              </li>
              <li className="nav-item mb-1.5">
                <Link to="/leave-request" className={getLinkClass("/leave-request")} onClick={() => setIsMobileOpen(false)}>
                  <i className="bi bi-calendar-x me-2"></i> Request Leaves
                </Link>
              </li>
            </>
          )}

          {/* SHARED MODULES ACCESSIBLE BY BOTH ROLES */}
          <li className="nav-item mb-1.5 border-top border-secondary border-opacity-25 pt-2 mt-2">
            <Link to="/document-management" className={getLinkClass("/document-management")} onClick={() => setIsMobileOpen(false)}>
              <i className="bi bi-folder-fill me-2"></i> Documents Vault
            </Link>
          </li>
          <li className="nav-item mb-1.5">
            <Link to="/performance" className={getLinkClass("/performance")} onClick={() => setIsMobileOpen(false)}>
              <i className="bi bi-bar-chart-line me-2"></i> Appraisals Review
            </Link>
          </li>
          <li className="nav-item mb-1.5">
            <Link to="/ai-assistant" className={getLinkClass("/ai-assistant")} onClick={() => setIsMobileOpen(false)}>
              <i className="bi bi-cpu-fill me-2"></i> Gemini Assistant
            </Link>
          </li>
          <li className="nav-item mb-1.5">
            <Link to="/hr-settings" className={getLinkClass("/hr-settings")} onClick={() => setIsMobileOpen(false)}>
              <i className="bi bi-gear-fill me-2"></i> Company Policies
            </Link>
          </li>
        </ul>

        {/* THEME CONTROL */}
        <button className="btn btn-outline-light btn-sm mb-2 w-100" onClick={toggleDarkMode}>
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>

        {/* LOGOUT */}
        <button className="btn btn-danger w-100 fw-bold" onClick={logout}>
          <i className="bi bi-box-arrow-right me-1"></i> Terminate Session
        </button>
      </div>
    </>
  );
}

export default Sidebar;
