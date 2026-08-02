const express = require("express");
const controller = require("../controllers/postController");
const authorize  = require("../middlewares/authorize");
const multmid = require("../middlewares/multer");

const router = express.Router();

//post routes
router.post("/add", authorize, multmid, controller.addPost); 
router.post("/edit/:postId", authorize, controller.editPost);
router.get("/getAll", controller.getAllPosts); 
router.get("/:postId", controller.getPost);

module.exports = router;
