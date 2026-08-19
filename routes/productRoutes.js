const express = require("express");
const controller = require("../controllers/productController");
const authorize = require("../middlewares/authorize");
const admin = require("../middlewares/admin");
const upload = require("../middlewares/multer");

const router = express.Router();

router.post("/add", authorize, admin, upload.any(), controller.addProduct);
router.put("/edit/:productId", authorize, admin, upload.any(), controller.editProduct);
router.delete("/delete/:productId", authorize, admin, controller.deleteProduct);
router.put("/archive/:productId", controller.archive_UnArchiveProduct);
router.put("/isAvialable/:productId", controller.isAvailOrNot);
router.get("/getAll", controller.getAllProducts);
router.get("/sale", controller.getSaleProducts);
router.get("/category/:category", controller.getProductsByCategory);
router.get("/debug", controller.debugProducts);
router.get("/get/:productId", controller.getProductById);
router.get("/:productId", controller.getProductById);

module.exports = router;
