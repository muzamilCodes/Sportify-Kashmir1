const express = require("express");
const controller = require("../controllers/productController");
const authorize = require("../middlewares/authorize");
const admin = require("../middlewares/admin");
const upload = require("../middlewares/multer"); // ✅ Change 'multmid' to 'upload'

const router = express.Router();

router.post("/add", authorize, admin, upload.single("image"), controller.addProduct);  // ✅ Change multmid to upload.single("image")
router.put("/edit/:productId", authorize, admin, upload.single("image"), controller.editProduct);  // ✅ Change multmid to upload.single("image")
router.delete("/delete/:productId", authorize, admin, controller.deleteProduct);
router.put("/archive/:productId", controller.archive_UnArchiveProduct);
router.put("/isAvialable/:productId", controller.isAvailOrNot);
router.get("/getAll", controller.getAllProducts);
router.get("/get/:productId", controller.getProductById);
router.get("/:productId", controller.getProductById);
router.get("/category/:category", controller.getProductsByCategory);
router.get("/sale", controller.getSaleProducts);
router.get("/debug", controller.debugProducts);

module.exports = router;