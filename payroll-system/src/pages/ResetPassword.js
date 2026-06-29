import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { motion } from "framer-motion";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const getPasswordStrength = () => {
    if (!password) return { text: "None", color: "text-muted", percent: 0 };
    let strength = 0;
    if (password.length >= 6) strength += 20;
    if (password.length >= 10) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;

    if (strength <= 40) return { text: "Weak 🔴", color: "text-danger", percent: 30 };
    if (strength <= 80) return { text: "Moderate 🟡", color: "text-warning", percent: 65 };
    return { text: "Strong 🟢", color: "text-success", percent: 100 };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg("Please enter a new password.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setMessage("");

    try {
      const res = await authAPI.resetPassword(token, password);
      if (res.data.success) {
        setMessage("Password has been updated. Redirecting to login portal...");
        setTimeout(() => {
          navigate("/login");
        }, 2500);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Invalid or expired reset token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: "linear-gradient(rgba(15, 32, 39, 0.8), rgba(44, 83, 100, 0.8)), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1472&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "'Outfit', sans-serif"
      }}>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card shadow-lg p-5" 
        style={{
          width: "420px",
          borderRadius: "20px",
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(15px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          color: "#fff"
        }}
      >
        <div className="text-center mb-4">
          <h3 className="fw-bold m-0"><i className="bi bi-shield-check text-info me-2"></i>Reset Password</h3>
          <small className="text-light opacity-75">Define your new access key</small>
        </div>

        {errorMsg && (
          <div className="alert alert-danger border-0 py-2 small text-center" role="alert" style={{ background: "rgba(220, 53, 69, 0.2)", color: "#f8d7da" }}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {errorMsg}
          </div>
        )}

        {message && (
          <div className="alert alert-success border-0 py-2 small text-center" role="alert" style={{ background: "rgba(40, 167, 69, 0.2)", color: "#d4edda" }}>
            <i className="bi bi-check-circle-fill me-2"></i> {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small text-info fw-bold">New Secret Password</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 border-secondary text-info">
                <i className="bi bi-lock-fill"></i>
              </span>
              <input
                type="password"
                className="form-control bg-transparent text-white border-start-0 border-secondary"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ outline: "none", boxShadow: "none" }}
                required
              />
            </div>
            {password && (
              <div className="mt-2">
                <div className="progress bg-secondary" style={{ height: "4px" }}>
                  <div className={`progress-bar ${strength.percent === 100 ? "bg-success" : strength.percent === 65 ? "bg-warning" : "bg-danger"}`} 
                    role="progressbar" 
                    style={{ width: `${strength.percent}%` }}
                  ></div>
                </div>
                <small className={`d-block mt-1 fs-7 ${strength.color}`}>Strength: {strength.text}</small>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label small text-info fw-bold">Confirm Secret Password</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 border-secondary text-info">
                <i className="bi bi-lock-fill"></i>
              </span>
              <input
                type="password"
                className="form-control bg-transparent text-white border-start-0 border-secondary"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ outline: "none", boxShadow: "none" }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-info w-100 fw-bold py-2 mt-2 shadow-sm text-dark transition"
            disabled={loading}
            style={{
              borderRadius: "8px",
              background: "linear-gradient(90deg, #00c6ff, #0072ff)"
            }}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
            ) : (
              <i className="bi bi-shield-check-fill me-2"></i>
            )}
            Complete Password Reset
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/login" className="text-info text-decoration-none small">
            Return to Login Portal
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default ResetPassword;
