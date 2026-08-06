const mongoose = require("mongoose");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const { Product } = require("../models/productModel");
const { User } = require("../models/userModel");
const { resHandler } = require("../utilities/resHandler");

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

    const order = await Order.create({
      userId: userId, // Already should be ObjectId from token
      shippingAddress: addressId,
      products: productsArr,
      orderValue: orderValue,
    });

    if (order) {
      user.orders.push(order._id);
      await user.save();

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

    const { cartId , addressId } = req.query;     


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

    const createOrder = await Order.create({
      userId: userId, // Already ObjectId from token
      shippingAddress: addressId,
      products,
      orderValue,
    });

    if (createOrder) {
      user.orders.push(createOrder._id);
      cart.cartValue = 0
      cart.products = []
      await user.save();
      await cart.save();
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
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    order.orderStatus = orderStatus;
    await order.save();
    // ... email sending code (ignore error for now)
    return res.status(200).json({ success: true, message: `Order ${orderStatus}!`, order });
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
      .populate('products.productId', 'name price productImgUrls');
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
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

      const order = await Order.create(orderData);

      return res.status(200).json({
        success: true,
        message: "Order created successfully",
        data: {
          order: order,
          paymentOrder: razorpayOrder
        }
      });
    } else {
      const order = await Order.create(orderData);

      if (userId) {
        cart.products = [];
        cart.cartValue = 0;
        await cart.save();
      } else {
        await Cart.findByIdAndDelete(cartId);
      }

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
      products,
      totalAmount,
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

    // Create order
    let orderData = {
      products: products,
      orderValue: totalAmount,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      orderStatus: "pending",
    };

    if (userId) {
      orderData.userId = userId;
      orderData.shippingAddress = shippingAddressId;
    } else if (guestAddress) {
      orderData.guestAddress = guestAddress;
    }

    const order = await Order.create(orderData);

    // Clear cart
    if (userId) {
      const Cart = require("../models/cartModel");
      await Cart.findOneAndUpdate(
        { userId: userId },
        { $set: { products: [], cartValue: 0 } }
      );
      
      const { User } = require("../models/userModel");
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
    const { shippingAddress, products, totalAmount, paymentMethod } = req.body;

    console.log("Creating COD order with totalAmount:", totalAmount);

    const orderData = {
      userId: userId,
      shippingAddress: shippingAddress,
      products: products,
      orderValue: totalAmount, // ✅ Make sure this is set
      paymentMethod: "cod",
      paymentStatus: "pending",
      orderStatus: "pending",
    };

    const order = await Order.create(orderData);
    console.log("Order created with value:", order.orderValue);

    // Clear cart
    await Cart.findOneAndUpdate(
      { userId: userId },
      { $set: { products: [], cartValue: 0 } }
    );

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
    const nodemailer = require("nodemailer");
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const statusMessages = {
      processing: {
        subject: "🔄 Order Being Processed - Sportify Kashmir",
        title: "Your Order is Being Processed!",
        message: `Your order #${order._id.toString().slice(-8)} has been received and is now being processed. We'll notify you once it's shipped.`,
        button: "Track Order",
      },
      shipped: {
        subject: "🚚 Order Shipped - Sportify Kashmir",
        title: "Your Order Has Been Shipped!",
        message: `Great news! Your order #${order._id.toString().slice(-8)} has been shipped and is on its way to you.`,
        button: "Track Order",
      },
      delivered: {
        subject: "✅ Order Delivered - Sportify Kashmir",
        title: "Order Delivered Successfully!",
        message: `Your order #${order._id.toString().slice(-8)} has been delivered. We hope you enjoy your purchase!`,
        button: "View Order",
      },
      cancelled: {
        subject: "❌ Order Cancelled - Sportify Kashmir",
        title: "Order Cancelled",
        message: `Your order #${order._id.toString().slice(-8)} has been cancelled. If this was a mistake, please contact support.`,
        button: "Contact Support",
      },
    };

    const msg = statusMessages[status];
    if (!msg) return;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #f97316;">Sportify Kashmir</h1>
        </div>
        <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <h2 style="color: #1f2937;">Hello ${userName || "Customer"},</h2>
          <h3 style="color: ${msg.color};">${msg.title}</h3>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">${msg.message}</p>
          <div style="margin: 20px 0; padding: 15px; background-color: #fff; border-radius: 8px; border: 1px solid #e5e7eb;">
            <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order._id.toString().slice(-8)}</p>
            <p style="margin: 5px 0;"><strong>Order Status:</strong> ${status.toUpperCase()}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${order.orderValue}</p>
          </div>
          <a href="${process.env.FRONTEND_URL}/orders/${order._id}" style="display: inline-block; background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">${msg.button}</a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">Thank you for shopping with Sportify Kashmir!</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_USERNAME,
      to: userEmail,
      subject: msg.subject,
      html: html,
    });
    
    console.log(`✅ Email sent to ${userEmail} for status: ${status}`);
  } catch (error) {
    console.error("Email error:", error);
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
      mobile: order.guestAddress.mobileNumber 
    };
  }
  return { email: null, name: null, mobile: null };
}


// Cancel order by user
// Update order value (Admin only)
exports.updateOrderValue = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { newOrderValue } = req.body;

    if (!newOrderValue || newOrderValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order value"
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const oldValue = order.orderValue;
    order.orderValue = newOrderValue;
    await order.save();

    // Optional: Send email to user about price change
    const userDetails = await getUserDetails(order);
    if (userDetails.email) {
      await sendOrderPriceUpdateEmail(order, userDetails.email, userDetails.name, oldValue, newOrderValue);
    }

    return res.status(200).json({
      success: true,
      message: "Order value updated successfully",
      data: order
    });
  } catch (error) {
    console.error("Update order value error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function for price update email
async function sendOrderPriceUpdateEmail(order, userEmail, userName, oldValue, newValue) {
  try {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #f97316;">Order Price Updated</h2>
        <p>Dear ${userName || "Customer"},</p>
        <p>The total amount for your order #${order._id.toString().slice(-8)} has been updated.</p>
        <p><strong>Old Amount:</strong> ₹${oldValue}</p>
        <p><strong>New Amount:</strong> ₹${newValue}</p>
        <p>Please check your order details for more information.</p>
        <a href="${process.env.FRONTEND_URL}/orders/${order._id}" style="display: inline-block; background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order</a>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_USERNAME,
      to: userEmail,
      subject: `Order Price Updated - #${order._id.toString().slice(-8)}`,
      html: html,
    });
  } catch (error) {
    console.error("Price update email error:", error);
  }
}