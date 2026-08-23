const express = require("express");
const controller = require("../controllers/orderController");
const authorize = require("../middlewares/authorize");
const admin = require("../middlewares/admin");
const optionalAuthorize = require("../middlewares/optionalAuthorize");

const router = express.Router();

// ✅ Order creation routes
router.post("/", optionalAuthorize, controller.createOrderFromCheckout);
router.post("/verify", authorize, controller.verifyAndCreateOrder);
router.post("/create-cod", authorize, controller.createCODOrder);
router.post("/create", authorize, controller.createOrder);
router.post("/createCartOrder", authorize, controller.createCartorder);

// ✅ Order status update routes
router.put("/processing/:orderId", admin, (req, res) => controller.updateOrderStatus(req, res, "confirmed"));
router.put("/confirmed/:orderId", admin, (req, res) => controller.updateOrderStatus(req, res, "confirmed"));
router.put("/shipped/:orderId", admin, (req, res) => controller.updateOrderStatus(req, res, "shipped"));
router.put("/out_for_delivery/:orderId", admin, (req, res) => controller.updateOrderStatus(req, res, "out_for_delivery"));
router.put("/delivered/:orderId", admin, (req, res) => controller.updateOrderStatus(req, res, "delivered"));
router.put("/cancelled/:orderId", authorize, (req, res) => controller.updateOrderStatus(req, res, "cancelled"));

// ✅ Delivery Rejection 4-digit OTP System (Flipkart style)
router.post("/delivery-rejection/send-otp/:orderId", authorize, controller.sendDeliveryRejectionOtp);
router.post("/delivery-rejection/verify-otp/:orderId", authorize, controller.verifyDeliveryRejectionOtp);

// ✅ Order fetch routes
router.get("/user-orders", authorize, controller.getUserOrders);
router.get("/fetchAllOrders", admin, controller.fetchAllOrders);
router.get("/fetchOrderById/:orderId", authorize, controller.fetchOrderById);

// ✅ Order delete / remove routes (User & Admin)
router.delete("/delete/:orderId", authorize, controller.deleteOrder);
router.delete("/:orderId", authorize, controller.deleteOrder);

// ✅ Admin only - update order value (make sure this controller exists)
router.put("/update-value/:orderId", admin, controller.updateOrderValue);

module.exports = router;
