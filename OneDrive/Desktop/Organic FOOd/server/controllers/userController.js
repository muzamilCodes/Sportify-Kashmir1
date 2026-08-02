const { User } = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { transport } = require("../utilities/nodeMailer");
const connectDb = require("../config/connectDb");
require('dotenv').config()

exports.register = async (req, res) => {
  try {
    // const username = req.body
    // const email = req.body
    // const password = req.body

    // destructuring
    const { username, email, password } = req.body;

    //  server side validation

    if (username === "" || email === "" || password === "") {
      return res.status(400).json({
        message: "All the feilds with * are required !",
        success: false,
      });
    }
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User Already Exists , kindly Go to login Page",
        success: false,
      });
    }

    const encryptPassWord = await bcrypt.hash(password, 12); // syntatic sugar

    const newUser = await User.create({
      username,
      email,
      password: encryptPassWord,
    });

    if (newUser) {
      return res
        .status(201)
        .json({ message: "User Created succesfully!", success: true });
    } else {
      return res.status(500).json({
        message: "Something Went Wrong!",
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error!" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;


    if (email === "" || password === "") {
      return res
        .status(400)
        .json({ message: "Email and password both are required!" });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({ message: "User not Found!" });
    }

    const verifyPass = await bcrypt.compare(password, existingUser.password);

    if (verifyPass) {
      // session management

      const secretKey = process.env.SECRET_KEY

      const token = await jwt.sign(
        { userId: existingUser._id, username: existingUser.username },
        secretKey,
        {expiresIn : "168h"}
      );
     
           res.cookie("token", token, {
          maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
          httpOnly: true,
          secure: true, // only send cookie over HTTPS in production
          sameSite: "none", // prevent CSRF in production
        });

      return res
        .status(200)
        .json({ message: "Login in succesfull!" , payload : existingUser });
        
    } else {
      return res.status(400).json({ message: "Password incorrect!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error!" });
  }
};


exports.forgotPass = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "15m" });

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    await transport.sendMail({
      from: "contact@australasia-apparels.shop",
      to: email,
      subject: "Password Reset Link",
      html: `<p>Click below to reset your password:</p><a href="${resetLink}">Reset Password</a>`
    });

    return res.status(200).json({ message: "Reset link sent to your email!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error!" });
  }
};


exports.changePass = async (req, res) => {
  try {
    const { password, confirmPass } = req.body;
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is missing or invalid" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (!password || !confirmPass || password !== confirmPass) {
      return res.status(400).json({ message: "Passwords do not match or missing" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({ message: "Password changed successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};

exports.changeUsername = async(req,res) =>{

try {
  
} catch (error) {
  console.error(error)
}

}

exports.verifyUser =  async (req,res) =>{
  try {
    const userId = req.userId

    const user = await User.findById(userId)

    if(user){
      res.status(200).json({message : "User Verified SuccesFully!" , payload :user})
    }else{
      res.status (400).json({message : "User not Found!"})
    }
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error!" });
  }
};


exports.verifyAdmin =  async (req,res) =>{
  try {
    const userId = req.userId

    const user = await User.findById(userId)

    if(user.isAdmin === true){
      res.status(200).json({message : "Admin Verified SuccesFully!" , payload :user})
    }else{
      res.status (401).json({message : "Only admin has access to view this page"})
    }
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error!" });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return res.status(200).json({ message: "Logged out successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error during logout!" });
  }
};



