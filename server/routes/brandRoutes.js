const express = require("express");
const router = express.Router();
const authorize = require("../middlewares/authorize");
const admin = require("../middlewares/admin");
const brandController = require("../controllers/brandController");

// Public routes
router.get("/all", brandController.getAllBrands);
router.get("/:brandId", brandController.getBrandById);

// Admin only routes
router.post("/add", authorize, admin, brandController.addBrand);
router.put("/edit/:brandId", authorize, admin, brandController.editBrand);
router.delete("/delete/:brandId", authorize, admin, brandController.deleteBrand);

module.exports = router;