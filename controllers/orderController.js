const mongoose = require("mongoose");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const { Product } = require("../models/productModel");
const { User } = require("../models/userModel");
const { resHandler } = require("../utilities/resHandler");
const { notifyOrderEvent, normalizeOrderStatus } = require("../utilities/orderNotificationService");
const { createOrderWithInventory, releaseOrderInventory } = require("../utilities/inventoryService");
const { getPricedCart } = require("../utilities/cartPricing");

async function markCouponUsed(code, userId) {
  if (!code) return;
  try {
    const cleanCode = String(code).trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });
    if (!coupon) return;

    coupon.usedCount = (coupon.usedCount || 0) + 1;

    // Track user usage
    if (userId) {
      const userUsageIndex = (coupon.usedBy || []).findIndex(
        (u) => u.user && u.user.toString() === userId.toString()
      );
      if (userUsageIndex >= 0) {
        coupon.usedBy[userUsageIndex].count += 1;
      } else {
        coupon.usedBy.push({ user: userId, count: 1 });
      }
    }

    // If single use or reached max usage limit, deactivate immediately
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      coupon.isActive = false;
    }

    await coupon.save();
  } catch (err) {
    console.error("[Coupon] Error marking coupon as used:", err);
  }
}

async function getActingUser(req) {
  if (!req.userId) return null;
  return User.findById(req.userId).select("username email mobile isAdmin");
}

function getStatusHistoryNote(status, actorRole) {
  if (status === "cancelled" && actorRole === "customer") {
    return "Order cancelled by customer";
  }
  if (status === "confirmed") return "Order confirmed by admin";
  if (status === "shipped") return "Order marked as shipped";
  if (status === "out_for_delivery") return "Order marked out for delivery";
  if (status === "delivered") return "Order marked as delivered";
  return "Order status updated";
}

