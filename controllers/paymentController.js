const Razorpay = require("razorpay");
const crypto = require("crypto");
const { Payment } = require("../models/paymentModel");
const { User } = require("../models/userModel");
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

exports.createPrimePaymentOrder = async (req, res) => {
  try {
    const { plan = "trial" } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found. Please log in." });
    }

    if (plan === "trial") {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      const memberId = user.primeMemberId || "SK-" + Math.floor(100000 + Math.random() * 900000);

      user.isPrime = true;
      user.primePlan = "trial";
      user.primeMemberId = memberId;
      user.primeExpiresAt = expiry;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "30-Day VIP Free Trial activated successfully",
        data: {
          isActive: true,
          plan: "trial",
          planName: "30-Day VIP Free Trial",
          memberId,
          memberName: user.username,
          startDate: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
          validUntil: expiry.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
          savingsTotal: 450,
          freeKnockingsAvailable: 1,
        },
      });
    }

    const priceMap = {
      annual: 499,
      quarterly: 199,
    };
    const amount = priceMap[plan] || 499;
    const amountInPaise = amount * 100;

    let razorpayOrderId = null;
    if (razorpay) {
      try {
        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: `prime_${userId.toString().slice(-6)}_${Date.now()}`,
          notes: {
            userId: userId.toString(),
            plan,
            type: "prime_subscription",
          },
        });
        razorpayOrderId = order.id;
      } catch (err) {
        console.warn("Razorpay Prime order creation:", err.message);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        plan,
        amount,
        currency: "INR",
        orderId: razorpayOrderId || `PRIME_ORD_${Date.now()}`,
        razorpayKey: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("❌ Prime payment order error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPrimePayment = async (req, res) => {
  try {
    const {
      plan = "annual",
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      paymentMethod = "razorpay",
      upiRefId,
    } = req.body;

    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (razorpay_signature && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_SECRET !== "your_razorpay_key_secret_here") {
      const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const generatedSignature = hmac.digest("hex");
      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Invalid payment signature" });
      }
    }

    const today = new Date();
    const expiry = new Date();
    if (plan === "annual") {
      expiry.setFullYear(today.getFullYear() + 1);
    } else {
      expiry.setMonth(today.getMonth() + 3);
    }

    const memberId = user.primeMemberId || "SK-" + Math.floor(100000 + Math.random() * 900000);
    const paymentId = razorpay_payment_id || upiRefId || `PAY_${Date.now()}`;

    user.isPrime = true;
    user.primePlan = plan;
    user.primeMemberId = memberId;
    user.primeExpiresAt = expiry;
    user.primePaymentId = paymentId;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Sportify Prime Kashmir VIP ${plan === "annual" ? "Annual Pass" : "Quarterly Pass"} activated!`,
      data: {
        isActive: true,
        plan,
        planName: plan === "annual" ? "Annual VIP Master Pass" : "Quarterly VIP Pass",
        memberId,
        memberName: user.username,
        startDate: today.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
        validUntil: expiry.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
        savingsTotal: plan === "annual" ? 1850 : 650,
        freeKnockingsAvailable: plan === "annual" ? 2 : 1,
        paymentId,
      },
    });
  } catch (error) {
    console.error("❌ Verify Prime payment error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
