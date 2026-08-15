const sendEmail = require("./emailService");
const Order = require("../models/orderModel");
const { User } = require("../models/userModel");

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Order Confirmed",
  processing: "Order Confirmed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_SUBJECTS = {
  created: "Your Order Has Been Created",
  confirmed: "Order Confirmed",
  processing: "Order Confirmed",
  shipped: "Your Order Has Been Shipped",
  out_for_delivery: "Your Order Is Out for Delivery",
  delivered: "Your Order Has Been Delivered",
  cancelled: "Your Order Has Been Cancelled",
};

function normalizeOrderStatus(status) {
  if (!status) return "pending";

  const value = String(status).trim().toLowerCase().replace(/-/g, "_");

  if (value === "processing") return "confirmed";
  if (value === "out for delivery") return "out_for_delivery";
  if (value === "out_for_delivery") return "out_for_delivery";

  return value;
}

function getOrderNumber(order) {
  return order?.orderId || order?._id?.toString().slice(-8) || "unknown";
}

function getCustomerName(order, user) {
  if (user?.username) return user.username;
  if (order?.guestAddress?.fullName) return order.guestAddress.fullName;
  return "Customer";
}

function getCustomerEmail(order, user) {
  if (user?.email) return user.email;
  if (order?.guestAddress?.email) return order.guestAddress.email;
  return "";
}

function getCustomerMobile(order, user) {
  if (user?.mobile) return user.mobile;
  if (order?.guestAddress?.mobileNumber) return order.guestAddress.mobileNumber;
  return "";
}

function normalizeMobileNumber(mobile) {
  const value = String(mobile || "").trim();
  if (!value) return "";

  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (value.startsWith("+")) return value;
  if (digits.length > 10) return `+${digits}`;

  return value;
}

async function sendWhatsAppNotification(mobile, message) {
  sendWhatsAppNotification.lastError = null;
  const recipient = normalizeMobileNumber(mobile);
  if (!recipient) {
    sendWhatsAppNotification.lastError = "Recipient mobile number is missing or invalid";
    return false;
  }

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_WHATSAPP_FROM;

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const payload = new URLSearchParams({
        From: twilioFrom.startsWith("whatsapp:") ? twilioFrom : `whatsapp:${twilioFrom}`,
        To: recipient.startsWith("whatsapp:") ? recipient : `whatsapp:${recipient}`,
      });

      // WhatsApp production traffic must use an approved template outside the
      // 24-hour customer-service window. Keep Body for sandbox/active sessions.
      if (process.env.TWILIO_WHATSAPP_CONTENT_SID) {
        payload.set("ContentSid", process.env.TWILIO_WHATSAPP_CONTENT_SID);
        const variables = process.env.TWILIO_WHATSAPP_CONTENT_VARIABLES;
        if (variables) payload.set("ContentVariables", variables.replace("{{message}}", JSON.stringify(message)));
      } else {
        payload.set("Body", message);
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: payload.toString(),
      });

      if (response.ok) {
        return true;
      }

      const errorText = await response.text();
      sendWhatsAppNotification.lastError = `Twilio API ${response.status}: ${errorText}`;
      console.error("[whatsapp]", sendWhatsAppNotification.lastError);
    } catch (error) {
      sendWhatsAppNotification.lastError = `Twilio request failed: ${error.message}`;
      console.error("[whatsapp]", sendWhatsAppNotification.lastError);
    }
  }

  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiToken = process.env.WHATSAPP_API_TOKEN;

  if (apiUrl) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
        },
        body: JSON.stringify({
          to: recipient,
          message,
          from: process.env.WHATSAPP_FROM || "Sportify Kashmir",
        }),
      });

      if (response.ok) {
        return true;
      }

      const errorText = await response.text();
      sendWhatsAppNotification.lastError = `WhatsApp API ${response.status}: ${errorText}`;
      console.error("[whatsapp]", sendWhatsAppNotification.lastError);
    } catch (error) {
      sendWhatsAppNotification.lastError = `WhatsApp request failed: ${error.message}`;
      console.error("[whatsapp]", sendWhatsAppNotification.lastError);
    }
  }

  if (!twilioSid || !twilioToken || !twilioFrom) {
    sendWhatsAppNotification.lastError = sendWhatsAppNotification.lastError || "WhatsApp provider is not configured: set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_WHATSAPP_FROM, or WHATSAPP_API_URL and WHATSAPP_API_TOKEN";
  }
  console.error("[whatsapp] delivery failed:", sendWhatsAppNotification.lastError);
  return false;
}

