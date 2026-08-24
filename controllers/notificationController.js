const Notification = require("../models/notificationModel");
const { broadcastAnnouncement, createNotification } = require("../utilities/notificationService");

/**
 * 1. Get Logged-in User's In-App Notifications
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const query = {
      isDeleted: false,
      deletedBy: { $ne: userId },
      $or: [
        { recipientType: "user", userId: userId },
        { recipientType: "all" },
      ],
    };

    const [notifications, totalCount, unreadUserCount, unreadBroadcastCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({
        recipientType: "user",
        userId: userId,
        isRead: false,
        isDeleted: false,
      }),
      Notification.countDocuments({
        recipientType: "all",
        readBy: { $ne: userId },
        deletedBy: { $ne: userId },
        isDeleted: false,
      }),
    ]);

    const formattedNotifications = notifications.map((n) => {
      const isRead =
        n.recipientType === "all"
          ? Array.isArray(n.readBy) && n.readBy.some((id) => id.toString() === userId.toString())
          : Boolean(n.isRead);

      return {
        _id: n._id,
        id: n._id,
        recipientType: n.recipientType,
        title: n.title,
        message: n.message,
        type: n.type,
        data: n.data || {},
        link: n.link || "",
        isRead,
        createdAt: n.createdAt,
      };
    });

    const unreadCount = unreadUserCount + unreadBroadcastCount;

    return res.status(200).json({
      success: true,
      data: formattedNotifications,
      unreadCount,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit) || 1,
    });
  } catch (error) {
    console.error("getUserNotifications error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

/**
 * 2. Mark Single User Notification as Read
 */
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (notification.recipientType === "all") {
      await Notification.findByIdAndUpdate(id, {
        $addToSet: { readBy: userId },
      });
    } else if (notification.recipientType === "user" && String(notification.userId) === String(userId)) {
      notification.isRead = true;
      await notification.save();
    }

    return res.status(200).json({ success: true, message: "Marked as read" });
  } catch (error) {
    console.error("markAsRead error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 3. Mark ALL User Notifications as Read
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId;

    await Promise.all([
      Notification.updateMany(
        { recipientType: "user", userId: userId, isRead: false },
        { $set: { isRead: true } }
      ),
      Notification.updateMany(
        { recipientType: "all", readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      ),
    ]);

    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("markAllAsRead error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 4. Delete Single User Notification (or dismiss broadcast)
 */
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (notification.recipientType === "all") {
      await Notification.findByIdAndUpdate(id, {
        $addToSet: { deletedBy: userId },
      });
    } else if (notification.recipientType === "user" && String(notification.userId) === String(userId)) {
      notification.isDeleted = true;
      await notification.save();
    }

    return res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("deleteNotification error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 5. Admin: Get Admin In-App Notifications
 */
exports.getAdminNotifications = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 40, 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const query = { recipientType: "admin", isDeleted: false };

    const [notifications, totalCount, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipientType: "admin", isRead: false, isDeleted: false }),
    ]);

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit) || 1,
    });
  } catch (error) {
    console.error("getAdminNotifications error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch admin notifications" });
  }
};

/**
 * 6. Admin: Mark Single Admin Notification as Read
 */
exports.markAdminAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    return res.status(200).json({ success: true, message: "Marked as read", data: notification });
  } catch (error) {
    console.error("markAdminAsRead error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 7. Admin: Mark ALL Admin Notifications as Read
 */
exports.markAllAdminAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientType: "admin", isRead: false },
      { $set: { isRead: true } }
    );
    return res.status(200).json({ success: true, message: "All admin notifications marked as read" });
  } catch (error) {
    console.error("markAllAdminAsRead error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 8. Admin: Delete Admin Notification
 */
exports.deleteAdminNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    return res.status(200).json({ success: true, message: "Admin notification deleted" });
  } catch (error) {
    console.error("deleteAdminNotification error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 9. Admin: Broadcast Website Update / Announcement to ALL Users
 */
exports.createBroadcastNotification = async (req, res) => {
  try {
    const { title, message, link, type, sendEmailBlast } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required for announcement",
      });
    }

    const notification = await broadcastAnnouncement({
      title,
      message,
      link: link || "/products",
      type: type || "website_update",
      sendEmailBlast: Boolean(sendEmailBlast),
    });

    return res.status(201).json({
      success: true,
      message: "Announcement broadcasted successfully to all users!",
      data: notification,
    });
  } catch (error) {
    console.error("createBroadcastNotification error:", error);
    return res.status(500).json({ success: false, message: "Failed to broadcast announcement" });
  }
};

/**
 * 10. Admin: Get Broadcast History
 */
exports.getBroadcastHistory = async (req, res) => {
  try {
    const broadcasts = await Notification.find({
      recipientType: "all",
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: broadcasts,
    });
  } catch (error) {
    console.error("getBroadcastHistory error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch broadcast history" });
  }
};

/**
 * 11. Admin: Delete Broadcast
 */
exports.deleteBroadcast = async (req, res) => {
  try {
    const { id } = req.params;
    const broadcast = await Notification.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!broadcast) {
      return res.status(404).json({ success: false, message: "Broadcast not found" });
    }
    return res.status(200).json({ success: true, message: "Broadcast deleted successfully" });
  } catch (error) {
    console.error("deleteBroadcast error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
