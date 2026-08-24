const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    attachments: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["unread", "read", "replied", "resolved", "closed", "archived"],
      default: "unread",
    },
    repliedAt: { type: Date },
    replyMessage: { type: String },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ email: 1 });

const Contact = mongoose.model("Contact", contactSchema);

module.exports = { Contact };