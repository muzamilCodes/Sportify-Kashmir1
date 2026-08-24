const express = require("express");
const router = express.Router();
const authorize = require("../middlewares/authorize");
const optionalAuthorize = require("../middlewares/optionalAuthorize");
const admin = require("../middlewares/admin");
const contactController = require("../controllers/contactController");

// Public & Customer routes
router.post("/submit", optionalAuthorize, contactController.submitContact);
router.get("/my-tickets", authorize, contactController.getMyTickets);

// Admin only routes
router.get("/all", authorize, admin, contactController.getAllContacts);
router.post("/:id/reply", authorize, admin, contactController.replyToContact);
router.put("/:id/status", authorize, admin, contactController.updateContactStatus);
router.delete("/:id", authorize, admin, contactController.deleteContact);

module.exports = router;