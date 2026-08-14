const express = require("express");
const router = express.Router();
const authorize = require("../middlewares/authorize");
const admin = require("../middlewares/admin");
const couponController = require("../controllers/couponController");

router.get("/all", couponController.getAllCoupons);
router.post("/add", authorize, admin, couponController.addCoupon);
router.put("/toggle/:id", authorize, admin, couponController.toggleCouponStatus);
router.delete("/delete/:id", authorize, admin, couponController.deleteCoupon);

module.exports = router;
