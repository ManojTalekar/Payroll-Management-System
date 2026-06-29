const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const dotenv = require("dotenv");

// Load Environment Variables
dotenv.config();

// Verify Required Environment Variables
const requiredEnvVars = ["PORT", "MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.warn(`Environment variable missing: "${envVar}" is not defined in environment variables!`);
  } else {
    console.log(`Environment variable check: "${envVar}" is successfully loaded.`);
  }
});


// Database connection and auto-seeding
const connectDB = require("./config/db");
const Employee = require("./models/Employee");
const seedDatabase = require("./scripts/seed");

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local static files in React frontend
}));
app.use(cors());

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

const PORT = process.env.PORT || 63389;

// Connect to Database and start Server after database is ready / seeded
connectDB().then(async () => {
  try {
    const employeeCount = await Employee.countDocuments();
    if (employeeCount === 0) {
      console.log("Database is empty. Initiating programmatic database seeding...");
      await seedDatabase();
      console.log("Database seeded successfully during server boot.");
    } else {
      console.log(`Database checks: ${employeeCount} employee records present. Skipping auto-seeding.`);
    }
  } catch (err) {
    console.error("Auto-seeding check failed:", err.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to connect to database:", err.message);
  process.exit(1);
});
