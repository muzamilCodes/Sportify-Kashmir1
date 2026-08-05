const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const msg = {
    to: to,
    from: process.env.EMAIL_FROM || 'warmuzamil68@gmail.com',
    subject: subject,
    html: html,
  };

  try {
    await transporter.sendMail(msg);
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Nodemailer error:', error.message);
    throw new Error('Email sending failed');
  }
};

module.exports = sendEmail;