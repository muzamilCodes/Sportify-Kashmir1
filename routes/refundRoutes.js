const express = require("express");
const controller = require("../controllers/refundController");
const authorize = require("../middlewares/authorize");
const admin = require("../middlewares/admin");

const router = express.Router();

router.get("/all", authorize, admin, controller.getAllRefunds);
router.get("/:refundId", authorize, admin, controller.getRefundById);
router.put("/update-status/:refundId", authorize, admin, controller.updateRefundStatus);

module.exports = router;
