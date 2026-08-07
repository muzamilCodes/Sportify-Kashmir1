const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (to, subject, html) => {
  const cleanPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465');
  const user = process.env.SMTP_USER;

  if (!user || !cleanPass) {
    console.warn("⚠️ SMTP_USER or SMTP_PASS is missing in environment variables!");
    return false;
  }

  // Create transporter with proper options & fast timeouts to prevent hanging on cloud host
  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465,
    auth: {
      user: user,
      pass: cleanPass,
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 5000, // 5 seconds connection timeout
    greetingTimeout: 5000,
    socketTimeout: 8000,
  });

  const msg = {
    to: to,
    from: process.env.EMAIL_FROM || user,
    subject: subject,
    html: html,
  };

  try {
    const info = await transporter.sendMail(msg);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Nodemailer primary transport error:', error.message);
    
    // Retry with fallback Gmail service transport if host is gmail
    if (host === 'smtp.gmail.com') {
      try {
        console.log('🔄 Retrying email via secondary Gmail transport...');
        const fallbackTransporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: user, pass: cleanPass },
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 8000,
        });
        await fallbackTransporter.sendMail(msg);
        console.log(`✅ Email sent via fallback to ${to}`);
        return true;
      } catch (fallbackError) {
        console.error('❌ Fallback Nodemailer error:', fallbackError.message);
      }
    }
    
    return false;
  }
};

module.exports = sendEmail;