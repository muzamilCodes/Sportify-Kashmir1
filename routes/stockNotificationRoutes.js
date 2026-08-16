const express = require("express");
const controller = require("../controllers/stockNotificationController");
const router = express.Router();
router.post("/:productId", controller.subscribe);
module.exports = router;
