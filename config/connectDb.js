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

    // Safely drop legacy unique index on username_1 in MongoDB Atlas if it exists
    try {
      await mongoose.connection.collection("users").dropIndex("username_1");
      console.log("✅ Legacy unique index username_1 dropped from MongoDB collection");
    } catch (indexErr) {
      // Index username_1 does not exist or already dropped - safe to ignore
    }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
  }
};

module.exports = connectDb;

