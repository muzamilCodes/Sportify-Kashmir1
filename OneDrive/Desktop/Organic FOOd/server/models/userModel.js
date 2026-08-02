const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    profilePic: { type: String },
    mobile: { type: String },
    isAdmin: { type: Boolean, default: false },
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    otp: { type: String },
    otpExpiry: { type: Date },

  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = { User };
