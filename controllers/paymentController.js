const Razorpay = require("razorpay");
const crypto = require("crypto");
const { Payment } = require("../models/paymentModel");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const { resHandler } = require("../utilities/resHandler");
const { notifyOrderEvent } = require("../utilities/orderNotificationService");
const { createOrderWithInventory } = require("../utilities/inventoryService");
const { getPricedCart } = require("../utilities/cartPricing");

// ✅ Initialize Razorpay with error handling
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log("✅ Razorpay initialized");
} catch (error) {
  console.error("❌ Razorpay initialization failed:", error.message);
}

exports.createPaymentOrder = async (req, res) => {
  try {
    const { currency = "INR" } = req.body;
    if (currency !== "INR") return res.status(400).json({ success: false, message: "Unsupported currency" });
    const { total } = await getPricedCart(req.userId);

    // ✅ Check if Razorpay is initialized
    if (!razorpay) {
      console.log("❌ Razorpay not initialized");
      return res.status(500).json({
        success: false,
        message: "Payment service not configured. Please contact support.",
      });
    }

    // ✅ Convert to paise (Razorpay expects amount in paise)
    const amountInPaise = Math.round(total * 100);

    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    });
  } catch (error) {
    console.error("❌ Payment order error:", error);
    console.error("Error details:", error.error);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};

exports.verifyPaymentAndCreateOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddressId,
    } = req.body;

    const userId = req.userId;

    // Verify signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }


    // Create order
    const { products, total } = await getPricedCart(userId);
    const paymentOrder = await razorpay.orders.fetch(razorpay_order_id);
    if (paymentOrder.amount !== Math.round(total * 100) || paymentOrder.currency !== "INR") {
      return res.status(400).json({ success: false, message: "Payment amount does not match the current cart" });
    }
    const order = await createOrderWithInventory(Order, {
      userId: userId,
      shippingAddress: shippingAddressId,
      products,
      orderValue: total,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      orderStatus: "pending",
      statusHistory: [
        {
          status: "pending",
          changedAt: new Date(),
          changedByRole: "system",
          note: "Order created",
        },
      ],
    });

    await notifyOrderEvent(order._id, { type: "created", status: "pending" });

    // Clear cart
    await Cart.findOneAndUpdate(
      { userId: userId },
      { $set: { products: [], cartValue: 0 } }
    );

    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("❌ Verify payment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
