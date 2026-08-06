const jwt = require("jsonwebtoken");
require("dotenv").config();

const optionalAuthorize = async (req, res, next) => {
  try {
    let token;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    // 2. Check cookies
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // If token exists, verify it
    if (token) {
      const secretKey = process.env.SECRET_KEY;
      const decoded = jwt.verify(token, secretKey);
      req.userId = decoded.userId;
    }

    // Always proceed, even if no token
    next();

  } catch (error) {
    // If token invalid, just proceed without userId
    next();
  }
};

module.exports = optionalAuthorize;
