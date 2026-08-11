process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const mongoose = require("mongoose");
const connectDb = require("./config/connectDb");

const app = express();
const port = process.env.PORT || 4000;

// Connect DB at startup
connectDb();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Auto-reconnect / check DB connection before handling requests
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    await connectDb();
  }
  next();
});

// ✅ CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:4000',
  'https://sportify-kashmir1.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    const cleanOrigin = origin.replace(/\/$/, "");
    const isAllowed = allowedOrigins.some(o => {
      const cleanO = o ? o.replace(/\/$/, "") : "";
      return cleanOrigin === cleanO;
    });

    if (
      isAllowed || 
      cleanOrigin.startsWith('http://localhost:') || 
      cleanOrigin.startsWith('http://127.0.0.1:') ||
      cleanOrigin.endsWith('.vercel.app')
    ) {
      callback(null, true);
    } else {
      console.warn('🚫 Blocked unlisted CORS origin:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
}));

// Static uploads
app.use("/uploads", express.static(require("path").join(__dirname, "uploads")));

// Routes
app.use("/user", require("./routes/userRoutes"));
app.use("/product", require("./routes/productRoutes"));
app.use("/category", require("./routes/categoryRoutes"));
app.use("/brand", require("./routes/brandRoutes"));
app.use("/orders", require("./routes/orderRoutes"));
app.use("/addresses", require("./routes/addressRoutes"));
app.use("/cart", require("./routes/cartRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/refund", require("./routes/refundRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/contact", require("./routes/contactRoutes"));
app.use("/posts", require("./routes/postRoutes"));

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "API is running!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ success: false, message: err.message || "Something went wrong!" });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  // console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  // console.log(`📍 Frontend URL: ${process.env.FRONTEND_URL || "Not set"}`);
});