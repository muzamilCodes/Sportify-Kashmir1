const Notification = require("../models/notificationModel");
const { User } = require("../models/userModel");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel");
const sendEmail = require("./emailService");
require("dotenv").config();

/**
 * Get the designated primary Admin email address
 */
async function getAdminEmails() {
  const adminEmail = (process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || "warmuzamil68@gmail.com").trim().toLowerCase();
  return [adminEmail];
}

/**
 * Generic In-App Notification Creator
 */
async function createNotification({
  recipientType = "user",
  userId = null,
  title,
  message,
  type = "system",
  data = {},
  link = "",
}) {
  try {
    const notification = await Notification.create({
      recipientType,
      userId: userId ? userId : null,
      title: String(title).trim(),
      message: String(message).trim(),
      type,
      data,
      link,
      isRead: false,
    });
    return notification;
  } catch (error) {
    console.error("[notificationService] Failed to create in-app notification:", error.message);
    return null;
  }
}

/**
 * 1. Admin Alert: New User Registered
 */
async function sendAdminNewUserNotification(user) {
  try {
    if (!user) return;
    const username = user.username || "New User";
    const email = user.email || "N/A";
    const mobile = user.mobile ? `+91 ${user.mobile}` : "";

    // 1. Create In-App Notification for Admin
    await createNotification({
      recipientType: "admin",
      title: `👤 New User Registered: ${username}`,
      message: `User ${username} (${email}${mobile ? ` | ${mobile}` : ""}) has joined Sportify Kashmir.`,
      type: "user_registered",
      data: {
        userId: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
      },
      link: "/admin/users",
    });

    // 2. Send Email Alert to Admin(s)
    const adminEmails = await getAdminEmails();
    const emailSubject = `👤 New User Registration: ${username} (${email})`;
    const emailHtml = sendEmail.getAdminNewUserAlertTemplate(user);

    for (const adminEmail of adminEmails) {
      sendEmail(adminEmail, emailSubject, emailHtml).catch((err) => {
        console.warn(`[notificationService] Failed to email admin (${adminEmail}):`, err.message);
      });
    }

    console.log(`✅ [NOTIF] Admin alerted for new user: ${email}`);
  } catch (error) {
    console.error("[notificationService] sendAdminNewUserNotification error:", error.message);
  }
}

/**
 * 2. Admin Alert: New Order Placed
 */
async function sendAdminNewOrderNotification(orderIdOrDoc) {
  try {
    let order = orderIdOrDoc;
    if (!order || typeof order === "string" || !order.products) {
      order = await Order.findById(orderIdOrDoc)
        .populate("userId", "username email mobile")
        .populate("shippingAddress")
        .populate("products.productId", "name price productImgUrls");
    }

    if (!order) return;

    const orderId = order.orderId || order._id.toString().slice(-8);
    const orderTotal = Number(order.orderValue || 0).toFixed(2);
    const user = order.userId || {};
    const address = order.shippingAddress || order.guestAddress || {};
    const customerName = user.username || address.fullName || address.firstName || "Customer";
    const itemCount = Array.isArray(order.products) ? order.products.length : 1;

    // 1. In-App Notification for Admin
    await createNotification({
      recipientType: "admin",
      title: `🛍️ New Order Received: #${orderId}`,
      message: `Order #${orderId} of ₹${orderTotal} (${itemCount} items) placed by ${customerName} via ${(order.paymentMethod || "COD").toUpperCase()}.`,
      type: "order_created",
      data: {
        orderId: order._id,
        orderNumber: orderId,
        orderValue: order.orderValue,
        paymentMethod: order.paymentMethod,
        customerName,
      },
      link: `/admin/orders`,
    });

    // 2. Email Alert to Admin(s)
    const adminEmails = await getAdminEmails();
    const emailSubject = `🛍️ New Order Received! #${orderId} - ₹${orderTotal} (${customerName})`;
    const emailHtml = sendEmail.getAdminNewOrderAlertTemplate(order, user, address);

    for (const adminEmail of adminEmails) {
      sendEmail(adminEmail, emailSubject, emailHtml).catch((err) => {
        console.warn(`[notificationService] Failed to email admin order alert (${adminEmail}):`, err.message);
      });
    }

    console.log(`✅ [NOTIF] Admin alerted for new order #${orderId}`);
  } catch (error) {
    console.error("[notificationService] sendAdminNewOrderNotification error:", error.message);
  }
}

