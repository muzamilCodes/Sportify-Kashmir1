const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true },
    

    products: [
      {
          productId: { type: mongoose.Schema.Types.ObjectId,ref: "Product", required: true,},
          quantity: { type: Number,required: true, min: 1, },
      }
     
    ],

    orderValue: { type: Number, required: true,  min: 0,   },

    paymentStatus: {type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending", },

    orderStatus: {type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled"],default: "pending", },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = { Order };
