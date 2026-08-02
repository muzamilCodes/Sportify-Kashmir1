const express = require("express");
const controller = require("../controllers/cartController");
const authorize = require("../middlewares/authorize");

const router = express.Router();

router.post("/addtoCart/:productId" , authorize , controller.addToCart)
router.get("/removeFromCart/:productId" , authorize , controller.removeFromCart)
router.get("/getCart" , authorize , controller.getCart)

module.exports = router