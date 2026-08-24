const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientType: {
      type: String,
      enum: ["user", "admin", "all"],
      default: "user",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null when recipientType is 'all' or global admin
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "order_created",
        "order_status",
        "user_registered",
        "website_update",
        "promo",
        "alert",
        "system",
      ],
      default: "system",
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    link: {
      type: String,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // For 'all' broadcast notifications to track which users have read it
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // For 'all' broadcast notifications to track which users deleted/dismissed it
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast query of user's notifications and unread count
notificationSchema.index({ recipientType: 1, userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
