const express = require("express");
const controller = require("../controllers/addressController");
const authorize = require("../middlewares/authorize");

const router = express.Router();

router.post("/create", authorize, controller.createAddress);
router.put("/update/:addressId", authorize, controller.updateAddress);
router.delete("/remove/:addressId", authorize, controller.removeAddress);
router.get("/getAllAddresses", authorize, controller.getAllAddresses);
router.get("/address/:addressId" ,authorize ,  controller.getAddressById)

module.exports = router;
