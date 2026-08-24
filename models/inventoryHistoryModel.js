const mongoose = require("mongoose");

const inventoryHistorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    productName: {
      type: String,
      trim: true,
    },
    variantSku: {
      type: String,
      trim: true,
    },
    transactionType: {
      type: String,
      enum: ["purchase", "sale", "return", "manual_adjustment", "restock", "cancellation"],
      required: true,
      index: true,
    },
    quantityChanged: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: "",
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    performedByName: {
      type: String,
      default: "System",
    },
  },
  { timestamps: true }
);

inventoryHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model("InventoryHistory", inventoryHistorySchema);
