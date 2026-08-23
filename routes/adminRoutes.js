const express = require("express");
const router = express.Router();
const authorize = require("../middlewares/authorize");
const admin = require("../middlewares/admin");
const adminController = require("../controllers/adminController");

// Admin dashboard routes
router.get("/dashboard", authorize, admin, adminController.getDashboardStats);
router.get("/revenue-chart", authorize, admin, adminController.getRevenueChart);

// Admin inventory routes
router.get("/inventory", authorize, admin, adminController.getInventoryData);
router.put("/inventory/stock/:productId", authorize, admin, adminController.updateProductStock);

// Admin analytics & reports route
router.get("/reports", authorize, admin, adminController.getReportsData);

const upload = require("../middlewares/multer");

// Admin store settings routes
router.get("/public/settings", adminController.getStoreSettings);
router.get("/settings", authorize, admin, adminController.getStoreSettings);
router.post("/settings", authorize, admin, upload.any(), adminController.updateStoreSettings);

module.exports = router;