/**
 * 3. User Notification: Order Placed ("Maine yeh order kiya")
 */
async function sendUserOrderCreatedNotification(orderIdOrDoc, explicitUser = null) {
  try {
    let order = orderIdOrDoc;
    if (!order || typeof order === "string" || !order.products) {
      order = await Order.findById(orderIdOrDoc)
        .populate("userId", "username email mobile")
        .populate("shippingAddress")
        .populate("products.productId", "name price productImgUrls");
    }

    if (!order) return;

    const orderId = order.orderId || order._id.toString().slice(-8);
    const orderTotal = Number(order.orderValue || 0).toFixed(2);
    const user = explicitUser || order.userId;
    const address = order.shippingAddress || order.guestAddress || {};
    const recipientEmail = user?.email || address?.email || order.guestAddress?.email;
    const customerName = user?.username || address?.fullName || address?.firstName || "Customer";

    // 1. In-App Notification for User (if logged-in user)
    if (user && (user._id || user.id)) {
      await createNotification({
        recipientType: "user",
        userId: user._id || user.id,
        title: `🎉 Order Placed Successfully! (#${orderId})`,
        message: `Your order for ₹${orderTotal} has been placed. We are preparing it for dispatch!`,
        type: "order_created",
        data: {
          orderId: order._id,
          orderNumber: orderId,
          orderValue: order.orderValue,
          status: "pending",
        },
        link: `/orders/${order._id}`,
      });
    }

    // 2. Email Receipt to Customer
    if (recipientEmail) {
      const emailSubject = `🎉 Order Confirmed! #${orderId} - Sportify Kashmir`;
      const emailHtml = sendEmail.getUserOrderPlacedTemplate(order, user, address);
      sendEmail(recipientEmail, emailSubject, emailHtml).catch((err) => {
        console.warn(`[notificationService] Failed to send order receipt to user (${recipientEmail}):`, err.message);
      });
    }

    console.log(`✅ [NOTIF] User notified for order placement #${orderId}`);
  } catch (error) {
    console.error("[notificationService] sendUserOrderCreatedNotification error:", error.message);
  }
}

/**
 * 4. User Notification: Order Status Update ("Kahan pahuncha order")
 */
async function sendUserOrderStatusNotification(orderIdOrDoc, newStatus) {
  try {
    let order = orderIdOrDoc;
    if (!order || typeof order === "string" || !order.userId) {
      order = await Order.findById(orderIdOrDoc)
        .populate("userId", "username email mobile")
        .populate("shippingAddress")
        .populate("products.productId", "name price productImgUrls");
    }

    if (!order) return;

    const orderId = order.orderId || order._id.toString().slice(-8);
    const user = order.userId;
    const address = order.shippingAddress || order.guestAddress || {};
    const recipientEmail = user?.email || address?.email || order.guestAddress?.email;

    const statusMessages = {
      confirmed: {
        title: `📦 Order Confirmed (#${orderId})`,
        message: `Your order #${orderId} has been confirmed and is being packed.`,
        subject: `Order #${orderId} Confirmed - Sportify Kashmir`,
      },
      processing: {
        title: `📦 Order Confirmed (#${orderId})`,
        message: `Your order #${orderId} has been confirmed and is being packed.`,
        subject: `Order #${orderId} Confirmed - Sportify Kashmir`,
      },
      shipped: {
        title: `🚚 Order Shipped! (#${orderId})`,
        message: `Your package #${orderId} is on the way with our courier partner.`,
        subject: `Order #${orderId} Shipped - Sportify Kashmir`,
      },
      out_for_delivery: {
        title: `🛵 Out for Delivery! (#${orderId})`,
        message: `Your order #${orderId} is out for delivery today. Keep your phone handy!`,
        subject: `Order #${orderId} Out for Delivery - Sportify Kashmir`,
      },
      delivered: {
        title: `✅ Order Delivered! (#${orderId})`,
        message: `Your order #${orderId} was delivered successfully. Enjoy your sports gear!`,
        subject: `Order #${orderId} Delivered - Sportify Kashmir`,
      },
      cancelled: {
        title: `❌ Order Cancelled (#${orderId})`,
        message: `Order #${orderId} has been cancelled. Contact support if you need help.`,
        subject: `Order #${orderId} Cancelled - Sportify Kashmir`,
      },
    };

    const config = statusMessages[newStatus] || {
      title: `Order Update (#${orderId})`,
      message: `Your order #${orderId} status has changed to ${newStatus}.`,
      subject: `Order #${orderId} Update - Sportify Kashmir`,
    };

    // 1. In-App Notification for User
    if (user && (user._id || user.id)) {
      await createNotification({
        recipientType: "user",
        userId: user._id || user.id,
        title: config.title,
        message: config.message,
        type: "order_status",
        data: {
          orderId: order._id,
          orderNumber: orderId,
          status: newStatus,
        },
        link: `/orders/${order._id}`,
      });
    }

    // 2. Email Notification to Customer
    if (recipientEmail) {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const emailHtml = sendEmail.getOrderStatusTemplate(
        order,
        config.title,
        config.message,
        `${frontendUrl}/orders/${order._id}`
      );
      sendEmail(recipientEmail, config.subject, emailHtml).catch((err) => {
        console.warn(`[notificationService] Failed to send status email to user (${recipientEmail}):`, err.message);
      });
    }

    // If order was cancelled by user, notify Admin in-app as well
    if (newStatus === "cancelled") {
      await createNotification({
        recipientType: "admin",
        title: `❌ Order Cancelled: #${orderId}`,
        message: `Order #${orderId} for ₹${Number(order.orderValue || 0).toFixed(2)} was cancelled.`,
        type: "order_status",
        data: { orderId: order._id, orderNumber: orderId, status: "cancelled" },
        link: `/admin/orders`,
      });
    }

    console.log(`✅ [NOTIF] User notified for order #${orderId} status: ${newStatus}`);
  } catch (error) {
    console.error("[notificationService] sendUserOrderStatusNotification error:", error.message);
  }
}