function buildOrderNotification(order, status, type) {
  const normalizedStatus = normalizeOrderStatus(status);
  const templateKey = type === "created" ? "created" : normalizedStatus;
  const orderNumber = getOrderNumber(order);
  const statusLabel = STATUS_LABELS[normalizedStatus] || STATUS_LABELS.pending;
  const subject = STATUS_SUBJECTS[templateKey] || `Order Update - #${orderNumber}`;
  const frontendUrl = process.env.FRONTEND_URL || "";
  const orderUrl = frontendUrl ? `${frontendUrl}/orders/${order._id}` : "";

  const titleMap = {
    created: "Your order has been created",
    confirmed: "Your order has been confirmed",
    processing: "Your order has been confirmed",
    shipped: "Your order has been shipped",
    out_for_delivery: "Your order is out for delivery",
    delivered: "Your order has been delivered",
    cancelled: "Your order has been cancelled",
  };

  const summaryMap = {
    created: "We have received your order and it is now being prepared.",
    confirmed: "Your order has been confirmed and is being processed.",
    processing: "Your order has been confirmed and is being processed.",
    shipped: "Your order is on the way to the shipping carrier.",
    out_for_delivery: "Your order is out for delivery and will arrive soon.",
    delivered: "Your order has been delivered successfully.",
    cancelled: "Your order has been cancelled.",
  };

  const message = summaryMap[templateKey] || summaryMap.created;
  const title = titleMap[templateKey] || titleMap.created;
  const total = typeof order.orderValue === "number" ? order.orderValue : Number(order.orderValue || 0);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #f97316; margin: 0;">Sportify Kashmir</h1>
        <p style="color: #6b7280; margin: 8px 0 0;">Order Notification</p>
      </div>
      <div style="background: #f9fafb; border-radius: 12px; padding: 20px;">
        <h2 style="color: #111827; margin-top: 0;">Hello ${getCustomerName(order, order.userId)},</h2>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">${title}. ${message}</p>
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px;"><strong>Order ID:</strong> #${orderNumber}</p>
          <p style="margin: 0 0 8px;"><strong>Status:</strong> ${statusLabel}</p>
          <p style="margin: 0;"><strong>Total:</strong> ₹${total.toFixed(2)}</p>
        </div>
        ${orderUrl ? `<a href="${orderUrl}" style="display: inline-block; background: #f97316; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 9999px; font-weight: 700;">View Order</a>` : ""}
      </div>
    </div>
  `;

  const whatsappText = [
    "Sportify Kashmir",
    title,
    `Order: #${orderNumber}`,
    `Status: ${statusLabel}`,
    `Total: ₹${total.toFixed(2)}`,
    orderUrl ? `Track: ${orderUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject,
    html,
    whatsappText,
    normalizedStatus,
    orderNumber,
  };
}

async function getRecipientForOrder(order) {
  if (order?.userId && typeof order.userId === "object") {
    return {
      email: getCustomerEmail(order, order.userId),
      mobile: getCustomerMobile(order, order.userId),
      name: getCustomerName(order, order.userId),
    };
  }

  if (order?.userId) {
    const user = await User.findById(order.userId).select("username email mobile");
    return {
      email: getCustomerEmail(order, user),
      mobile: getCustomerMobile(order, user),
      name: getCustomerName(order, user),
    };
  }

  return {
    email: getCustomerEmail(order),
    mobile: getCustomerMobile(order),
    name: getCustomerName(order),
  };
}

async function markNotificationAttempt(orderId, entry) {
  return Order.updateOne(
    { _id: orderId, "notificationLog.eventKey": { $ne: entry.eventKey } },
    { $push: { notificationLog: entry } }
  );
}

async function updateNotificationResult(orderId, eventKey, result) {
  return Order.updateOne(
    { _id: orderId, "notificationLog.eventKey": eventKey },
    {
      $set: {
        "notificationLog.$.emailSent": result.emailSent,
        "notificationLog.$.whatsappSent": result.whatsappSent,
        "notificationLog.$.sentAt": result.emailSent || result.whatsappSent ? new Date() : null,
        "notificationLog.$.error": result.error || "",
      },
    }
  );
}

async function notifyOrderEventInternal(orderId, { type = "status", status = "pending" } = {}) {
  const order = await Order.findById(orderId).populate("userId", "username email mobile isAdmin");
  if (!order) {
    return { success: false, skipped: false, message: "Order not found" };
  }

  const normalizedStatus = normalizeOrderStatus(status || order.orderStatus);
  const eventKey = `${type}:${normalizedStatus}:${order._id.toString()}`;
  const existingEvent = (order.notificationLog || []).find((entry) => entry.eventKey === eventKey);
  if (existingEvent) {
    return { success: true, skipped: true, message: "Notification already sent" };
  }

  const reservation = await markNotificationAttempt(order._id, {
    eventKey,
    type,
    status: normalizedStatus,
    emailSent: false,
    whatsappSent: false,
    sentAt: null,
    error: "",
  });

  if (!reservation.modifiedCount && !reservation.matchedCount) {
    return { success: true, skipped: true, message: "Notification already reserved" };
  }

  const recipient = await getRecipientForOrder(order);
  const template = buildOrderNotification(order, normalizedStatus, type);

  const emailPromise = recipient.email
    ? sendEmail(recipient.email, template.subject, template.html).then((sent) => ({ sent, error: sent ? "" : sendEmail.getLastError() }))
    : Promise.resolve(false);

  const whatsappPromise = recipient.mobile
    ? sendWhatsAppNotification(recipient.mobile, template.whatsappText).then((sent) => ({ sent, error: sent ? "" : sendWhatsAppNotification.lastError }))
    : Promise.resolve(false);

  const [emailResult, whatsappResult] = await Promise.allSettled([emailPromise, whatsappPromise]);

  const emailSent = emailResult.status === "fulfilled" ? Boolean(emailResult.value?.sent ?? emailResult.value) : false;
  const whatsappSent = whatsappResult.status === "fulfilled" ? Boolean(whatsappResult.value?.sent ?? whatsappResult.value) : false;
  const errorMessages = [];

  if (!recipient.email) errorMessages.push("Email: recipient email is missing");
  if (!recipient.mobile) errorMessages.push("WhatsApp: recipient mobile is missing");

  if (emailResult.status === "rejected") errorMessages.push(`Email: ${emailResult.reason?.message || "Email failed"}`);
  else if (emailResult.value?.error) errorMessages.push(`Email: ${emailResult.value.error}`);
  if (whatsappResult.status === "rejected") errorMessages.push(`WhatsApp: ${whatsappResult.reason?.message || "WhatsApp failed"}`);
  else if (whatsappResult.value?.error) errorMessages.push(`WhatsApp: ${whatsappResult.value.error}`);

  await updateNotificationResult(order._id, eventKey, {
    emailSent,
    whatsappSent,
    error: errorMessages.join(" | "),
  });

  return {
    success: emailSent || whatsappSent,
    emailSent,
    whatsappSent,
    skipped: false,
    eventKey,
    status: normalizedStatus,
  };
}

// Notifications are a side effect. Never let an SMTP/WhatsApp/database-log error
// turn a successfully persisted order into a failed order response.
async function notifyOrderEvent(orderId, options = {}) {
  try {
    return await notifyOrderEventInternal(orderId, options);
  } catch (error) {
    console.error(`[notifications] unexpected failure for order ${orderId}:`, error.stack || error.message);
    return { success: false, skipped: false, emailSent: false, whatsappSent: false, error: error.message };
  }
}

module.exports = {
  notifyOrderEvent,
  normalizeOrderStatus,
  buildOrderNotification,
  sendWhatsAppNotification,
};
