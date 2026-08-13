
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
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
      },
    ],

    orderValue: { type: Number, required: true },

    paymentMethod: {
      type: String,
      enum: ["cod", "razorpay"],
      required: true,
    },

    razorpayOrderId: String, // For Razorpay orders

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: ["pending", "processing", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
    },

    statusHistory: [
      {
        status: {
          type: String,
          enum: ["pending", "processing", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled"],
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
