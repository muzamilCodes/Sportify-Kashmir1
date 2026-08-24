const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["Percentage", "Fixed Amount"],
      default: "Percentage",
    },
    discountValue: {
      type: Number,
      required: true,
    },
    maxDiscountAmount: {
      type: Number,
      default: 0, // 0 = no limit cap
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: 0, // 0 = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
    },
    usedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        count: { type: Number, default: 1 },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1, isActive: 1 });

module.exports = mongoose.model("Coupon", couponSchema);
