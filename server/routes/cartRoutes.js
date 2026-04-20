const express = require("express");
const controller = require("../controllers/cartController");
const authorize = require("../middlewares/authorize");
const optionalAuthorize = require("../middlewares/optionalAuthorize");

const router = express.Router();

router.post("/addtoCart/:productId" , optionalAuthorize , controller.addToCart)
router.get("/removeFromCart/:productId" , optionalAuthorize , controller.removeFromCart)
router.post("/updateQuantity/:productId" , optionalAuthorize , controller.updateQuantity)
router.get("/getCart" , authorize , controller.getCart)
router.get("/getGuestCart/:cartId" , controller.getGuestCart)

module.exports = router