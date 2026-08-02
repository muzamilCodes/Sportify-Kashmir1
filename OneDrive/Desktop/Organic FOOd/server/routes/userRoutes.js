const express = require("express");
const controller = require("../controllers/userController");
const authorize  = require("../middlewares/authorize");
const router = express.Router();
router.post("/register", controller.register); 
router.post("/login", controller.login); 
router.post("/forgot-password", controller.forgotPass);
router.post("/change/password", controller.changePass); 
router.post("/edit/user", authorize, controller.changeUsername); 
router.get("/verify" ,  authorize, controller.verifyUser )     
router.get("/verify/admin" ,  authorize, controller.verifyAdmin )
router.post("/logout", controller.logout);

module.exports = router
