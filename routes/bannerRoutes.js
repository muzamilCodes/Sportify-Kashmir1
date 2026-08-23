const express = require("express");
const router = express.Router();
const authorize = require("../middlewares/authorize");
const admin = require("../middlewares/admin");
const upload = require("../middlewares/multer");
const bannerController = require("../controllers/bannerController");

// Public route for homepage
router.get("/public", bannerController.getPublicBanners);

// Admin routes
router.get("/", authorize, admin, bannerController.getAllBanners);
router.post("/", authorize, admin, upload.any(), bannerController.createBanner);
router.put("/:id", authorize, admin, upload.any(), bannerController.updateBanner);
router.delete("/:id", authorize, admin, bannerController.deleteBanner);

module.exports = router;
