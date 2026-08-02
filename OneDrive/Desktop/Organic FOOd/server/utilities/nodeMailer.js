const nodemailer = require("nodemailer");
const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
      user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  }
});

module.exports = { transport };