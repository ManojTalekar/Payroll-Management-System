import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Route Guard
import ProtectedRoute from "./components/ProtectedRoute";

// Admin Portal Pages
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Employees from "./pages/Employees";
import AddEmployee from "./pages/AddEmployee";
import Attendance from "./pages/Attendance";
import AttendanceCalendar from "./pages/AttendanceCalendar";
import SalarySlip from "./pages/SalarySlip";
import SalaryReport from "./pages/SalaryReport";
import SalaryPrediction from "./pages/SalaryPrediction";
import AdminLeaveManagement from "./pages/AdminLeaveManagement";
import Recruitment from "./pages/Recruitment";
import HRSettings from "./pages/HRSettings";

// Employee Portal Pages
import EmployeeDashboard from "./pages/EmployeeDashboard";
import MyAttendance from "./pages/MyAttendance";
import EmployeeProfile from "./pages/EmployeeProfile";
import EmployeeSalarySlip from "./pages/EmployeeSalarySlip";
import EmployeeSalaryHistory from "./pages/EmployeeSalaryHistory";
import EmployeeAttendanceCalendar from "./pages/EmployeeAttendanceCalendar";
import LeaveRequest from "./pages/LeaveRequest";

// Shared Pages
import DocumentManagement from "./pages/DocumentManagement";
import Performance from "./pages/Performance";
import AIChatbot from "./pages/AIChatbot";
import GlobalAIChatbot from "./components/GlobalAIChatbot";

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ADMIN PORTAL PROTECTED ROUTES */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={["admin", "hr", "manager"]}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute allowedRoles={["admin", "hr", "manager"]}>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employees" 
          element={
            <ProtectedRoute allowedRoles={["admin", "hr", "manager"]}>
              <Employees />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/add-employee" 
          element={
            <ProtectedRoute allowedRoles={["admin", "hr", "manager"]}>
              <AddEmployee />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/attendance" 
          element={
            <ProtectedRoute allowedRoles={["admin", "hr", "manager"]}>
              <Attendance />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/attendance-calendar" 
          element={
            <ProtectedRoute allowedRoles={["admin", "hr", "manager"]}>
              <AttendanceCalendar />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/salary-slip" 
          element={
            <ProtectedRoute allowedRoles={["admin", "hr", "manager"]}>
              <SalarySlip />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/salary-report" 
          element={
            <ProtectedRoute allowedRoles={["admin", "hr", "manager"]}>
              <SalaryReport />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/salary-prediction" 
          element={
            <ProtectedRoute allowedRoles={["admin", "hr", "manager"]}>
              <SalaryPrediction />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-leave-management" 
          element={
            <ProtectedRoute allowedRoles={["admin", "hr", "manager"]}>
              <AdminLeaveManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recruitment" 
          element={
            <ProtectedRoute allowedRoles={["admin", "hr", "manager"]}>
              <Recruitment />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/hr-settings" 
          element={
            <ProtectedRoute allowedRoles={["admin", "hr", "manager"]}>
              <HRSettings />
            </ProtectedRoute>
          } 
        />

        {/* EMPLOYEE PORTAL PROTECTED ROUTES */}
        <Route 
          path="/employee-dashboard" 
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-attendance" 
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <MyAttendance />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employee-profile" 
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeProfile />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/employee-salary-slip"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeSalarySlip />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-salary-history"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeSalaryHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-attendance-calendar"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeAttendanceCalendar />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/leave-request" 
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <LeaveRequest />
            </ProtectedRoute>
          } 
        />

        {/* SHARED PROTECTED ROUTES */}
        <Route 
          path="/document-management" 
          element={
            <ProtectedRoute>
              <DocumentManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/performance" 
          element={
            <ProtectedRoute>
              <Performance />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ai-assistant" 
          element={
            <ProtectedRoute>
              <AIChatbot />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <GlobalAIChatbot />
    </Router>
  );
}

export default App;
