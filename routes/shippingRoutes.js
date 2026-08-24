const express = require("express");
const router = express.Router();
const shippingController = require("../controllers/shippingController");

// Public routes for checkout & product pages
router.post("/check-pincode", shippingController.checkPincode);
router.post("/estimate", shippingController.checkPincode);

module.exports = router;
