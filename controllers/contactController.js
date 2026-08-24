const { Contact } = require("../models/contactModel");
const { resHandler } = require("../utilities/resHandler");
const { createNotification } = require("../utilities/notificationService");
const sendEmail = require("../utilities/emailService");

// 1. Submit contact message / Support Ticket
exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message, orderId, priority, attachments } = req.body;
    const userId = req.userId || null;

    if (!name || !name.trim()) return resHandler(res, 400, "Name is required");
    if (!email || !email.trim()) return resHandler(res, 400, "Email is required");
    if (!subject || !subject.trim()) return resHandler(res, 400, "Subject is required");
    if (!message || !message.trim()) return resHandler(res, 400, "Message is required");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return resHandler(res, 400, "Invalid email format");

    const ipAddress = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
    const userAgent = req.headers["user-agent"] || "";
    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;

    const contact = await Contact.create({
      ticketNumber,
      userId,
      orderId: orderId || null,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      subject: subject.trim(),
      message: message.trim(),
      priority: priority || "medium",
      attachments: Array.isArray(attachments) ? attachments : [],
      ipAddress,
      userAgent,
      status: "unread",
    });

    // Notify Admin in-app
    await createNotification({
      recipientType: "admin",
      title: `📩 New Support Ticket #${ticketNumber}: ${subject.trim()}`,
      message: `Message from ${name.trim()} (${email.trim()}): "${message.trim().slice(0, 100)}..."`,
      type: "alert",
      link: "/admin/contacts",
    }).catch(() => {});

    return resHandler(res, 201, `Ticket #${ticketNumber} submitted successfully! Our support team will reply shortly.`, {
      id: contact._id,
      ticketNumber: contact.ticketNumber,
      name: contact.name,
      email: contact.email,
      createdAt: contact.createdAt,
    });
  } catch (error) {
    console.error("Contact submit error:", error);
    return resHandler(res, 500, "Failed to submit message. Please try again.");
  }
};

// 2. Customer: Get My Submitted Tickets
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Contact.find({ userId: req.userId })
      .populate("orderId", "orderId orderValue orderStatus")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Admin: Get all contacts & support tickets
exports.getAllContacts = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;

    const contacts = await Contact.find(query)
      .populate("userId", "username email mobile")
      .populate("orderId", "orderId orderValue orderStatus")
      .sort({ createdAt: -1 })
      .lean();

    const stats = {
      total: await Contact.countDocuments(),
      unread: await Contact.countDocuments({ status: "unread" }),
      replied: await Contact.countDocuments({ status: "replied" }),
      resolved: await Contact.countDocuments({ status: "resolved" }),
    };

    return res.status(200).json({
      success: true,
      data: contacts,
      stats,
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    return resHandler(res, 500, "Failed to fetch inquiries");
  }
};

// 4. Admin: Reply to Ticket / Contact
exports.replyToContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    if (!replyMessage || !replyMessage.trim()) {
      return resHandler(res, 400, "Reply message is required");
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return resHandler(res, 404, "Inquiry/Ticket not found");
    }

    contact.replyMessage = replyMessage.trim();
    contact.repliedAt = new Date();
    contact.repliedBy = req.userId;
    contact.status = "replied";
    await contact.save();

    // Send Email to customer
    if (contact.email) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #ea580c; margin-top: 0;">Sportify Kashmir Support Response</h2>
          <p>Dear <strong>${contact.name}</strong>,</p>
          <p>Thank you for reaching out to Sportify Kashmir. Here is our response regarding <em>"${contact.subject}"</em> (Ticket #${contact.ticketNumber || "N/A"}):</p>
          <div style="background-color: #f8fafc; border-left: 4px solid #ea580c; padding: 15px; margin: 15px 0; border-radius: 4px;">
            <p style="margin: 0; color: #1e293b; white-space: pre-line;">${contact.replyMessage}</p>
          </div>
          <p style="color: #64748b; font-size: 13px;">If you have further questions, you can reply directly to this email or contact us at +91 9682645127.</p>
        </div>
      `;
      sendEmail(contact.email, `Re: [Ticket #${contact.ticketNumber || id.slice(-6)}] ${contact.subject}`, emailHtml).catch(() => {});
    }

    // In-App Notification if user is registered
    if (contact.userId) {
      await createNotification({
        recipientType: "user",
        userId: contact.userId,
        title: `💬 Support Replied: Ticket #${contact.ticketNumber || id.slice(-6)}`,
        message: `Admin has replied to your inquiry: "${contact.replyMessage.slice(0, 120)}..."`,
        type: "system",
        link: "/contact",
      }).catch(() => {});
    }

    return resHandler(res, 200, "Reply sent successfully", contact);
  } catch (error) {
    console.error("Reply contact error:", error);
    return resHandler(res, 500, "Failed to send reply");
  }
};

// 5. Admin: Update Contact Status
exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const contact = await Contact.findById(id);
    if (!contact) return resHandler(res, 404, "Inquiry not found");

    if (status) contact.status = status;
    await contact.save();

    return resHandler(res, 200, `Ticket marked as ${status}`, contact);
  } catch (error) {
    return resHandler(res, 500, error.message);
  }
};

// 6. Admin: Delete Contact
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Contact.findByIdAndDelete(id);
    if (!deleted) return resHandler(res, 404, "Inquiry not found");
    return resHandler(res, 200, "Inquiry deleted successfully");
  } catch (error) {
    return resHandler(res, 500, error.message);
  }
};