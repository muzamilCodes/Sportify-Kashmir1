const authorize = require("./authorize");

const admin = async (req, res, next) => {
  try {
    authorize(req, res, async () => {
      const userId = req.userId;

      const { User } = require("../models/userModel");
      const user = await User.findById(userId);

      if (user && user.isAdmin === true) {
        return next(); // ✅ IMPORTANT: return lagao
      } else {
        return res.status(403).json({
          success: false,
          message: "Admin access required"
        });
      }
    }); // ❌ yahan se 's' hata diya
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = admin;