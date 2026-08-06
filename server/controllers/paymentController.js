const Razorpay = require("razorpay");
const crypto = require("crypto");
const { Payment } = require("../models/paymentModel");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const { resHandler } = require("../utilities/resHandler");

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
    console.log("=== CREATE PAYMENT ORDER ===");
    console.log("Request body:", req.body);
    console.log("User ID:", req.userId);
    
    const { amount, currency = "INR" } = req.body;
    
    // ✅ Validate amount
    if (!amount || amount <= 0) {
      console.log("❌ Invalid amount:", amount);
      return res.status(400).json({
        success: false,
        message: "Invalid amount. Please check your cart.",
      });
    }

    // ✅ Check if Razorpay is initialized
    if (!razorpay) {
      console.log("❌ Razorpay not initialized");
      return res.status(500).json({
        success: false,
        message: "Payment service not configured. Please contact support.",
      });
    }

    // ✅ Convert to paise (Razorpay expects amount in paise)
    const amountInPaise = Math.round(amount * 100);
    console.log(`Amount: ₹${amount} (${amountInPaise} paise)`);

    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    console.log("✅ Razorpay order created:", order.id);

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
      message: error.error?.description || error.message || "Failed to create payment order",
    });
  }
};

exports.verifyPaymentAndCreateOrder = async (req, res) => {
  try {
    console.log("=== VERIFY PAYMENT ===");
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      products,
      totalAmount,
      shippingAddressId,
    } = req.body;

    const userId = req.userId;

    // Verify signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.log("❌ Invalid signature");
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    console.log("✅ Signature verified");

    // Create order
    const order = await Order.create({
      userId: userId,
      shippingAddress: shippingAddressId,
      products: products,
      orderValue: totalAmount,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      orderStatus: "pending",
    });

    console.log("✅ Order created:", order._id);

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