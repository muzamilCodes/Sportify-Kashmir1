const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: "Sportify Kashmir",
    },
    siteEmail: {
      type: String,
      default: "sportify68@gmail.com",
    },
    sitePhone: {
      type: String,
      default: "+91 9682645127",
    },
    siteAddress: {
      type: String,
      default: "Handwara, Qalamabad",
    },
    currency: {
      type: String,
      default: "INR",
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },
    freeShippingThreshold: {
      type: Number,
      default: 999,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
