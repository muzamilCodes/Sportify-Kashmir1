const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Contact Schema
const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  subject: String,
  message: String,
  date: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', ContactSchema);

// POST /contact
router.post('/', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;