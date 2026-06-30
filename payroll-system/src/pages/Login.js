import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { authAPI } from "../services/api";
import { motion } from "framer-motion";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      username: localStorage.getItem("rememberedUser") || "",
      password: "",
      rememberMe: localStorage.getItem("rememberedUser") ? true : false
    }
  });

  const passwordVal = watch("password");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("role");

    if (isLoggedIn) {
      if (role === "admin" || role === "hr" || role === "manager") {
        navigate("/dashboard");
      } else if (role === "employee") {
        navigate("/employee-dashboard");
      }
    }
  }, [navigate]);

  const getPasswordStrength = () => {
    if (!passwordVal) return { text: "None", color: "text-muted", percent: 0 };
    let strength = 0;
    if (passwordVal.length >= 6) strength += 20;
    if (passwordVal.length >= 10) strength += 20;
    if (/[A-Z]/.test(passwordVal)) strength += 20;
    if (/[0-9]/.test(passwordVal)) strength += 20;
    if (/[^A-Za-z0-9]/.test(passwordVal)) strength += 20;

    if (strength <= 40) return { text: "Weak 🔴", color: "text-danger", percent: 33 };
    if (strength <= 80) return { text: "Moderate 🟡", color: "text-warning", percent: 66 };
    return { text: "Strong 🟢", color: "text-success", percent: 100 };
  };

  const strength = getPasswordStrength();

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await authAPI.login(data.username, data.password);
      if (res.data.success) {
        const { accessToken, refreshToken, user } = res.data;

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("role", user.role);
        localStorage.setItem("username", user.name);
        if (user.employeeId) {
          localStorage.setItem("employeeId", user.employeeId);
        }

        if (data.rememberMe) {
          localStorage.setItem("rememberedUser", data.username);
        } else {
          localStorage.removeItem("rememberedUser");
        }

        if (user.role === "admin" || user.role === "hr" || user.role === "manager") {
          navigate("/dashboard");
        } else {
          navigate("/employee-dashboard");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || "Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 position-relative"
      style={{
        backgroundImage: "linear-gradient(rgba(10, 15, 30, 0.8), rgba(15, 32, 67, 0.8)), url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1470&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "'Outfit', sans-serif",
        overflow: "hidden"
      }}>
      
      {/* Background Animated Floating Spheres */}
      <div className="position-absolute bg-info rounded-circle filter blur-3xl opacity-10" style={{ width: "250px", height: "250px", top: "15%", left: "10%", animation: "pulse 6s infinite alternate" }}></div>
      <div className="position-absolute bg-purple rounded-circle filter blur-3xl opacity-10" style={{ width: "300px", height: "300px", bottom: "15%", right: "10%" }}></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card shadow-lg p-4" 
        style={{
          width: "420px",
          borderRadius: "24px",
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          color: "#fff"
        }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold m-0" style={{ letterSpacing: "1.5px" }}>
            PAYROLL <span className="text-info">PRO</span>
          </h2>
          <small className="text-light opacity-75">Smart Payroll Solution</small>
        </div>

        {errorMsg && (
          <div className="alert alert-danger border-0 py-2 small text-center" role="alert" style={{ background: "rgba(220, 53, 69, 0.25)", color: "#f8d7da" }}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* USERNAME */}
          <div className="mb-3">
            <label className="form-label small text-info fw-bold">Username / Corporate Email</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 border-secondary text-info">
                <i className="bi bi-person-fill"></i>
              </span>
              <input
                type="text"
                className={`form-control bg-transparent text-white border-start-0 border-secondary ${errors.username ? "is-invalid" : ""}`}
                placeholder="name@payrollpro.com or 'admin'"
                {...register("username", { required: "Username is required" })}
                style={{ outline: "none", boxShadow: "none" }}
              />
            </div>
            {errors.username && <small className="text-danger mt-1">{errors.username.message}</small>}
          </div>

          {/* PASSWORD */}
          <div className="mb-3">
            <label className="form-label small text-info fw-bold">Secret Password</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 border-secondary text-info">
                <i className="bi bi-lock-fill"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control bg-transparent text-white border-start-0 border-end-0 border-secondary ${errors.password ? "is-invalid" : ""}`}
                placeholder="Enter secret key"
                {...register("password", { required: "Password is required" })}
                style={{ outline: "none", boxShadow: "none" }}
              />
              <span className="input-group-text bg-transparent border-start-0 border-secondary text-info"
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer" }}>
                <i className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}></i>
              </span>
            </div>
            {errors.password && <small className="text-danger mt-1">{errors.password.message}</small>}

            {/* Password strength meter */}
            {passwordVal && (
              <div className="mt-2">
                <div className="progress" style={{ height: "4px", background: "rgba(255,255,255,0.15)" }}>
                  <div className={`progress-bar ${strength.percent === 100 ? "bg-success" : strength.percent === 66 ? "bg-warning" : "bg-danger"}`}
                    role="progressbar"
                    style={{ width: `${strength.percent}%` }}
                  ></div>
                </div>
                <small className={`d-block mt-1 ${strength.color}`} style={{ fontSize: "11px" }}>Strength: {strength.text}</small>
              </div>
            )}
          </div>

          {/* REMEMBER ME & FORGOT PASSWORD */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="rememberMe"
                {...register("rememberMe")}
              />
              <label className="form-check-label small text-light opacity-75" htmlFor="rememberMe">
                Remember Me
              </label>
            </div>
            <Link to="/forgot-password" className="text-info text-decoration-none small fw-semibold">
              Forgot Key?
            </Link>
          </div>

          {/* SIGN IN BUTTON */}
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
              <i className="bi bi-box-arrow-in-right me-2"></i>
            )}
            Sign In
          </button>
        </form>

        {/* Mock Social Logins */}
        <div className="mt-4 text-center">
          <small className="text-light opacity-50 block mb-3">Or continue with Secure SSO</small>
          <div className="d-flex justify-content-center gap-2">
            <button className="btn btn-outline-light border-secondary btn-sm px-3" style={{ background: "rgba(255,255,255,0.05)" }} onClick={() => alert("SSO mock login triggered via Okta")}>
              <i className="bi bi-shield-lock-fill text-info me-1"></i> Okta
            </button>
            <button className="btn btn-outline-light border-secondary btn-sm px-3" style={{ background: "rgba(255,255,255,0.05)" }} onClick={() => alert("SSO mock login triggered via Microsoft Azure AD")}>
              <i className="bi bi-windows text-info me-1"></i> Azure
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <small className="text-light opacity-50 block fs-7">
            Demo Credentials:<br />
            Admin Portal → <span className="text-info font-monospace">admin@payrollpro.com / 1234</span><br />
            HR Portal → <span className="text-info font-monospace">hr@payrollpro.com / 1234</span><br />
            Employee → <span className="text-info font-monospace">employee@payrollpro.com / 1234</span>
          </small>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
