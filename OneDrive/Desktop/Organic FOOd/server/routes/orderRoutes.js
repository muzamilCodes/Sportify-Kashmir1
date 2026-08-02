const express = require("express");
const controller = require("../controllers/orderController");
const authorize = require("../middlewares/authorize");

const router = express.Router();




router.post("/create" ,authorize ,  controller.createOrder )
router.post("/createCartOrder" ,authorize ,  controller.createCartorder )


router.put("/processing/:orderId" ,authorize , (req,res) =>{ controller.updateOrderStatus(req ,res, "processing") }  )
router.put("/shipped/:orderId" ,authorize , (req,res) =>{ controller.updateOrderStatus(req ,res, "shipped") }  )
router.put("/delivered/:orderId" ,authorize , (req,res) =>{ controller.updateOrderStatus(req ,res, "delivered") }  )
router.put("/cancelled/:orderId" ,authorize , (req,res) =>{ controller.updateOrderStatus(req ,res, "cancelled") }  )

router.get("/fetchAllOrders" ,authorize ,  controller.fetchAllOrders )
router.get("/fetchOrderById/orderId" ,authorize ,  controller.fetchOrderById )




// router.put("/refund/:orderId" ,authorize ,  controller.createOrder )


module.exports = router
