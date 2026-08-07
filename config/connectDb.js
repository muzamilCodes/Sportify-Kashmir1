// server/config/connectDb.js
const mongoose = require("mongoose");

let isConnected = false;

const connectDb = async () => {
  if (isConnected) return;
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error("❌ MONGO_URI is missing in environment variables!");
      return;
    }
    console.log("Connecting to MongoDB...");
    const db = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging 30s
    });
    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
  }
};

module.exports = connectDb;

