const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    products: [
     
       {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
          quantity: { type: Number, required: true, min: 1 },
      },
     
    ],

    cartValue: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    isCouponApplied: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);

module.exports = { Cart };
