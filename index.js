const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const mongoose = require("mongoose");
const connectDb = require("./config/connectDb");
const sendEmail = require("./utilities/emailService");

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
// Upload filenames are immutable, so let browsers/CDNs reuse optimized image sources.
app.use("/uploads", express.static(require("path").join(__dirname, "uploads"), {
  maxAge: "7d",
  immutable: true,
}));

// Routes
app.use("/user", require("./routes/userRoutes"));
app.use("/product", require("./routes/productRoutes"));
app.use("/reviews", require("./routes/reviewRoutes"));
app.use("/stock-notifications", require("./routes/stockNotificationRoutes"));
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
app.use("/coupon", require("./routes/couponRoutes"));


// Health check
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "API is running!" });
});

app.get("/health/notifications", (req, res) => {
  res.json({
    success: true,
    email: sendEmail.getConfig(),
    whatsapp: {
      twilioConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM),
      apiConfigured: Boolean(process.env.WHATSAPP_API_URL),
      templateConfigured: Boolean(process.env.TWILIO_WHATSAPP_CONTENT_SID),
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ success: false, message: `Unexpected upload field "${err.field || "unknown"}". Use "images" for product images.` });
  }
  if (err.name === "MulterError" || err.message === "Only image files are allowed") {
    return res.status(400).json({ success: false, message: err.message });
  }
  res.status(500).json({ success: false, message: err.message || "Something went wrong!" });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log("[notifications] email configuration:", sendEmail.getConfig());
  console.log("[notifications] WhatsApp configured:", Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM) || Boolean(process.env.WHATSAPP_API_URL));
});
