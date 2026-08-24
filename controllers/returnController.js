const Return = require("../models/returnModel");
const Order = require("../models/orderModel");
const { Product } = require("../models/productModel");
const { createNotification } = require("../utilities/notificationService");

// 1. Customer: Submit Return / Replacement Request
exports.requestReturn = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId, productId, type, reason, description, images, quantity = 1 } = req.body;

    if (!orderId || !productId || !reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Order ID, product, and return reason are required",
      });
    }

    const order = await Order.findOne({ _id: orderId, userId }).populate("products.productId");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found or unauthorized" });
    }

    const orderItem = order.products.find(
      (p) => (p.productId?._id || p.productId)?.toString() === productId.toString()
    );

    if (!orderItem) {
      return res.status(400).json({ success: false, message: "Selected product is not part of this order" });
    }

    const productName = orderItem.productId?.name || "Sports Product";
    const productPrice = Number(orderItem.productId?.price || order.orderValue || 0);

    const newReturn = await Return.create({
      orderId: order._id,
      orderNumber: order.orderId || order._id.toString().slice(-8),
      userId,
      productId,
      productName,
      productPrice,
      quantity: Number(quantity || 1),
      type: type === "replacement" ? "replacement" : "return",
      reason: String(reason).trim(),
      description: description ? String(description).trim() : "",
      images: Array.isArray(images) ? images : [],
      status: "requested",
      refundAmount: productPrice * Number(quantity || 1),
    });

    // In-App Notification for Admin
    await createNotification({
      recipientType: "admin",
      title: `🔄 New ${newReturn.type === "replacement" ? "Replacement" : "Return"} Request (#${newReturn.orderNumber})`,
      message: `${newReturn.type === "replacement" ? "Replacement" : "Return"} requested for ${productName}. Reason: ${newReturn.reason}`,
      type: "alert",
      link: "/admin/refunds",
      data: { returnId: newReturn._id, orderId: order._id },
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: `${newReturn.type === "replacement" ? "Replacement" : "Return"} request submitted successfully. Our team will review it within 24 hours.`,
      data: newReturn,
    });
  } catch (error) {
    console.error("Request return error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Customer: Get My Return Requests
exports.getMyReturns = async (req, res) => {
  try {
    const returns = await Return.find({ userId: req.userId })
      .populate("productId", "name productImgUrls price")
      .populate("orderId", "orderId orderValue createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: returns,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Admin: Get All Returns
exports.getAdminReturns = async (req, res) => {
  try {
    const { status, page = 1, limit = 30 } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Return.countDocuments(query);
    const returns = await Return.find(query)
      .populate("userId", "username email mobile profilePic")
      .populate("productId", "name productImgUrls price")
      .populate("orderId", "orderId orderValue paymentMethod paymentStatus")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    return res.status(200).json({
      success: true,
      data: returns,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Admin: Update Return Status (Approve, Reject, Refunded, Replaced)
exports.updateReturnStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote, refundAmount } = req.body;

    const returnDoc = await Return.findById(id).populate("userId", "username email");
    if (!returnDoc) {
      return res.status(404).json({ success: false, message: "Return request not found" });
    }

    if (status) returnDoc.status = status;
    if (adminNote !== undefined) returnDoc.adminNote = String(adminNote).trim();
    if (refundAmount !== undefined) returnDoc.refundAmount = Number(refundAmount);
    returnDoc.processedAt = new Date();

    await returnDoc.save();

    // Notify Customer in-app
    if (returnDoc.userId) {
      const statusTitle =
        status === "approved"
          ? "✅ Return Request Approved"
          : status === "rejected"
          ? "❌ Return Request Rejected"
          : status === "refunded"
          ? "💳 Refund Processed"
          : status === "replaced"
          ? "📦 Replacement Dispatched"
          : `Return Status: ${status}`;

      await createNotification({
        recipientType: "user",
        userId: returnDoc.userId._id || returnDoc.userId,
        title: statusTitle,
        message: `Your ${returnDoc.type} for order #${returnDoc.orderNumber} is now: ${status}. ${adminNote ? "Note: " + adminNote : ""}`,
        type: "order_status",
        link: `/orders/${returnDoc.orderId}`,
        data: { orderId: returnDoc.orderId, returnId: returnDoc._id, status },
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: `Return request marked as ${status}`,
      data: returnDoc,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
