const express = require("express");
const authorize = require("../middlewares/authorize");
const controller = require("../controllers/reviewController");
const router = express.Router();
router.get("/:productId", controller.list);
router.post("/:productId", authorize, controller.create);
module.exports = router;
