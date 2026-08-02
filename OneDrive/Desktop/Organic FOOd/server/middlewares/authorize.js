const jwt = require("jsonwebtoken")
require("dotenv").config();


const authorize = async (req, res, next) => {
    try {
      const { token } = req.cookies;   // older method  was req.query
  
      if (!token || token === "" || token === null || token === undefined) {
        return res
          .status(401)
          .json({ message: "Unauthorised | Token not Found!" });
      }
      const secretKey = process.env.SECRET_KEY;
  
      const verify = await jwt.verify(token, secretKey);
  
      if (verify) {

        req.userId = verify.userId
        next();


      } else {
        return res.status(403).json({ message: "Forbidden!" });
      }
    } catch (error) {
      console.error(error);
    }
  };



  module.exports = authorize
  