

const jwt = require("jsonwebtoken");
require("dotenv").config();

const authorize = (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    console.log("Auth header:", authHeader);
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      console.log("Token extracted");
    }
    
    if (!token) {
      console.log("No token found");
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized - No token provided" 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Token verified, userId:", decoded.userId);
    req.userId = decoded.userId || decoded.id;
    
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
};

module.exports = authorize;