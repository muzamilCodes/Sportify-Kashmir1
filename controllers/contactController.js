const { Contact } = require("../models/contactModel");
const { resHandler } = require("../utilities/resHandler");

// Submit contact form
exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return resHandler(res, 400, "Name is required");
    }
    if (!email || !email.trim()) {
      return resHandler(res, 400, "Email is required");
    }
    if (!subject || !subject.trim()) {
      return resHandler(res, 400, "Subject is required");
    }
    if (!message || !message.trim()) {
      return resHandler(res, 400, "Message is required");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return resHandler(res, 400, "Invalid email format");
    }

    // Get IP address
    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    const userAgent = req.headers["user-agent"] || "";

    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      subject: subject.trim(),
      message: message.trim(),
      ipAddress: ipAddress,
      userAgent: userAgent,
      status: "unread",
    });

    return resHandler(res, 201, "Message sent successfully! We'll get back to you soon.", {
      id: contact._id,
      name: contact.name,
      email: contact.email,
      createdAt: contact.createdAt,
    });
  } catch (error) {
    console.error("Contact submit error:", error);
    return resHandler(res, 500, "Failed to send message. Please try again.");
  }
};

// Get all contacts (Admin only)
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    
    return resHandler(res, 200, "Contacts fetched successfully", contacts);
  } catch (error) {
    console.error("Get contacts error:", error);
    return resHandler(res, 500, "Server Error!");
  }
};

// Get contact by ID (Admin only)
exports.getContactById = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findById(contactId);
    
    if (!contact) {
      return resHandler(res, 404, "Contact not found");
    }
    
    // Mark as read if it was unread
    if (contact.status === "unread") {
      contact.status = "read";
      await contact.save();
    }
    
    return resHandler(res, 200, "Contact found", contact);
  } catch (error) {
    console.error("Get contact error:", error);
    return resHandler(res, 500, "Server Error!");
  }
};

// Update contact status (Admin only)
exports.updateContactStatus = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { status, replyMessage } = req.body;
    
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return resHandler(res, 404, "Contact not found");
    }
    
    if (status) contact.status = status;
    if (replyMessage) {
      contact.replyMessage = replyMessage;
      contact.repliedAt = new Date();
      if (status !== "replied") contact.status = "replied";
    }
    
    await contact.save();
    
    return resHandler(res, 200, "Contact updated successfully", contact);
  } catch (error) {
    console.error("Update contact error:", error);
    return resHandler(res, 500, "Server Error!");
  }
};

// Delete contact (Admin only)
exports.deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findByIdAndDelete(contactId);
    
    if (!contact) {
      return resHandler(res, 404, "Contact not found");
    }
    
    return resHandler(res, 200, "Contact deleted successfully");
  } catch (error) {
    console.error("Delete contact error:", error);
    return resHandler(res, 500, "Server Error!");
  }
};

// Get contacts statistics (Admin only)
exports.getContactStats = async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const unread = await Contact.countDocuments({ status: "unread" });
    const read = await Contact.countDocuments({ status: "read" });
    const replied = await Contact.countDocuments({ status: "replied" });
    const archived = await Contact.countDocuments({ status: "archived" });
    
    // Last 7 days contacts
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7Days = await Contact.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });
    
    return resHandler(res, 200, "Contact statistics", {
      total,
      unread,
      read,
      replied,
      archived,
      last7Days,
    });
  } catch (error) {
    console.error("Contact stats error:", error);
    return resHandler(res, 500, "Server Error!");
  }
};