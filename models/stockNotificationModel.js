const mongoose = require("mongoose");

const stockNotificationSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  email: { type: String, trim: true, lowercase: true, required: true },
  notifiedAt: { type: Date, default: null },
}, { timestamps: true });

stockNotificationSchema.index({ product: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("StockNotification", stockNotificationSchema);
