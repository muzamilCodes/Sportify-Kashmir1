const express = require("express");
const router = express.Router();
const authorize = require("../middlewares/authorize");
const admin = require("../middlewares/admin");
const upload = require("../middlewares/multer");
const postController = require("../controllers/postController");

// Public routes
router.get("/getAll", postController.getAllPosts);
router.get("/:postId", postController.getPostById);

// Admin routes
router.post("/add", authorize, admin, upload.single("image"), postController.addPost);
router.put("/update/:postId", authorize, admin, upload.single("image"), postController.updatePost);
router.delete("/delete/:postId", authorize, admin, postController.deletePost);

module.exports = router;