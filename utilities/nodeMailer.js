const sendEmail = require("./emailService");

/**
 * Universal Transporter Wrapper for legacy code.
 */
const transporter = {
  sendMail: async (mailOptions) => {
    const to = mailOptions.to;
    const subject = mailOptions.subject;
    const html = mailOptions.html || mailOptions.text;
    const success = await sendEmail(to, subject, html, {
      from: mailOptions.from,
      headers: mailOptions.headers,
    });
    if (!success) {
      throw new Error(sendEmail.getLastError());
    }
    return { messageId: "sent-via-enhanced-email-service" };
  },
};

module.exports = transporter;