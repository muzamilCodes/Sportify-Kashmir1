const express = require("express");
const controller = require("../controllers/userController");
const authorize = require("../middlewares/authorize");
const admin = require("../middlewares/admin");
const upload = require("../middlewares/multer");
const router = express.Router();

// Debug endpoint to see all users
router.get("/debug/users", async (req, res) => {
  try {
    const { User } = require("../models/userModel");
    const users = await User.find({}, { email: 1, username: 1, mobile: 1, _id: 1 });
    res.json({ users, count: users.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint for env vars
router.get("/test-env", (req, res) => {
  res.json({
    EMAIL_USER: process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 3) + '***' : 'Not Set',
    EMAIL_PASS_SET: !!process.env.EMAIL_PASS,
    SMTP_USER: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 3) + '***' : 'Not Set',
    SMTP_PASS_SET: !!process.env.SMTP_PASS,
  });
});

router.post("/register", upload.any(), controller.register);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.post("/update-profile", authorize, upload.any(), controller.updateProfile);

router.post("/send-otp", controller.sendOTP);
router.post("/verify-otp", controller.verifyOTP);
router.post("/resend-otp", controller.resendOTP);
router.post("/verify-reset-otp", controller.verifyResetOTP);
router.post("/reset-password", controller.resetPassword);
router.post("/forgot-password", controller.forgotPass);
router.post("/forgot-pass", controller.forgotPass);
router.post("/change/password", controller.changePass);
router.post("/edit/user", authorize, upload.any(), controller.changeUsername);

router.get("/verify", authorize, controller.verifyUser);
router.get("/verify/admin", authorize, controller.verifyAdmin);
router.post("/init-first-admin", authorize, controller.initializeFirstAdmin);

// Wishlist Endpoints
router.get("/wishlist", authorize, controller.getWishlist);
router.post("/wishlist", authorize, controller.addToWishlist);
router.delete("/wishlist/:productId", authorize, controller.removeFromWishlist);

// Recently Viewed Endpoints
router.get("/recently-viewed", authorize, controller.getRecentlyViewed);
router.post("/recently-viewed", authorize, controller.addRecentlyViewed);
router.delete("/recently-viewed", authorize, controller.clearRecentlyViewed);

// User Payment & Account Details
router.get("/payment-methods", authorize, controller.getPaymentMethods);
router.post("/wallet/recharge", authorize, controller.rechargeWallet);
router.post("/wallet/withdraw", authorize, controller.withdrawWallet);
router.post("/add-card", authorize, controller.addSavedCard);
router.delete("/delete-card/:cardId", authorize, controller.deleteSavedCard);
router.post("/add-upi", authorize, controller.addSavedUpi);
router.delete("/delete-upi/:upiId", authorize, controller.deleteSavedUpi);
router.post("/add-bank-account", authorize, controller.addSavedBankAccount);
router.delete("/delete-bank-account/:bankId", authorize, controller.deleteSavedBankAccount);

// Admin User Management
router.get("/getAll", authorize, admin, controller.getAllUsers);
router.put("/:userId", authorize, admin, controller.updateUserStatus);
router.delete("/:userId", authorize, admin, controller.deleteUser);
router.put("/make-admin/:userId", authorize, admin, controller.makeAdmin);
router.delete("/account/me", authorize, controller.deleteMyAccount);

module.exports = router;

