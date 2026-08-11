// server/config/connectDb.js
const mongoose = require("mongoose");

let isConnecting = false;

// Event listeners to log connection lifecycle events
mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connected successfully!");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected!");
});

const connectDb = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (isConnecting) {
    return false;
  }

  isConnecting = true;
  try {
    let uri = process.env.MONGO_URI;
    if (!uri) {
      console.error("❌ MONGO_URI is missing in environment variables!");
      isConnecting = false;
      return false;
    }

    console.log("Connecting to MongoDB...");

    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
    } catch (primaryErr) {
      if (uri.includes("localhost")) {
        const fallbackUri = uri.replace("localhost", "127.0.0.1");
        console.warn(`⚠️ Primary URI connection failed (${primaryErr.message}). Trying IPv4 fallback (${fallbackUri})...`);
        await mongoose.connect(fallbackUri, {
          serverSelectionTimeoutMS: 5000,
        });
      } else {
        throw primaryErr;
      }
    }

    isConnecting = false;
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    isConnecting = false;
    return false;
  }
};

module.exports = connectDb;


