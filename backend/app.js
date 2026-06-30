const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local static files in React frontend
}));

// CORS Configuration
// CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or local scripts)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed === "*") return true;
      if (allowed.includes(".netlify.app")) {
        return origin.endsWith(".netlify.app");
      }
      return allowed === origin;
    }) || origin.includes("localhost") || origin.includes("127.0.0.1") || origin.endsWith(".netlify.app");

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Log Requests
app.use(morgan("dev"));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local upload files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Define Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));
app.use("/api/salaries", require("./routes/salaryRoutes"));
app.use("/api/hr", require("./routes/hrRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/performance", require("./routes/performanceRoutes"));
app.use("/api/recruitment", require("./routes/recruitmentRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// Default Health Route
app.get("/", (req, res) => {
  res.json({ message: "Enterprise HRMS Backend is running successfully" });
});

// Error handling Middlewares
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
app.use(notFound);
app.use(errorHandler);

module.exports = app;
