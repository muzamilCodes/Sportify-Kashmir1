const { User } = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utilities/emailService");
const { sendAdminNewUserNotification, sendUserWelcomeNotification } = require("../utilities/notificationService");
require("dotenv").config();

// ===================== REGISTER =====================
exports.register = async (req, res) => {
  try {
    const { username, email, password, mobile } = req.body;

    if (!username || !email || !password || !mobile) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const mobileStr = String(mobile || "");
    const cleanMobile = mobileStr.replace(/\D/g, "").slice(-10);

    if (cleanMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be 10 digits",
      });
    }

    // Check if verified user exists by email or mobile
    const existingVerifiedEmail = await User.findOne({ email: cleanEmail, isVerified: true });
    if (existingVerifiedEmail) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please log in.",
      });
    }

    const existingVerifiedMobile = await User.findOne({ mobile: cleanMobile, isVerified: true });
    if (existingVerifiedMobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is already registered to another verified user. Please log in.",
      });
    }

    // Clean up any stale/incomplete unverified registrations for this email OR mobile
    await User.deleteMany({
      $or: [{ email: cleanEmail }, { mobile: cleanMobile }],
      isVerified: false,
    });

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const uploadedFile = req.file || (Array.isArray(req.files) ? req.files[0] : (req.files?.profilePicture?.[0] || req.files?.profilePic?.[0]));
    const profilePic = uploadedFile
      ? (uploadedFile.filename
          ? `/uploads/${uploadedFile.filename}`
          : `data:${uploadedFile.mimetype};base64,${uploadedFile.buffer.toString("base64")}`)
      : undefined;

    const targetUser = await User.create({
      username: String(username).trim(),
      email: cleanEmail,
      mobile: cleanMobile,
      password: hashedPassword,
      profilePic: profilePic,
      otp: otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      isVerified: false,
    });

    console.log(`🔑 [REGISTRATION OTP GENERATED] Email: ${targetUser.email} | OTP: ${otp}`);

    // Send registration OTP email with inbox-optimized template
    let emailSent = false;
    try {
      emailSent = await sendEmail(
        targetUser.email,
        `[${otp}] is your Sportify Kashmir Verification Code`,
        sendEmail.getOtpTemplate(otp, "Account Registration Verification", targetUser.username)
      );
    } catch (err) {
      console.error("Failed to send registration email:", err.message);
    }

    return res.status(200).json({
      success: true,
      message: emailSent
        ? "OTP sent successfully! Please check your email."
        : "Registration initiated but OTP failed to send.",
      email: targetUser.email,
      otpSent: emailSent,
      emailError: emailSent ? undefined : sendEmail.getLastError(),
    });

  } catch (error) {
    console.error("Register Error:", error);

    if (error.code === 11000) {
      const keyPattern = error.keyPattern || {};
      const field = Object.keys(keyPattern)[0] || "field";
      if (field === "username") {
        try {
          await User.collection.dropIndex("username_1");
          console.log("Dropped legacy username_1 index on duplicate key trigger.");
        } catch (e) {}
      }
      return res.status(400).json({
        success: false,
        message: field === "email"
          ? "An account with this email already exists."
          : field === "mobile"
          ? "An account with this mobile number already exists."
          : `An account with this ${field} already exists.`,
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors || {}).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", ") || "Validation error",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ===================== LOGIN =====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        isUnverified: true,
        email: user.email,
        message: "Account not verified yet. Please enter the OTP sent to your email.",
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        profilePic: user.profilePic,
        isAdmin: user.isAdmin,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== UPDATE PROFILE =====================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { username, email, mobile } = req.body;

    const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const updateData = {
      username: username || undefined,
      email: email || undefined,
      mobile: mobile || undefined,
    };

    if (req.file) {
      updateData.profilePic = req.file.filename
        ? `/uploads/${req.file.filename}`
        : `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      user: updatedUser,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== SEND OTP (for login) =====================
exports.sendOTP = async (req, res) => {
  try {
    const { email, mobile } = req.body;

    if (!email || !mobile) {
      return res.status(400).json({ message: "Email and mobile required" });
    }

    const user = await User.findOne({ email, mobile });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    const emailSent = await sendEmail(
      email,
      `[${otp}] is your Sportify Kashmir Login Code`,
      sendEmail.getOtpTemplate(otp, "Login Verification Code", user.username)
    );

    if (!emailSent) {
      return res.status(502).json({
        success: false,
        message: "OTP could not be delivered. Please try again later.",
        emailError: sendEmail.getLastError(),
      });
    }

    return res.status(200).json({ success: true, message: "OTP sent to your email" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===================== LOGOUT =====================
exports.logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ success: true, message: "Logged out" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== VERIFY OTP =====================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP required",
      });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified. Please log in.",
      });
    }

    if (
      user.otp !== String(otp).trim() ||
      !user.otpExpiry ||
      user.otpExpiry < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    // 🔔 Trigger Admin Alert (In-App + Email) & User Welcome (In-App + Email)
    sendAdminNewUserNotification(user).catch((err) => console.error("Admin user notification error:", err));
    sendUserWelcomeNotification(user).catch((err) => console.error("User welcome notification error:", err));

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Account verified and logged in successfully!",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        profilePic: user.profilePic,
        isAdmin: user.isAdmin,
      },
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===================== RESEND OTP =====================
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await user.save();

    console.log(`🔑 [RESEND OTP GENERATED] Email: ${cleanEmail} | OTP: ${otp}`);

    const emailSent = await sendEmail(
      cleanEmail,
      `[${otp}] is your New Sportify Kashmir Code`,
      sendEmail.getOtpTemplate(otp, "Resend Verification Code", user.username)
    );

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email: " + sendEmail.getLastError(),
        emailError: sendEmail.getLastError(),
      });
    }

    return res.status(200).json({ success: true, message: "OTP resent successfully! Please check your email." });

  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== VERIFY RESET OTP (for forgot password) =====================
exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });
    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    return res.status(200).json({ success: true, message: "OTP verified" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== FORGOT PASSWORD =====================
exports.forgotPass = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();
    try {
      const emailSent = await sendEmail(
        email,
        `[${otp}] is your Sportify Kashmir Password Reset Code`,
        sendEmail.getOtpTemplate(otp, "Password Reset Code", user.username)
      );
      if (!emailSent) {
        return res.status(502).json({ success: false, message: "OTP could not be delivered. Please try again later.", emailError: sendEmail.getLastError() });
      }
      console.log(`OTP sent to ${email}: ${otp}`);
      res.json({ success: true, message: "OTP sent" });
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
      res.status(500).json({ success: false, message: "Failed to send email" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== CHANGE PASSWORD (via token) =====================
exports.changePass = async (req, res) => {
  try {
    const { password, confirmPass } = req.body;
    const { token } = req.query;

    if (!token) return res.status(400).json({ message: "Token missing" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const userId = decoded.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!password || !confirmPass || password !== confirmPass) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({ message: "Password changed!" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===================== CHANGE USERNAME / EMAIL (profile edit) =====================
exports.changeUsername = async (req, res) => {
  try {
    const userId = req.userId;
    const { username, email, mobile } = req.body;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });
    if (!username || !email) return res.status(400).json({ success: false, message: "Username and email required" });
    
    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.trim();

    const existingEmail = await User.findOne({ email: cleanEmail, _id: { $ne: userId } });
    if (existingEmail) return res.status(400).json({ success: false, message: "Email already in use" });

    const updateData = { 
      username: cleanUsername, 
      email: cleanEmail, 
      mobile: mobile ? String(mobile).replace(/\D/g, "").slice(-10) : "" 
    };

    if (req.file) {
      updateData.profilePic = req.file.filename
        ? `/uploads/${req.file.filename}`
        : `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
    return res.status(200).json({ 
      success: true, 
      message: "Profile updated successfully", 
      payload: updatedUser, 
      user: updatedUser,
      profilePic: updatedUser.profilePic 
    });
  } catch (error) {
    console.error("Profile Edit Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== VERIFY USER (token) =====================
exports.verifyUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (user) return res.status(200).json({ message: "User Verified", payload: user });
    return res.status(400).json({ message: "User not found" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===================== RESET PASSWORD (via OTP) =====================
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: "Email and new password required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== VERIFY ADMIN =====================
exports.verifyAdmin = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: "User ID missing" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.isAdmin === true) return res.status(200).json({ success: true, message: "Admin Verified", payload: user });
    return res.status(403).json({ success: false, message: "Only admin can access" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== GET ALL USERS (admin) =====================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "username email isAdmin isActive createdAt").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== DELETE USER (admin) =====================
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== UPDATE USER STATUS (admin) =====================
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") return res.status(400).json({ success: false, message: "isActive must be boolean" });
    const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true }).select("username email isAdmin isActive createdAt");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, message: "User status updated", data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== MAKE ADMIN =====================
exports.makeAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isAdmin = true;
    await user.save();
    res.status(200).json({ message: "User made admin", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== INITIALIZE FIRST ADMIN =====================
exports.initializeFirstAdmin = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: "User ID missing" });
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) return res.status(403).json({ success: false, message: "Admin already exists" });
    const user = await User.findByIdAndUpdate(userId, { isAdmin: true }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, message: "You are now admin", payload: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== DELETE MY ACCOUNT =====================
exports.deleteMyAccount = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: "User ID missing" });
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== WISHLIST HANDLERS =====================
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate("wishlist", "name price discount productImgUrls category brand isAvailable stock")
      .select("wishlist")
      .lean();

    return res.status(200).json({
      success: true,
      data: user?.wishlist || [],
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $addToSet: { wishlist: productId } },
      { new: true }
    ).populate("wishlist", "name price discount productImgUrls category brand isAvailable stock");

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      data: user.wishlist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { wishlist: productId } },
      { new: true }
    ).populate("wishlist", "name price discount productImgUrls category brand isAvailable stock");

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      data: user.wishlist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== RECENTLY VIEWED HANDLERS =====================
exports.getRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate("recentlyViewed", "name price discount productImgUrls category brand isAvailable stock")
      .select("recentlyViewed")
      .lean();

    return res.status(200).json({
      success: true,
      data: user?.recentlyViewed || [],
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.addRecentlyViewed = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    // Keep max 12 recent products, most recent first
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let recent = (user.recentlyViewed || []).map((id) => id.toString());
    recent = recent.filter((id) => id !== productId.toString());
    recent.unshift(productId);
    if (recent.length > 12) recent = recent.slice(0, 12);

    user.recentlyViewed = recent;
    await user.save();

    return res.status(200).json({
      success: true,
      data: user.recentlyViewed,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearRecentlyViewed = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { $set: { recentlyViewed: [] } });
    return res.status(200).json({ success: true, message: "Recently viewed cleared" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