/**
 * 5. User Welcome Notification on Sign Up / Verification
 */
async function sendUserWelcomeNotification(user) {
  try {
    if (!user) return;

    // 1. In-App Welcome Notification
    await createNotification({
      recipientType: "user",
      userId: user._id,
      title: "🏸 Welcome to Sportify Kashmir!",
      message: "Thank you for joining us! Discover genuine sports gear, cricket bats, rackets & fast delivery across Kashmir.",
      type: "system",
      data: { welcome: true },
      link: "",
    });

    // 2. Welcome Email
    if (user.email) {
      const emailSubject = "🏸 Welcome to Sportify Kashmir!";
      const emailHtml = sendEmail.getUserWelcomeTemplate(user);
      sendEmail(user.email, emailSubject, emailHtml).catch((err) => {
        console.warn(`[notificationService] Failed to send welcome email (${user.email}):`, err.message);
      });
    }

    console.log(`✅ [NOTIF] Welcome notification sent to user: ${user.email}`);
  } catch (error) {
    console.error("[notificationService] sendUserWelcomeNotification error:", error.message);
  }
}

/**
 * 6. Broadcast Website Update / Announcement to ALL Users ("Website ka naya update")
 */
async function broadcastAnnouncement({
  title,
  message,
  link = "",
  type = "website_update",
  sendEmailBlast = false,
}) {
  try {
    // 1. Create Broadcast In-App Notification (recipientType = 'all')
    const notification = await createNotification({
      recipientType: "all",
      title: String(title).trim(),
      message: String(message).trim(),
      type: type || "website_update",
      link: link ? link.trim() : "",
      data: { broadcast: true, broadcastedAt: new Date() },
    });

    // 2. Optional: Send Email to all active users
    if (sendEmailBlast) {
      try {
        const users = await User.find({ isVerified: true, isActive: true }).select("email").lean();
        const emailSubject = `📢 Update: ${title} - Sportify Kashmir`;
        const emailHtml = sendEmail.getWebsiteUpdateTemplate(title, message, link);

        for (const user of users) {
          if (user.email) {
            sendEmail(user.email, emailSubject, emailHtml).catch(() => {});
          }
        }
      } catch (err) {
        console.warn("[notificationService] Email blast error:", err.message);
      }
    }

    console.log(`✅ [NOTIF] Broadcast announcement created: "${title}"`);
    return notification;
  } catch (error) {
    console.error("[notificationService] broadcastAnnouncement error:", error.message);
    throw error;
  }
}

module.exports = {
  createNotification,
  sendAdminNewUserNotification,
  sendAdminNewOrderNotification,
  sendUserOrderCreatedNotification,
  sendUserOrderStatusNotification,
  sendUserWelcomeNotification,
  broadcastAnnouncement,
  getAdminEmails,
};
