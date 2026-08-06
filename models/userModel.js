const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    profilePic: { type: String },

    // 🔥 FIXED MOBILE FIELD
    mobile: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: "Mobile number must be 10 digits"
      }
    },

    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    otp: { type: String },
    otpExpiry: { type: Date },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = { User };