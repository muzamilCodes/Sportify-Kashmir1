const express = require("express");
const router = express.Router();
const authorize = require("../middlewares/authorize");
const admin = require("../middlewares/admin");
const couponController = require("../controllers/couponController");

// Public / Checkout Validation & Spin Wheel
router.get("/all", couponController.getAllCoupons);
router.post("/validate", couponController.validateCoupon);
router.post("/spin-generate", couponController.generateSpinCoupon);

// Admin Coupon Management
router.post("/add", authorize, admin, couponController.addCoupon);
router.put("/edit/:id", authorize, admin, couponController.updateCoupon);
router.put("/toggle/:id", authorize, admin, couponController.toggleCouponStatus);
router.delete("/delete/:id", authorize, admin, couponController.deleteCoupon);

module.exports = router;
