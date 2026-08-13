const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (to, subject, html) => {
  sendEmail.lastError = null;

  const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.BREVO_SMTP_PASS || '';
  const cleanPass = rawPass.replace(/\s+/g, '');
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || process.env.BREVO_SMTP_USER || 'warmuzamil68@gmail.com').trim();
  const fromEmail = (process.env.EMAIL_FROM || user).trim();
  
  // API Key Detections (HTTPS Port 443 - Most reliable on cloud platforms like Render & Vercel)
  const brevoApiKey = (process.env.BREVO_API_KEY || (cleanPass.startsWith('xkeysib-') ? cleanPass : null));
  const resendApiKey = (process.env.RESEND_API_KEY || (cleanPass.startsWith('re_') ? cleanPass : null));
  const sgKey = process.env.SENDGRID_API_KEY || (cleanPass.startsWith('SG.') ? cleanPass : null);

  console.log(`📧 Attempting to send email to: ${to} | Subject: ${subject}`);

  // 1. Try Brevo REST API (Port 443)
  if (brevoApiKey) {
    try {
      console.log('🚀 Sending email via Brevo REST API...');
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'Sportify Kashmir', email: fromEmail },
          to: [{ email: to }],
          subject: subject,
          htmlContent: html
        })
      });

      if (response.ok || response.status === 201 || response.status === 202) {
        console.log(`✅ Email sent via Brevo REST API to ${to}`);
        return true;
      } else {
        const errorText = await response.text();
        console.error('⚠️ Brevo REST API error status:', response.status, errorText);
        sendEmail.lastError = `Brevo REST API error (${response.status}): ${errorText}`;
      }
    } catch (brevoErr) {
      console.error('⚠️ Brevo REST API request failed:', brevoErr.message);
      sendEmail.lastError = `Brevo REST API failed: ${brevoErr.message}`;
    }
  }

  // 2. Try Resend REST API (Port 443)
  if (resendApiKey) {
    try {
      console.log('🚀 Sending email via Resend REST API...');
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `Sportify Kashmir <${fromEmail}>`,
          to: [to],
          subject: subject,
          html: html
        })
      });

      if (response.ok || response.status === 200) {
        console.log(`✅ Email sent via Resend REST API to ${to}`);
        return true;
      } else {
        const errorText = await response.text();
        console.error('⚠️ Resend REST API error status:', response.status, errorText);
        sendEmail.lastError = `Resend API error (${response.status}): ${errorText}`;
      }
    } catch (resendErr) {
      console.error('⚠️ Resend REST API request failed:', resendErr.message);
      sendEmail.lastError = `Resend API failed: ${resendErr.message}`;
    }
  }

  // 3. Try SendGrid HTTP API (Port 443)
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
        sendEmail.lastError = `SendGrid API error (${response.status}): ${errorText}`;
      }
    } catch (sgErr) {
      console.error('⚠️ SendGrid API request failed:', sgErr.message);
      sendEmail.lastError = `SendGrid API failed: ${sgErr.message}`;
    }
  }

  // 4. Try Configured SMTP Host (Brevo or Custom SMTP in env)
  const customHost = process.env.SMTP_HOST || process.env.BREVO_SMTP_HOST;
  const customPort = parseInt(process.env.SMTP_PORT || process.env.BREVO_SMTP_PORT || '587');

  if (customHost && customHost !== 'smtp.gmail.com' && cleanPass) {
    try {
      console.log(`🚀 Sending email via Custom SMTP (${customHost}:${customPort})...`);
      const customTransporter = nodemailer.createTransport({
        host: customHost,
        port: customPort,
        secure: process.env.SMTP_SECURE === 'true' || customPort === 465,
        auth: { user: user, pass: cleanPass },
        tls: { rejectUnauthorized: false },
        family: 4,
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
      });

      const info = await customTransporter.sendMail({
        from: `Sportify Kashmir <${fromEmail}>`,
        to: to,
        subject: subject,
        html: html,
      });

      console.log(`✅ Email sent via Custom SMTP (${customHost}) to ${to}: ${info.messageId}`);
      return true;
    } catch (err) {
      console.error(`⚠️ Custom SMTP (${customHost}) failed:`, err.message);
      sendEmail.lastError = `Custom SMTP (${customHost}) error: ${err.message}`;
    }
  }

  // 5. Try Gmail SMTP with Port 587 (STARTTLS)
  if (user && cleanPass) {
    try {
      console.log('🚀 Sending email via Gmail Port 587 (STARTTLS)...');
      const tlsTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user: user, pass: cleanPass },
        tls: { rejectUnauthorized: false },
        family: 4, // Force IPv4 to fix Render's IPv6 networking bugs
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
      });

      const info = await tlsTransporter.sendMail({
        from: `Sportify Kashmir <${fromEmail}>`,
        to: to,
        subject: subject,
        html: html,
      });

      console.log(`✅ Email sent via Gmail Port 587 to ${to}: ${info.messageId}`);
      return true;
    } catch (err) {
      console.error('⚠️ Gmail Port 587 failed:', err.message);
      sendEmail.lastError = `Gmail Port 587 error: ${err.message}`;

      // 6. Try Gmail SMTP with Port 465 (Direct SSL)
      try {
        console.log('🚀 Retrying email via Gmail Port 465 (Direct SSL)...');
        const sslTransporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: { user: user, pass: cleanPass },
          tls: { rejectUnauthorized: false },
          family: 4,
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 5000,
        });

        const info = await sslTransporter.sendMail({
          from: `Sportify Kashmir <${fromEmail}>`,
          to: to,
          subject: subject,
          html: html,
        });

        console.log(`✅ Email sent via Gmail Port 465 to ${to}: ${info.messageId}`);
        return true;
      } catch (err2) {
        console.error('⚠️ Gmail Port 465 failed:', err2.message);
        sendEmail.lastError = `Gmail Port 465 error: ${err2.message}`;

        // 7. Try Gmail Service transport
        try {
          console.log('🚀 Retrying email via Gmail Service transport...');
          const serviceTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: user, pass: cleanPass },
            tls: { rejectUnauthorized: false },
            family: 4,
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 5000,
          });

          const info = await serviceTransporter.sendMail({
            from: `Sportify Kashmir <${fromEmail}>`,
            to: to,
            subject: subject,
            html: html,
          });

          console.log(`✅ Email sent via Gmail Service to ${to}: ${info.messageId}`);
          return true;
        } catch (err3) {
          sendEmail.lastError = `All delivery attempts failed. Last error: ${err3.message}`;
          console.error('❌ All email delivery attempts failed:', err3.message);
        }
      }
    }
  } else {
    sendEmail.lastError = "SMTP_USER or EMAIL_USER is missing in environment variables!";
    console.warn("⚠️ SMTP_USER or SMTP_PASS is missing in environment variables!");
  }

  return false;
};

sendEmail.getLastError = () => sendEmail.lastError || "Unknown error";
module.exports = sendEmail;
