const dotenv = require("dotenv");
const path = require("path");

// Load Environment Variables
dotenv.config();

// Verify Required Environment Variables
const requiredEnvVars = ["PORT", "MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.warn(`Environment variable warning: "${envVar}" is not defined in environment variables!`);
  } else {
    console.log(`Environment variable check: "${envVar}" is successfully loaded.`);
  }
});

const connectDB = require("./config/db");
const Employee = require("./models/Employee");
const seedDatabase = require("./seed/seed");
const app = require("./app");

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
// nodemon restart trigger
