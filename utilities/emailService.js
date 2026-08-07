const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (to, subject, html) => {
  const cleanPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
  const user = (process.env.SMTP_USER || 'warmuzamil68@gmail.com').trim();
  const fromEmail = (process.env.EMAIL_FROM || user).trim();
  const brevoPass = (process.env.BREVO_SMTP_PASS || '').trim();

  console.log(`📧 Attempting to send email to: ${to} | Subject: ${subject}`);

  // 1. Try SendGrid HTTP API if key (starting with SG.) is present
  const sgKey = process.env.SENDGRID_API_KEY || (brevoPass.startsWith('SG.') ? brevoPass : null);
  if (sgKey) {
    try {
      console.log('🚀 Sending email via SendGrid HTTP API...');
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sgKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: fromEmail, name: 'Sportify Kashmir' },
          subject: subject,
          content: [{ type: 'text/html', value: html }]
        })
      });

      if (response.ok || response.status === 202) {
        console.log(`✅ Email sent via SendGrid HTTP API to ${to}`);
        return true;
      } else {
        const errorText = await response.text();
        console.error('⚠️ SendGrid API error status:', response.status, errorText);
      }
    } catch (sgErr) {
      console.error('⚠️ SendGrid API request failed:', sgErr.message);
    }
  }

  // 2. Try Brevo SMTP if configured in .env (Extremely reliable on cloud servers)
  const brevoHost = process.env.BREVO_SMTP_HOST;
  const brevoUser = (process.env.BREVO_SMTP_USER || '').trim();

  if (brevoHost && brevoPass) {
    try {
      console.log('🚀 Sending email via Brevo SMTP...');
      const brevoTransporter = nodemailer.createTransport({
        host: brevoHost,
        port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
        secure: false,
        auth: { user: brevoUser || user, pass: brevoPass },
        connectionTimeout: 8000,
        greetingTimeout: 5000,
        socketTimeout: 8000,
      });

      const info = await brevoTransporter.sendMail({
        from: `Sportify Kashmir <${fromEmail}>`,
        to: to,
        subject: subject,
        html: html,
      });

      console.log(`✅ Email sent via Brevo to ${to}: ${info.messageId}`);
      return true;
    } catch (err) {
      console.error('⚠️ Brevo SMTP failed, falling back to Gmail:', err.message);
    }
  }

  // 3. Try Gmail SMTP with Port 465 (Direct SSL - avoids port 587 STARTTLS blocks on cloud hosting)
  if (user && cleanPass) {
    try {
      console.log('🚀 Sending email via Gmail Port 465 (Direct SSL)...');
      const sslTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: user, pass: cleanPass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 8000,
        greetingTimeout: 5000,
        socketTimeout: 8000,
      });

      const info = await sslTransporter.sendMail({
        from: `Sportify Kashmir <${fromEmail}>`,
        to: to,
        subject: subject,
        html: html,
      });

      console.log(`✅ Email sent via Gmail Port 465 to ${to}: ${info.messageId}`);
      return true;
    } catch (err) {
      console.error('⚠️ Gmail Port 465 failed:', err.message);
    }

    // 4. Fallback: Try Gmail Service Transport
    try {
      console.log('🚀 Retrying email via Gmail Service transport...');
      const serviceTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: user, pass: cleanPass },
        connectionTimeout: 8000,
        greetingTimeout: 5000,
        socketTimeout: 8000,
      });

      const info = await serviceTransporter.sendMail({
        from: `Sportify Kashmir <${fromEmail}>`,
        to: to,
        subject: subject,
        html: html,
      });

      console.log(`✅ Email sent via Gmail Service to ${to}: ${info.messageId}`);
      return true;
    } catch (err) {
      console.error('❌ All email delivery attempts failed:', err.message);
    }
  } else {
    console.warn("⚠️ SMTP_USER or SMTP_PASS is missing in environment variables!");
  }

  return false;
};

module.exports = sendEmail;