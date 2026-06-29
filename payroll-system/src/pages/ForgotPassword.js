import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { motion } from "framer-motion";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your registered corporate email.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setMessage("");

    try {
      const res = await authAPI.forgotPassword(email);
      if (res.data.success) {
        setMessage(`Instructions have been dispatched to ${email}. Check inbox or mail logs.`);
        // For local testing convenience
        if (res.data.resetToken) {
          console.log(`[DEVELOPER MOCK RESET URL] http://localhost:3000/reset-password/${res.data.resetToken}`);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Something went wrong. Verify your email exists.");
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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
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
          <h3 className="fw-bold m-0"><i className="bi bi-shield-lock text-info me-2"></i>Forgot Password</h3>
          <small className="text-light opacity-75">TechNova Account Access Recovery</small>
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
          <div className="mb-4">
            <label className="form-label small text-info fw-bold">Corporate Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 border-secondary text-info">
                <i className="bi bi-envelope-fill"></i>
              </span>
              <input
                type="email"
                className="form-control bg-transparent text-white border-start-0 border-secondary"
                placeholder="name@technova.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <i className="bi bi-send me-2"></i>
            )}
            Send Reset Instructions
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/login" className="text-info text-decoration-none small">
            <i className="bi bi-arrow-left me-1"></i> Back to Login Portal
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;
