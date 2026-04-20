const { User } = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utilities/emailService");
require('dotenv').config();

// ===================== REGISTER =====================
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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // 🔥 CLEAN MOBILE
    const cleanMobile = mobile.replace(/\D/g, "").slice(-10);

    if (cleanMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be 10 digits",
      });
    }

    // OTP generate
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      mobile: cleanMobile,
      password: hashedPassword,
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      isVerified: false,
    });

    // 🔥 EMAIL SEND (SAFE - NO CRASH)
    try {
      await sendEmail(
        email,
        "Your OTP Verification Code",
        `<h2>Your OTP is ${otp}</h2>
   <p>Valid for 10 minutes.</p>
   <p><strong>⚠️ If you don't see the email in your inbox, please check your Spam/Junk folder in your email client.</strong></p>`
      );
      console.log("OTP sent:", otp);
    } catch (emailError) {
      console.log("EMAIL ERROR (ignored):", emailError.message);
      // ❗ IMPORTANT: user create still success
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      email: newUser.email,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
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

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    // 🔥 FIX: OTP verification check
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify OTP first"
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
      maxAge: 7 * 24 * 60 * 60 * 1000
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
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error(error);
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
      mobile: mobile || undefined
    };

    if (req.file) {
      updateData.profilePic = `${Date.now()}-${req.file.originalname}`;
    }

    Object.keys(updateData).forEach(
      key => updateData[key] === undefined && delete updateData[key]
    );

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      user: updatedUser
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

    await sendEmail(
      email,
      "Your OTP for Login",
      `<p>Your OTP is: <strong>${otp}</strong></p><p>Valid for 10 minutes.</p>`
    );

    return res.status(200).json({ message: "OTP sent to your email" });

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

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Already verified",
      });
    }

    if (
      user.otp !== otp ||
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

    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Account verified",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });

  } catch (error) {
    console.error(error);
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

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    await sendEmail(
      email,
      "Resend OTP",
      `<h2>Your new OTP is ${otp}</h2><p>Valid for 5 minutes.</p>`
    );

    return res.status(200).json({ success: true, message: "OTP resent successfully" });

  } catch (error) {
    console.error(error);
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
      await sendEmail(email, "Reset Password OTP", `<h2>Your OTP is ${otp}</h2><p>Valid for 10 minutes.</p>`);
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

    // 🔥 FIXED
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
    const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
    if (existingEmail) return res.status(400).json({ success: false, message: "Email already in use" });
    const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
    if (existingUsername) return res.status(400).json({ success: false, message: "Username taken" });
    const updateData = { username: username.trim(), email: email.trim(), mobile: mobile ? mobile.trim() : "" };
    if (req.file) {
      updateData.profilePic = `${Date.now()}-${req.file.originalname}`;
      const fs = require('fs');
      const path = require('path');
      const uploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, updateData.profilePic);
      fs.writeFileSync(filePath, req.file.buffer);
    }
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
    return res.status(200).json({ success: true, message: "Profile updated", payload: updatedUser, profilePic: updatedUser.profilePic });
  } catch (error) {
    console.error(error);
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
    // Clear OTP fields to prevent reuse
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