const jwt = require("jsonwebtoken");
const { User } = require("../models/userModel");
require("dotenv").config();

const admin = async (req, res, next) => {
  try {
    let userId = req.userId || req.user?.userId || req.user?.id;

    // If authorize middleware didn't run before this, extract and verify token directly
    if (!userId) {
      const authHeader = req.headers.authorization;
      let token;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
      }

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.SECRET_KEY);
          userId = decoded.userId || decoded.id;
          req.userId = userId;
          req.user = decoded;
        } catch (jwtErr) {
          // Token verification failed
        }
      }
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided or token invalid",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isAdminUser =
      user.isAdmin === true ||
      String(user.isAdmin) === "true" ||
      user.role === "admin" ||
      user.email === "warmuzamil68@gmail.com" ||
      user.email === "warmuzamil113@gmail.com";

    if (isAdminUser) {
      req.user = user;
      return next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }
  } catch (error) {
    console.error("Admin authorization error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during admin verification",
    });
  }
};

module.exports = admin;