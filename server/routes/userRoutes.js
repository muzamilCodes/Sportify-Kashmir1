const express = require("express");
const controller = require("../controllers/userController");
const authorize  = require("../middlewares/authorize");
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

router.post("/register", upload.single('profilePicture'), controller.register);
router.post("/login", controller.login);
router.post("/logout",controller.logout);
router.post("/update-profile", authorize, upload.single("profilePic"), controller.updateProfile);

router.post("/send-otp", controller.sendOTP);
router.post("/verify-otp", controller.verifyOTP);
router.post("/resend-otp", controller.resendOTP);
router.post("/verify-reset-otp", controller.verifyResetOTP);
router.post("/reset-password", controller.resetPassword);
router.post("/forgot-password", controller.forgotPass);
router.post("/forgot-pass", controller.forgotPass);
router.post("/change/password", controller.changePass);
router.post("/edit/user", authorize, upload.single("profilePic"), controller.changeUsername);

router.get("/verify" ,  authorize, controller.verifyUser )
router.get("/verify/admin" ,  authorize, controller.verifyAdmin )
router.post("/init-first-admin", authorize, controller.initializeFirstAdmin);
router.get("/getAll", authorize, admin, controller.getAllUsers);
router.put("/:userId", authorize, admin, controller.updateUserStatus);
router.delete("/:userId", authorize, admin, controller.deleteUser);
router.put("/make-admin/:userId", authorize, admin, controller.makeAdmin);

module.exports = router
