const express = require("express");
const controller = require("../controllers/notificationController");
const authorize = require("../middlewares/authorize");
const admin = require("../middlewares/admin");

const router = express.Router();

// ── User In-App Notification Routes ──
router.get("/", authorize, controller.getUserNotifications);
router.put("/read-all", authorize, controller.markAllAsRead);
router.put("/:id/read", authorize, controller.markAsRead);
router.delete("/:id", authorize, controller.deleteNotification);

// ── Admin In-App Notification Routes ──
router.get("/admin", admin, controller.getAdminNotifications);
router.put("/admin/read-all", admin, controller.markAllAdminAsRead);
router.put("/admin/:id/read", admin, controller.markAdminAsRead);
router.delete("/admin/:id", admin, controller.deleteAdminNotification);

// ── Admin Broadcast & Website Update Routes ──
router.post("/admin/broadcast", admin, controller.createBroadcastNotification);
router.get("/admin/broadcasts", admin, controller.getBroadcastHistory);
router.delete("/admin/broadcasts/:id", admin, controller.deleteBroadcast);

module.exports = router;
