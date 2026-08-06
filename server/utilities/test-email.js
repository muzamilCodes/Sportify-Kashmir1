require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

transporter.sendMail({
  from: `"Test" <${process.env.EMAIL_FROM}>`,
  to: "warmuzamil68@gmail.com",  // apna khud ka email
  subject: "Test Brevo",
  text: "Hello, this is a test.",
})
  .then(() => console.log("✅ Email sent successfully"))
  .catch(err => console.log("❌ Error:", err.message));