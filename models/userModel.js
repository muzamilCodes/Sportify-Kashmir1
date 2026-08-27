const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    profilePic: { type: String },

    mobile: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: "Mobile number must be 10 digits",
      },
    },

    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    otp: { type: String },
    otpExpiry: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    lastOtpSentAt: { type: Date },
    isVerified: { type: Boolean, default: false },

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    recentlyViewed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    isPrime: { type: Boolean, default: false },
    primePlan: { type: String, enum: ["trial", "annual", "quarterly", "none"], default: "none" },
    primeMemberId: { type: String },
    primeExpiresAt: { type: Date },
    primePaymentId: { type: String },

    // Saved User Payment Methods & Bank Details
    savedCards: [
      {
        cardHolder: { type: String, required: true },
        cardNumber: { type: String, required: true },
        rawLast4: { type: String },
        expiryDate: { type: String, required: true },
        cardType: { type: String, default: "Debit Card" },
        bankName: { type: String, default: "J&K Bank" },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    savedUpi: [
      {
        vpa: { type: String, required: true },
        name: { type: String },
        provider: { type: String, default: "UPI" },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    savedBankAccounts: [
      {
        accountHolder: { type: String, required: true },
        accountNumber: { type: String, required: true },
        ifscCode: { type: String, required: true },
        bankName: { type: String, required: true },
        branchName: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Real Sportify Wallet & Ledger
    walletBalance: { type: Number, default: 500 },
    walletTransactions: [
      {
        title: { type: String, required: true },
        type: { type: String, enum: ["credit", "debit"], default: "credit" },
        amount: { type: Number, required: true },
        date: { type: String },
        status: { type: String, default: "Completed" },
        paymentMethod: { type: String, default: "UPI / NetBanking" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = { User };