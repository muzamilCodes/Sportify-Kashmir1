const express = require("express");
const router = express.Router();
const authorize = require("../middlewares/authorize");
const admin = require("../middlewares/admin");
const contactController = require("../controllers/contactController");

// Public route
router.post("/submit", contactController.submitContact);

// Admin only routes
router.get("/all", authorize, admin, contactController.getAllContacts);
router.get("/stats", authorize, admin, contactController.getContactStats);
router.get("/:contactId", authorize, admin, contactController.getContactById);
router.put("/:contactId", authorize, admin, contactController.updateContactStatus);
router.delete("/:contactId", authorize, admin, contactController.deleteContact);

module.exports = router;