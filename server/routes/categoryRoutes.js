const express = require("express");
const controller = require("../controllers/categoryController");
const authorize = require("../middlewares/authorize");
const admin = require("../middlewares/admin");

const router = express.Router();

router.post("/add", authorize, admin, controller.addCategory);
router.put("/edit/:categoryId", authorize, admin, controller.editCategory);
router.delete("/delete/:categoryId", authorize, admin, controller.deleteCategory);
router.get("/all", controller.getAllCategories);
router.get("/:categoryId", controller.getCategoryById);

module.exports = router;