exports.createOrder = async (req, res) => {
  // create Order for single product
  try {
    const userId = req.userId; // token // logged in user's userId
    const { productId } = req.query;
    const { addressId } = req.query;
    const { quantity } = req.body;
    let productsArr = [];
    let orderValue = 0;

    if (!quantity || quantity === "") {
      return resHandler(res, 400, "Qty Feild is necessary ");
    }

    if (!productId || !addressId || !userId) {
      return resHandler(res, 400, "Some query Params are missing!");
    }

    let user = await User.findById(userId);

    const product = await Product.findById(productId);

    const orderProduct = { productId, quantity };

    productsArr.push(orderProduct);

    orderValue = quantity * product.price; // value is not calculated in the right format

    if (user.addresses && user.addresses.includes(addressId) === false) {
      return resHandler(
        res,
        400,
        "This AddressId doesnot belong to logged in user!"
      );
    }

    const order = await createOrderWithInventory(Order, {
      userId: userId, // Already should be ObjectId from token
      shippingAddress: addressId,
      products: productsArr,
      orderValue: orderValue,
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

    if (order) {
      user.orders.push(order._id);
      await user.save();
      await notifyOrderEvent(order._id, { type: "created", status: "pending" });

      resHandler(res, 200, "Order created Succesfully!", order);
    }
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.createCartorder = async (req, res) => {
  try {
    const userId = req.userId;

    const { cartId, addressId } = req.query;


    if (!cartId || !addressId || !userId) {
      return resHandler(res, 400, "No params Found!");
    }

    let cart = await Cart.findById(cartId);

    let user = await User.findById(userId);

    if (!cart || cart.cartValue === 0) {
      return resHandler(res, 404, "Cart Empty!");
    }

    // Check if cart belongs to user
    if (cart.userId.toString() !== userId.toString()) {
      return resHandler(res, 400, "Cart does not belong to user!");
    }

    // Check if address belongs to user
    if (user.addresses && user.addresses.includes(addressId) === false) {
      return resHandler(res, 400, "This AddressId doesnot belong to logged in user!");
    }

    const products = cart.products;
    const orderValue = cart.cartValue;

    const createOrder = await createOrderWithInventory(Order, {
      userId: userId, // Already ObjectId from token
      shippingAddress: addressId,
      products,
      orderValue,
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

    if (createOrder) {
      user.orders.push(createOrder._id);
      cart.cartValue = 0
      cart.products = []
      await user.save();
      await cart.save();
      await notifyOrderEvent(createOrder._id, { type: "created", status: "pending" });
      resHandler(res, 201, "Order Created", createOrder);
    }
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.updateOrderStatus = async (req, res, orderStatus) => {
  try {
    const { orderId } = req.params;
    const normalizedStatus = normalizeOrderStatus(orderStatus);
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const actingUser = await getActingUser(req);
    const currentStatus = normalizeOrderStatus(order.orderStatus);

    if (normalizedStatus !== "cancelled" && !actingUser?.isAdmin) {
      return res.status(403).json({ success: false, message: "Admin access required to update order status" });
    }

    if (normalizedStatus === "cancelled" && !actingUser) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    if (normalizedStatus === "cancelled" && !actingUser.isAdmin && String(order.userId) !== String(req.userId)) {
      return res.status(403).json({ success: false, message: "You can only cancel your own orders" });
    }

    if (normalizedStatus === "cancelled" && !actingUser?.isAdmin) {
      const ownerId = order.userId ? order.userId.toString() : "";
      if (!ownerId || ownerId !== req.userId.toString()) {
        return res.status(403).json({ success: false, message: "You can only cancel your own order" });
      }
    }

    if (currentStatus === normalizedStatus) {
      return res.status(200).json({
        success: true,
        message: `Order is already ${normalizedStatus.replace(/_/g, " ")}`,
        order,
      });
    }

    // 🔒 Permanent Lock: Status of delivered and cancelled orders cannot be modified!
    if (currentStatus === "delivered") {
      return res.status(400).json({
        success: false,
        message: "This order is already delivered. Its status cannot be changed.",
      });
    }

    if (currentStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This order is already cancelled. Its status cannot be changed.",
      });
    }

    if (normalizedStatus === "cancelled") {
      await releaseOrderInventory(order);
    }

    order.orderStatus = normalizedStatus;
    order.statusHistory = Array.isArray(order.statusHistory) ? order.statusHistory : [];
    order.statusHistory.push({
      status: normalizedStatus,
      changedAt: new Date(),
      changedByRole: actingUser?.isAdmin ? "admin" : "customer",
      changedByUser: req.userId,
      note: getStatusHistoryNote(normalizedStatus, actingUser?.isAdmin ? "admin" : "customer"),
    });

    await order.save();

    await notifyOrderEvent(order._id, {
      type: normalizedStatus === "cancelled" ? "status" : "status",
      status: normalizedStatus,
    });

    return res.status(200).json({ success: true, message: `Order ${normalizedStatus}!`, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
// exports.updateOrderStatus = async (req, res, orderStatus) => {
//   try {
//     const { orderId } = req.params;

//     let order = await Order.findById(orderId);

//     if (!order) {
//       return resHandler(res, 404, "Order not Found!");
//     }

//     const oldStatus = order.orderStatus;
//     order.orderStatus = orderStatus;
//     await order.save();

//     // ✅ Send email notification to user
//     const userDetails = await getUserDetails(order);
//     if (userDetails.email) {
//       await sendOrderEmail(order, userDetails.email, userDetails.name, orderStatus);
//     }

//     return resHandler(res, 200, `Order ${orderStatus}!`, order);
//   } catch (error) {
//     console.error(error);
//     return resHandler(res, 500, "Server Error!");
//   }
// };
exports.fetchAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'username email mobile')
      .populate('shippingAddress', 'firstName lastName street city state pincode email mobile')
      .populate('products.productId', 'name price productImgUrls')
      .sort({ createdAt: -1 });

    if (orders.length > 0) {
      return resHandler(res, 200, `${orders.length} orders  Found!`, orders);
    } else {
      return resHandler(res, 200, "No orders found!", []);
    }
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.fetchOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('userId', 'username email mobile isAdmin')
      .populate('shippingAddress', 'firstName lastName street city state pincode email mobile')
      .populate('products.productId', 'name price productImgUrls');
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    const actingUser = await getActingUser(req);
    if (!actingUser?.isAdmin && String(order.userId?._id || order.userId) !== String(req.userId)) {
      return res.status(403).json({ success: false, message: "You can only view your own orders" });
    }
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error!" });
  }
};
exports.createOrderFromCheckout = async (req, res) => {
  try {
    const { paymentMethod, shippingAddress, cartId, guestAddress, customerDetails } = req.body;
    const userId = req.userId;

    let cart;
    let orderData = {
      paymentMethod,
      orderStatus: 'pending'
    };

    if (userId) {
      // Logged in user
      const user = await User.findById(userId);
      orderData.userId = userId;
      orderData.shippingAddress = shippingAddress;

      // Get user's cart
      cart = await Cart.findOne({ userId });
    } else {
      // Guest user - save customer details
      orderData.guestAddress = {
        fullName: guestAddress?.fullName || customerDetails?.name || "Guest User",
        mobileNumber: guestAddress?.mobileNumber || customerDetails?.phone || "",
        email: guestAddress?.email || customerDetails?.email || "",
        street: guestAddress?.street || "",
        city: guestAddress?.city || "",
        state: guestAddress?.state || "",
        postalCode: guestAddress?.postalCode || guestAddress?.pincode || "",
      };

      // Get guest cart by cartId
      cart = await Cart.findById(cartId);
    }

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    orderData.products = cart.products;
    orderData.orderValue = cart.cartValue;
    orderData.statusHistory = [
      {
        status: "pending",
        changedAt: new Date(),
        changedByRole: "system",
        note: "Order created",
      },
    ];

    if (paymentMethod === 'razorpay') {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: Math.round(cart.cartValue * 100),
        currency: 'INR',
        receipt: `order_${Date.now()}`,
      };

      const razorpayOrder = await razorpay.orders.create(options);
      orderData.razorpayOrderId = razorpayOrder.id;

      const order = await createOrderWithInventory(Order, orderData);
      if (userId) {
        await User.findByIdAndUpdate(userId, { $push: { orders: order._id } });
      }
      await notifyOrderEvent(order._id, { type: "created", status: "pending" });

      return res.status(200).json({
        success: true,
        message: "Order created successfully",
        data: {
          order: order,
          paymentOrder: razorpayOrder
        }
      });
    } else {
      const order = await createOrderWithInventory(Order, orderData);

      if (userId) {
        cart.products = [];
        cart.cartValue = 0;
        await cart.save();
        await User.findByIdAndUpdate(userId, { $push: { orders: order._id } });
      } else {
        await Cart.findByIdAndDelete(cartId);
      }

      await notifyOrderEvent(order._id, { type: "created", status: "pending" });

      return res.status(200).json({
        success: true,
        message: "Order placed successfully",
        data: { order }
      });
    }
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order"
    });
  }
};


//     const { paymentMethod, shippingAddress, cartId, guestAddress } = req.body;
//     const userId = req.userId; // from optionalAuthorize middleware

//     let cart;
//     let orderData = {
//       paymentMethod,
//       orderStatus: 'pending'
//     };

//     // Handle logged in user vs guest
//     if (userId) {
//       // Logged in user
//       orderData.userId = userId;
//       orderData.shippingAddress = shippingAddress;

//       // Get user's cart
//       cart = await Cart.findOne({ userId });
//     } else {
//       // Guest user
//       orderData.guestAddress = guestAddress;

//       // Get guest cart by cartId
//       cart = await Cart.findById(cartId);
//     }

//     if (!cart || cart.products.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Cart is empty"
//       });
//     }

//     orderData.products = cart.products;
//     orderData.orderValue = cart.cartValue;

//     // Handle payment
//     if (paymentMethod === 'razorpay') {
//       // For Razorpay, we'll create order but payment will be handled on frontend
//       const Razorpay = require('razorpay');
//       const razorpay = new Razorpay({
//         key_id: process.env.RAZORPAY_KEY_ID,
//         key_secret: process.env.RAZORPAY_KEY_SECRET,
//       });

//       const options = {
//         amount: Math.round(cart.cartValue * 100), // amount in paisa
//         currency: 'INR',
//         receipt: `order_${Date.now()}`,
//       };

//       const razorpayOrder = await razorpay.orders.create(options);

//       orderData.razorpayOrderId = razorpayOrder.id;

//       const order = await Order.create(orderData);

//       return res.status(200).json({
//         success: true,
//         message: "Order created successfully",
//         data: {
//           order: order,
//           paymentOrder: razorpayOrder
//         }
//       });
//     } else {
//       // Cash on Delivery
//       const order = await Order.create(orderData);

//       // Clear cart after successful order
//       if (userId) {
//         cart.products = [];
//         cart.cartValue = 0;
//         await cart.save();
//       } else {
//         // For guest, we might want to keep cart or clear it
//         await Cart.findByIdAndDelete(cartId);
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Order placed successfully",
//         data: {
//           order: order
//         }
//       });
//     }

//   } catch (error) {
//     console.error('Order creation error:', error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create order"
//     });
//   }
// };


// Add this function at the end of your orderController.js
exports.verifyAndCreateOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddressId,
      guestAddress,
    } = req.body;

    const userId = req.userId;
    const crypto = require("crypto");

    // Verify Razorpay signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const { products, total } = await getPricedCart(userId);
    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const paymentOrder = await razorpay.orders.fetch(razorpay_order_id);
    if (paymentOrder.amount !== Math.round(total * 100) || paymentOrder.currency !== "INR") {
      return res.status(400).json({ success: false, message: "Payment amount does not match the current cart" });
    }

    // Only server-derived cart data is persisted; the browser never controls prices or line items.
    let orderData = {
      products,
      orderValue: total,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      orderStatus: "pending",
      statusHistory: [
        {
          status: "pending",
          changedAt: new Date(),
          changedByRole: "system",
          note: "Order created",
        },
      ],
    };

    if (userId) {
      orderData.userId = userId;
      orderData.shippingAddress = shippingAddressId;
    } else if (guestAddress) {
      orderData.guestAddress = guestAddress;
    }

    if (req.body.couponCode) {
      orderData.couponCode = String(req.body.couponCode).trim().toUpperCase();
    }

    const order = await createOrderWithInventory(Order, orderData);

    // Burn/mark coupon as used
    if (req.body.couponCode) {
      await markCouponUsed(req.body.couponCode, userId);
    }

    await notifyOrderEvent(order._id, { type: "created", status: "pending" });

    // Clear cart
    if (userId) {
      await Cart.findOneAndUpdate(
        { userId: userId },
        { $set: { products: [], cartValue: 0 } }
      );

      await User.findByIdAndUpdate(userId, {
        $push: { orders: order._id },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Verify and create order error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get orders for logged in user only
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.find({ userId })
      .populate('userId', 'username email mobile isAdmin')
      .populate('shippingAddress', 'firstName lastName street city state pincode email mobile')
      .populate('products.productId', 'name price productImgUrls')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "User orders fetched",
      data: orders
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


exports.createCODOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { shippingAddress, couponCode, discountAmount } = req.body;
    const { products, total } = await getPricedCart(userId);

    const orderFinalValue = discountAmount ? Math.max(0, total - Number(discountAmount)) : total;

    const orderData = {
      userId: userId,
      shippingAddress: shippingAddress,
      products: products,
      orderValue: orderFinalValue,
      paymentMethod: "cod",
      paymentStatus: "pending",
      orderStatus: "pending",
      statusHistory: [
        {
          status: "pending",
          changedAt: new Date(),
          changedByRole: "system",
          note: "Order created",
        },
      ],
    };

    if (couponCode) {
      orderData.couponCode = String(couponCode).trim().toUpperCase();
      orderData.discount = Number(discountAmount || 0);
    }

    const order = await createOrderWithInventory(Order, orderData);
    await User.findByIdAndUpdate(userId, { $push: { orders: order._id } });

    // Mark and burn coupon so it cannot be reused ever
    if (couponCode) {
      await markCouponUsed(couponCode, userId);
    }

    // Clear cart
    await Cart.findOneAndUpdate(
      { userId: userId },
      { $set: { products: [], cartValue: 0 } }
    );

    await notifyOrderEvent(order._id, { type: "created", status: "pending" });

    return res.status(200).json({
      success: true,
      message: "COD Order placed successfully",
      data: order,
    });
  } catch (error) {
    console.error("COD Order error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Send email notification helper
async function sendOrderEmail(order, userEmail, userName, status) {
  try {
    const sendEmail = require("../utilities/emailService");

    const statusMessages = {
      processing: {
        subject: "🔄 Order Being Processed - Sportify Kashmir",
        title: "Your Order is Being Processed!",
        message: `Your order #${order._id.toString().slice(-8)} has been received and is now being processed. We'll notify you once it's shipped.`,
      },
      shipped: {
        subject: "🚚 Order Shipped - Sportify Kashmir",
        title: "Your Order Has Been Shipped!",
        message: `Great news! Your order #${order._id.toString().slice(-8)} has been shipped and is on its way to you.`,
      },
      delivered: {
        subject: "✅ Order Delivered - Sportify Kashmir",
        title: "Order Delivered Successfully!",
        message: `Your order #${order._id.toString().slice(-8)} has been delivered. We hope you enjoy your purchase!`,
      },
      cancelled: {
        subject: "❌ Order Cancelled - Sportify Kashmir",
        title: "Order Cancelled",
        message: `Your order #${order._id.toString().slice(-8)} has been cancelled. If this was a mistake, please contact support.`,
      },
    };

    const msg = statusMessages[status];
    if (!msg) return;

    const html = sendEmail.getOrderStatusTemplate(
      order,
      msg.title,
      msg.message,
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/orders/${order._id}`
    );

    await sendEmail(userEmail, msg.subject, html);
    console.log(`✅ Email sent to ${userEmail} for status: ${status}`);
  } catch (error) {
    console.error("sendOrderEmail error:", error.message);
  }
}

// Get user email and name
async function getUserDetails(order) {
  if (order.userId) {
    const user = await User.findById(order.userId);
    return { email: user?.email, name: user?.username, mobile: user?.mobile };
  } else if (order.guestAddress) {
    return {
      email: order.guestAddress.email,
      name: order.guestAddress.fullName,
      mobile: order.guestAddress.mobileNumber,
    };
  }
  return { email: null, name: null, mobile: null };
}

// Update order value (Admin only)
exports.updateOrderValue = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { newOrderValue } = req.body;

    if (!newOrderValue || newOrderValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order value",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const oldValue = order.orderValue;
    order.orderValue = newOrderValue;
    await order.save();

    // Send email to user about price change
    const userDetails = await getUserDetails(order);
    if (userDetails.email) {
      await sendOrderPriceUpdateEmail(order, userDetails.email, userDetails.name, oldValue, newOrderValue);
    }

    return res.status(200).json({
      success: true,
      message: "Order value updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Update order value error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function for price update email
async function sendOrderPriceUpdateEmail(order, userEmail, userName, oldValue, newValue) {
  try {
    const sendEmail = require("../utilities/emailService");

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #ea580c;">Order Price Updated</h2>
        <p>Dear ${userName || "Customer"},</p>
        <p>The total amount for your order #${order._id.toString().slice(-8)} has been updated.</p>
        <p><strong>Old Amount:</strong> ₹${oldValue}</p>
        <p><strong>New Amount:</strong> ₹${newValue}</p>
        <p>Please check your order details for more information.</p>
        <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/orders/${order._id}" style="display: inline-block; background: linear-gradient(135deg, #ea580c, #dc2626); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order</a>
      </div>
    `;

    await sendEmail(userEmail, `Order Price Updated - #${order._id.toString().slice(-8)}`, html);
  } catch (error) {
    console.error("Price update email error:", error);
  }
}

function maskEmail(email) {
  if (!email || !email.includes("@")) return email || "";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}

/**
 * 4-Digit Delivery Rejection OTP System (Flipkart Style)
 * 1. Generate & send 4-digit OTP to customer's registered email
 */
exports.sendDeliveryRejectionOtp = async (req, res) => {
  try {
    const sendEmail = require("../utilities/emailService");
    const crypto = require("crypto");
    const { orderId } = req.params;
    const { reason } = req.body || {};

    const order = await Order.findById(orderId)
      .populate("userId", "username email mobile")
      .populate("shippingAddress", "firstName lastName email mobile");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const currentStatus = normalizeOrderStatus(order.orderStatus);
    if (currentStatus === "delivered") {
      return res.status(400).json({ success: false, message: "Cannot reject an order that has already been delivered" });
    }
    if (currentStatus === "cancelled" && order.rejectionDetails?.isRejected) {
      return res.status(400).json({ success: false, message: "Order is already rejected" });
    }

    // Generate cryptographically secure 4-digit numeric OTP (1000 - 9999)
    const rejectionCode = crypto.randomInt(1000, 10000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    order.rejectionOtp = {
      code: rejectionCode,
      expiresAt: expiresAt,
      attempts: 0,
      isUsed: false,
      requestedAt: new Date(),
      reason: reason || "Customer declined delivery at doorstep",
    };

    await order.save();

    // Determine recipient details
    const customerEmail =
      order.shippingAddress?.email ||
      order.guestAddress?.email ||
      order.userId?.email;

    const customerName =
      order.shippingAddress?.firstName ||
      order.guestAddress?.fullName ||
      order.userId?.username ||
      "Customer";

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: "No customer email found for this order to send the rejection OTP",
      });
    }

    const emailHtml = sendEmail.getDeliveryRejectionOtpTemplate(
      rejectionCode,
      order,
      customerName,
      order.rejectionOtp.reason
    );

    const emailSent = await sendEmail(
      customerEmail,
      `🔐 Delivery Rejection OTP (${rejectionCode}) for Order #${order._id.toString().slice(-8)}`,
      emailHtml,
      { priority: "high" }
    );

    return res.status(200).json({
      success: true,
      message: "4-digit rejection OTP sent successfully to customer's email",
      expiresAt: expiresAt,
      maskedEmail: maskEmail(customerEmail),
      emailDelivered: Boolean(emailSent),
    });
  } catch (error) {
    console.error("sendDeliveryRejectionOtp error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to send rejection OTP" });
  }
};

/**
 * 4-Digit Delivery Rejection OTP System (Flipkart Style)
 * 2. Verify 4-digit OTP provided by customer to delivery partner
 */
exports.verifyDeliveryRejectionOtp = async (req, res) => {
  try {
    const sendEmail = require("../utilities/emailService");
    const { orderId } = req.params;
    const { otp, rejectionReason } = req.body || {};

    if (!otp || String(otp).trim().length !== 4) {
      return res.status(400).json({ success: false, message: "Please provide a valid 4-digit OTP" });
    }

    const order = await Order.findById(orderId)
      .populate("userId", "username email mobile")
      .populate("shippingAddress", "firstName lastName email mobile");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const currentStatus = normalizeOrderStatus(order.orderStatus);
    if (currentStatus === "delivered") {
      return res.status(400).json({ success: false, message: "Cannot reject an order that has already been delivered" });
    }

    if (!order.rejectionOtp || !order.rejectionOtp.code) {
      return res.status(400).json({
        success: false,
        message: "No rejection OTP has been requested for this order. Please request an OTP first.",
      });
    }

    if (order.rejectionOtp.isUsed) {
      return res.status(400).json({
        success: false,
        message: "This rejection OTP has already been used. Please request a new OTP if needed.",
      });
    }

    // Check expiration (5 min)
    if (new Date() > new Date(order.rejectionOtp.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: "Rejection OTP has expired (5-minute limit). Please generate a new OTP.",
        expired: true,
      });
    }

    // Check attempt limit (max 3)
    if (order.rejectionOtp.attempts >= 3) {
      return res.status(400).json({
        success: false,
        message: "Maximum OTP attempts exceeded (3 attempts). Please generate a new OTP.",
        attemptsExceeded: true,
      });
    }

    // Compare OTP
    const cleanInputOtp = String(otp).trim();
    const cleanStoredOtp = String(order.rejectionOtp.code).trim();

    if (cleanInputOtp !== cleanStoredOtp) {
      order.rejectionOtp.attempts = (order.rejectionOtp.attempts || 0) + 1;
      await order.save();

      const remaining = Math.max(0, 3 - order.rejectionOtp.attempts);
      return res.status(400).json({
        success: false,
        message:
          remaining > 0
            ? `Invalid 4-digit OTP. ${remaining} attempt(s) remaining.`
            : "Invalid OTP. Maximum attempts exceeded. Please generate a new OTP.",
        remainingAttempts: remaining,
        attemptsExceeded: remaining === 0,
      });
    }

    // OTP is valid! Mark as used and cancel/reject the order
    order.rejectionOtp.isUsed = true;
    order.orderStatus = "cancelled";

    const finalReason =
      rejectionReason ||
      order.rejectionOtp.reason ||
      "Customer refused delivery at doorstep";

    order.rejectionDetails = {
      isRejected: true,
      rejectedAt: new Date(),
      reason: finalReason,
      rejectedWithOtp: true,
      rejectedByRole: "delivery_partner",
    };

    order.statusHistory = Array.isArray(order.statusHistory) ? order.statusHistory : [];
    order.statusHistory.push({
      status: "cancelled",
      changedAt: new Date(),
      changedByRole: "admin",
      changedByUser: req.userId,
      note: `Rejected at Delivery: ${finalReason} (Verified with 4-digit Customer OTP)`,
    });

    // Release reserved inventory
    await releaseOrderInventory(order);
    await order.save();

    // Send Rejection Confirmation Email to customer
    const customerEmail =
      order.shippingAddress?.email ||
      order.guestAddress?.email ||
      order.userId?.email;

    const customerName =
      order.shippingAddress?.firstName ||
      order.guestAddress?.fullName ||
      order.userId?.username ||
      "Customer";

    if (customerEmail) {
      try {
        const confirmHtml = sendEmail.getDeliveryRejectionConfirmedTemplate(
          order,
          customerName,
          finalReason
        );
        await sendEmail(
          customerEmail,
          `❌ Order #${order._id.toString().slice(-8)} Marked as Rejected at Delivery`,
          confirmHtml
        );
      } catch (e) {
        console.warn("Failed to send rejection confirmation email:", e.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order successfully rejected and cancelled with verified 4-digit OTP",
      order,
    });
  } catch (error) {
    console.error("verifyDeliveryRejectionOtp error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to verify rejection OTP" });
  }
};

// ✅ Delete or Permanently Remove Order (User or Admin)
exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const actingUser = await User.findById(req.userId).select("isAdmin");
    if (!actingUser) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Ensure customer can only delete their own order (or admin can delete any)
    if (!actingUser.isAdmin && order.userId && String(order.userId) !== String(req.userId)) {
      return res.status(403).json({ success: false, message: "You can only remove your own orders" });
    }

    // If order was pending, confirmed, or processing, release inventory
    if (["pending", "confirmed", "processing"].includes(order.orderStatus)) {
      try {
        await releaseOrderInventory(order);
      } catch (err) {
        console.warn("Failed to release inventory during order deletion:", err);
      }
    }

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    // Pull order from user document
    if (order.userId) {
      await User.findByIdAndUpdate(order.userId, {
        $pull: { orders: order._id },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order removed successfully",
    });
  } catch (error) {
    console.error("deleteOrder error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to remove order" });
  }
};

// ===================== GET ORDER INVOICE =====================
exports.getOrderInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const order = await Order.findById(id)
      .populate("userId", "username email mobile")
      .populate("shippingAddress")
      .populate("products.productId", "name price productImgUrls sku");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const actingUser = await User.findById(userId).select("isAdmin");
    const isOwner = order.userId && order.userId._id.toString() === userId.toString();
    if (!actingUser?.isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: "Unauthorized to view this invoice" });
    }

    const orderNumber = order.orderId || order._id.toString().slice(-8);
    const invoiceNumber = order.invoiceNumber || `INV-${new Date(order.createdAt).getFullYear()}-${orderNumber}`;

    const items = (order.products || []).map((p) => {
      const unitPrice = p.price || p.productId?.price || 0;
      const total = unitPrice * p.quantity;
      return {
        productId: p.productId?._id,
        name: p.productId?.name || "Sports Equipment",
        sku: p.productId?.sku || p.size || "SK-PRO",
        unitPrice,
        quantity: p.quantity,
        total,
      };
    });

    const subtotal = order.subtotal || items.reduce((acc, item) => acc + item.total, 0);
    const discount = order.discount || 0;
    const shipping = order.shippingCharge || 0;
    const tax = order.tax || 0;
    const grandTotal = order.totalAmount || order.orderValue || subtotal - discount + shipping + tax;

    const invoiceData = {
      invoiceNumber,
      orderNumber,
      orderDate: order.createdAt,
      paymentMethod: order.paymentMethod?.toUpperCase() || "COD",
      paymentStatus: order.paymentStatus?.toUpperCase() || "PENDING",
      orderStatus: order.orderStatus?.toUpperCase() || "CONFIRMED",
      customer: {
        name: order.shippingAddress?.firstName
          ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ""}`.trim()
          : order.guestAddress?.fullName || order.userId?.username || "Customer",
        email: order.shippingAddress?.email || order.guestAddress?.email || order.userId?.email || "",
        mobile: order.shippingAddress?.mobile || order.guestAddress?.mobileNumber || order.userId?.mobile || "",
        address: order.shippingAddress
          ? `${order.shippingAddress.addressLine1 || ""}, ${order.shippingAddress.city || ""}, ${order.shippingAddress.state || "J&K"} - ${order.shippingAddress.pincode || ""}`
          : order.guestAddress
          ? `${order.guestAddress.street || ""}, ${order.guestAddress.city || ""}, ${order.guestAddress.state || "J&K"} - ${order.guestAddress.postalCode || ""}`
          : "Delivery Address Provided",
      },
      seller: {
        name: "Sportify Kashmir",
        address: "Handwara, Qalamabad, Kashmir 193221",
        contact: "+91 9682645127 | sportify68@gmail.com",
        gst: "GSTIN-01SPORTIFYKMR",
      },
      items,
      financials: {
        subtotal,
        discount,
        couponCode: order.couponCode || "",
        shipping,
        tax,
        grandTotal,
      },
    };

    return res.status(200).json({
      success: true,
      data: invoiceData,
    });
  } catch (error) {
    console.error("getOrderInvoice error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

