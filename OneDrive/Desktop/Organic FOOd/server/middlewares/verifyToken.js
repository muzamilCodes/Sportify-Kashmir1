const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = async (req, res) => {
  const { token } = req.query;

  if (!token || token === "" || token === null || token === undefined) {
    return res.status(403).json({ message: "Forbidden | Token not Found!" });
  }
  const secretKey = process.env.SECRET_KEY;

  // promise handling in a differnt way

  jwt.verify(token, secretKey, (reject, resolve) => {
    if (reject) {

      return res
        .status(401)
        .json({ message: `Unauthorised | Token not Verified because ${reject.message}` });
    }

    return res.status(200).json({ message: "Token Verified !",  resolve });
  });
};





module.exports = { verifyToken };
