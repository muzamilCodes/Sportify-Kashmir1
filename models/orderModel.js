const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, trim: true }, // e.g. SK-994812
    invoiceNumber: { type: String, trim: true }, // e.g. INV-2026-994812
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional for guest orders
    shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address" }, // For logged-in users
    guestAddress: {
      fullName: String,
      mobileNumber: String,
      email: String,
      street: String,
      city: String,
      state: String,
      postalCode: String,
    }, // For guest users

    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        size: { type: String, trim: true },
        weight: { type: String, trim: true },
        color: { type: String, trim: true },
        price: { type: Number },
      },
    ],

    // Financial Data Fields
    orderValue: { type: Number, required: true }, // Preserved for backwards compatibility
    subtotal: { type: Number },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: "", trim: true },
    shippingCharge: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number },

    paymentMethod: {
      type: String,
      enum: ["cod", "razorpay", "stripe", "upi"],
      required: true,
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
    transactionId: String,

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: ["pending", "processing", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled", "rejected"],
      default: "pending",
    },

    refundStatus: {
      type: String,
      enum: ["none", "requested", "processing", "refunded", "failed"],
      default: "none",
    },
    refundAmount: { type: Number, default: 0 },

    inventoryReserved: { type: Boolean, default: false },
    inventoryReleased: { type: Boolean, default: false },

    statusHistory: [
      {
        status: {
          type: String,
          enum: ["pending", "processing", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled", "rejected"],
          required: true,
        },
        changedAt: { type: Date, default: Date.now },
        changedByRole: { type: String, enum: ["system", "admin", "customer"], default: "system" },
        changedByUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        note: { type: String, default: "" },
      },
    ],

    notificationLog: [
      {
        eventKey: { type: String, required: true },
        type: { type: String, enum: ["created", "status"], default: "status" },
        status: { type: String, required: true },
        emailSent: { type: Boolean, default: false },
        whatsappSent: { type: Boolean, default: false },
        sentAt: { type: Date },
        error: { type: String, default: "" },
      },
    ],

    // 4-Digit Delivery Rejection OTP System (Flipkart Style)
    rejectionOtp: {
      code: { type: String },
      expiresAt: { type: Date },
      attempts: { type: Number, default: 0 },
      isUsed: { type: Boolean, default: false },
      requestedAt: { type: Date },
      reason: { type: String, default: "" },
    },

    rejectionDetails: {
      isRejected: { type: Boolean, default: false },
      rejectedAt: { type: Date },
      reason: { type: String, default: "" },
      rejectedWithOtp: { type: Boolean, default: false },
      rejectedByRole: { type: String, default: "delivery_partner" },
    },
  },
  { timestamps: true }
);

// Indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ razorpayOrderId: 1 });

module.exports = mongoose.model("Order", orderSchema);
