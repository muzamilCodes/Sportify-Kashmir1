
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
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
