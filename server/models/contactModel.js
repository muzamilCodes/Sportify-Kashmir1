const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { 
      type: String, 
      enum: ["unread", "read", "replied", "archived"], 
      default: "unread" 
    },
    repliedAt: { type: Date },
    replyMessage: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

// Add indexes for better performance
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ email: 1 });

const Contact = mongoose.model("Contact", contactSchema);

module.exports = { Contact };