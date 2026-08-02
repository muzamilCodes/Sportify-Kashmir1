const express = require("express");
const controller = require("../controllers/productController");
const authorize = require("../middlewares/authorize");
const multmid = require("../middlewares/multer");

const router = express.Router();

router.post("/add", multmid, controller.addProduct);
router.put("/edit/:productId" , multmid,  controller.editProduct)
router.put("/archive/:productId" , controller.archive_UnArchiveProduct)
router.put("/isAvialable/:productId" , controller.isAvailOrNot)
router.get("/getAll" , controller.getAllProducts)
router.get("/get/:productId" , controller.getProductById)

module.exports = router;
