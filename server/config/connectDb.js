// server/config/connectDb.js
const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const uri = process.env.MONGO_URI ;
    console.log("Connecting to MongoDB:", uri);
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDb;
