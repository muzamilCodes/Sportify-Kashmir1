const jwt = require("jsonwebtoken");
require("dotenv").config();

const authorize = (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized - No token provided" 
      });
    }
    
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
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