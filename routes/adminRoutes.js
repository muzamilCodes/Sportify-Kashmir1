const express = require("express");
const router = express.Router();
const authorize = require("../middlewares/authorize");
const admin = require("../middlewares/admin");
const adminController = require("../controllers/adminController");

// Admin dashboard routes
router.get("/dashboard", authorize, admin, adminController.getDashboardStats);
router.get("/revenue-chart", authorize, admin, adminController.getRevenueChart);

module.exports = router;