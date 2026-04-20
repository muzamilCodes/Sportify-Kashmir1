const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.BREVO_SMTP_PASS);

const sendEmail = async (to, subject, html) => {
  const msg = {
    to: to,
    from: 'warmuzamil68@gmail.com', // Verified sender
    subject: subject,
    html: html,
  };
  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error.message);
    throw new Error('Email sending failed');
  }
};

module.exports = sendEmail;