const express = require("express");
const authorize = require("../middlewares/authorize");
const admin = require("../middlewares/admin");
const controller = require("../controllers/reviewController");

const router = express.Router();

// Public
router.get("/:productId", controller.list);

// Customer Authenticated
router.post("/:productId", authorize, controller.create);
router.delete("/my/:id", authorize, controller.deleteMyReview);

// Admin Governance
router.get("/admin/all", authorize, admin, controller.adminListReviews);
router.put("/admin/:id/approval", authorize, admin, controller.adminToggleApproval);
router.delete("/admin/:id", authorize, admin, controller.adminDeleteReview);

module.exports = router;
