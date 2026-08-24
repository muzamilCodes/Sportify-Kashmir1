const express = require("express");
const router = express.Router();
const authorize = require("../middlewares/authorize");
const admin = require("../middlewares/admin");
const returnController = require("../controllers/returnController");

// Customer Endpoints
router.post("/request", authorize, returnController.requestReturn);
router.get("/my-returns", authorize, returnController.getMyReturns);

// Admin Endpoints
router.get("/admin/all", authorize, admin, returnController.getAdminReturns);
router.put("/admin/:id/status", authorize, admin, returnController.updateReturnStatus);

module.exports = router;
