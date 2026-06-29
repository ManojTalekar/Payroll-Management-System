const mongoose = require("mongoose");

const connectDB = async () => {
  const localUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hrms_db";
  try {
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: Local MongoDB connection refused on ${localUri}: ${error.message}`);
    console.log("Spinning up in-memory MongoDB Server fallback...");
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      // Update config connection URI
      process.env.MONGO_URI = mongoUri;

      const conn = await mongoose.connect(mongoUri);
      console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
      
      // Keep server reference in global namespace
      global.mongoServer = mongoServer;
    } catch (memError) {
      console.error(`In-Memory MongoDB start failed: ${memError.message}`);
      console.error("Please ensure MongoDB is running locally on port 27017, or configure MONGO_URI in .env");
      process.exit(1);
    }
  }
};

module.exports = connectDB;

