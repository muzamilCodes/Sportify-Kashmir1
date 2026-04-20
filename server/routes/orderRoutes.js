const express = require("express");
const controller = require("../controllers/orderController");
const authorize = require("../middlewares/authorize");
const optionalAuthorize = require("../middlewares/optionalAuthorize");

const router = express.Router();

// ✅ Order creation routes
router.post("/", optionalAuthorize, controller.createOrderFromCheckout);
router.post("/verify", authorize, controller.verifyAndCreateOrder);
router.post("/create-cod", authorize, controller.createCODOrder);
router.post("/create", authorize, controller.createOrder);
router.post("/createCartOrder", authorize, controller.createCartorder);

// ✅ Order status update routes
router.put("/processing/:orderId", authorize, (req, res) => controller.updateOrderStatus(req, res, "processing"));
router.put("/shipped/:orderId", authorize, (req, res) => controller.updateOrderStatus(req, res, "shipped"));
router.put("/delivered/:orderId", authorize, (req, res) => controller.updateOrderStatus(req, res, "delivered"));
router.put("/cancelled/:orderId", authorize, (req, res) => controller.updateOrderStatus(req, res, "cancelled"));

// ✅ Order fetch routes
router.get("/user-orders", authorize, controller.getUserOrders);
router.get("/fetchAllOrders", authorize, controller.fetchAllOrders);
router.get("/fetchOrderById/:orderId", authorize, controller.fetchOrderById);

// ✅ Admin only - update order value (make sure this controller exists)
router.put("/update-value/:orderId", authorize, controller.updateOrderValue);

module.exports = router;