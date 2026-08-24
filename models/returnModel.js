const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      default: "",
    },
    productPrice: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    type: {
      type: String,
      enum: ["return", "replacement"],
      default: "return",
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["requested", "approved", "rejected", "picked_up", "received", "refunded", "replaced"],
      default: "requested",
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    adminNote: {
      type: String,
      default: "",
      trim: true,
    },
    processedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

returnSchema.index({ userId: 1, createdAt: -1 });
returnSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Return", returnSchema);
