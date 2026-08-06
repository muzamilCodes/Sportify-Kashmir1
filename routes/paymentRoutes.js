const express = require("express");
const router = express.Router();
const authorize = require("../middlewares/authorize");
const optionalAuthorize = require("../middlewares/optionalAuthorize");
const paymentController = require("../controllers/paymentController");

// ✅ Make sure these routes exist
router.post("/create", optionalAuthorize, paymentController.createPaymentOrder);
router.post("/verify", authorize, paymentController.verifyPaymentAndCreateOrder);

module.exports = router;