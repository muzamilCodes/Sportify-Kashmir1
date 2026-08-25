const express = require("express");
const router = express.Router();
const authorize = require("../middlewares/authorize");
const paymentController = require("../controllers/paymentController");

// ✅ Make sure these routes exist
router.post("/create", authorize, paymentController.createPaymentOrder);
router.post("/verify", authorize, paymentController.verifyPaymentAndCreateOrder);
router.post("/prime/create-order", authorize, paymentController.createPrimePaymentOrder);
router.post("/prime/verify", authorize, paymentController.verifyPrimePayment);

module.exports = router;
