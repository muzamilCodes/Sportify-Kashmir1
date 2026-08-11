const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (to, subject, html) => {
  const cleanPass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || '').replace(/\s+/g, '');
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || 'warmuzamil68@gmail.com').trim();
  const fromEmail = (process.env.EMAIL_FROM || user).trim();
  const brevoPass = (process.env.BREVO_SMTP_PASS || '').trim();
  const brevoApiKey = (process.env.BREVO_API_KEY || (brevoPass.startsWith('xkeysib-') ? brevoPass : null));
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();

  console.log(`📧 Attempting to send email to: ${to} | Subject: ${subject}`);

  // 1. Try Brevo REST API (Most reliable on cloud environments like Render & Vercel, Port 443)
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
      }
    } catch (brevoErr) {
      console.error('⚠️ Brevo REST API request failed:', brevoErr.message);
    }
  }

  // 2. Try Resend REST API if key is present (Port 443)
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
      }
    } catch (resendErr) {
      console.error('⚠️ Resend REST API request failed:', resendErr.message);
    }
  }

  // 3. Try SendGrid HTTP API if key (starting with SG.) is present
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

  // 4. Try Brevo SMTP if host and pass are configured
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
        connectionTimeout: 4000,
        greetingTimeout: 3000,
        socketTimeout: 4000,
      });

      const info = await brevoTransporter.sendMail({
        from: `Sportify Kashmir <${fromEmail}>`,
        to: to,
        subject: subject,
        html: html,
      });

      console.log(`✅ Email sent via Brevo SMTP to ${to}: ${info.messageId}`);
      return true;
    } catch (err) {
      console.error('⚠️ Brevo SMTP failed, falling back:', err.message);
    }
  }

  // 5. Try Gmail SMTP with Port 587 (STARTTLS) - Often allowed by cloud providers
  if (user && cleanPass) {
    try {
      console.log('🚀 Sending email via Gmail Port 587 (STARTTLS)...');
      const tlsTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: { user: user, pass: cleanPass },
        tls: { rejectUnauthorized: false },
        family: 4, // Force IPv4 to fix Render's IPv6 networking bugs
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
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
      
      // 6. Try Gmail SMTP with Port 465 (Direct SSL)
      try {
        console.log('🚀 Retrying email via Gmail Port 465 (Direct SSL)...');
        const sslTransporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: { user: user, pass: cleanPass },
          tls: { rejectUnauthorized: false },
          family: 4, // Force IPv4
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 10000,
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
        
        // 7. Try Gmail Service
        try {
          console.log('🚀 Retrying email via Gmail Service transport...');
          const serviceTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: user, pass: cleanPass },
            family: 4, // Force IPv4
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
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
          sendEmail.lastError = err3.message;
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