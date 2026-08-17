const nodemailer = require("nodemailer");
require("dotenv").config();

const value = (...names) => names.map((name) => process.env[name]).find((v) => v != null && String(v).trim() !== "");
const clean = (v) => (v == null ? "" : String(v).trim());

function getEmailConfig() {
  const password = clean(value("SMTP_PASS", "SMTP_PASSWORD", "EMAIL_PASS", "BREVO_SMTP_PASS"));
  const user = clean(value("SMTP_USER", "SMTP_USERNAME", "EMAIL_USER", "EMAIL_USERNAME", "BREVO_SMTP_USER"));
  const host = clean(value("SMTP_HOST", "BREVO_SMTP_HOST"));
  const port = Number(value("SMTP_PORT", "BREVO_SMTP_PORT") || 587);
  const from = clean(value("EMAIL_FROM", "SMTP_FROM")) || user;
  return { host, port, user, password, from, secure: String(process.env.SMTP_SECURE).toLowerCase() === "true" || port === 465 };
}

function smtpTransport(config) {
  if (!config.host || !config.user || !config.password) return null;
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
    // Hosted platforms commonly restrict direct SMTPS (465). Keep connection
    // failures bounded and let Gmail fall back to STARTTLS on port 587.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

function gmailStartTlsTransport(config) {
  if (config.host !== "smtp.gmail.com" || config.port === 587) return null;
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user: config.user, pass: config.password },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

async function sendViaHttp(url, options, provider) {
  try {
    const response = await fetch(url, options);
    if (response.ok) return { sent: true, error: "" };
    const body = await response.text();
    return { sent: false, error: `${provider} API ${response.status}: ${body || response.statusText}` };
  } catch (error) {
    return { sent: false, error: `${provider} request failed: ${error.message}` };
  }
}

async function sendEmail(to, subject, html) {
  sendEmail.lastError = null;
  const config = getEmailConfig();
  const from = config.from;
  const failures = [];
  if (!to) failures.push("Recipient email is missing");
  if (!from) failures.push("EMAIL_FROM (or SMTP_USER) is missing");

  const brevoKey = clean(process.env.BREVO_API_KEY);
  if (brevoKey && from && to) {
    const result = await sendViaHttp("https://api.brevo.com/v3/smtp/email", { method: "POST", headers: { accept: "application/json", "api-key": brevoKey, "content-type": "application/json" }, body: JSON.stringify({ sender: { name: "Sportify Kashmir", email: from }, to: [{ email: to }], subject, htmlContent: html }) }, "Brevo");
    if (result.sent) return true;
    failures.push(result.error);
  }

  const resendKey = clean(process.env.RESEND_API_KEY);
  if (resendKey && from && to) {
    const result = await sendViaHttp("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: `Sportify Kashmir <${from}>`, to: [to], subject, html }) }, "Resend");
    if (result.sent) return true;
    failures.push(result.error);
  }

  const transporter = smtpTransport(config);
  if (transporter && to && from) {
    try {
      const info = await transporter.sendMail({ from: `Sportify Kashmir <${from}>`, to, subject, html });
      console.log(`[email] accepted by SMTP provider: ${info.messageId || "no-message-id"}`);
      return true;
    } catch (error) {
      failures.push(`SMTP ${config.host}:${config.port}: ${error.message}`);

      // Gmail SMTPS on 465 is frequently blocked by hosted deployments. Retry
      // with Gmail's STARTTLS endpoint, which is the supported production path.
      const fallback = gmailStartTlsTransport(config);
      if (fallback) {
        try {
          const info = await fallback.sendMail({ from: `Sportify Kashmir <${from}>`, to, subject, html });
          console.log(`[email] accepted by Gmail STARTTLS fallback: ${info.messageId || "no-message-id"}`);
          return true;
        } catch (fallbackError) {
          failures.push(`SMTP smtp.gmail.com:587: ${fallbackError.message}`);
        }
      }
    }
  } else if (!transporter) {
    failures.push("SMTP is not configured: set SMTP_HOST, SMTP_PORT, SMTP_USER/SMTP_USERNAME, SMTP_PASS/SMTP_PASSWORD and EMAIL_FROM");
  }

  sendEmail.lastError = failures.join(" | ") || "No email provider configured";
  console.error(`[email] delivery failed for ${to || "<missing recipient>"}: ${sendEmail.lastError}`);
  return false;
}

sendEmail.getLastError = () => sendEmail.lastError || "Unknown email error";
sendEmail.getConfig = () => { const c = getEmailConfig(); return { host: c.host || null, port: c.port, userConfigured: Boolean(c.user), passwordConfigured: Boolean(c.password), from: c.from || null, brevoApiConfigured: Boolean(process.env.BREVO_API_KEY), resendConfigured: Boolean(process.env.RESEND_API_KEY) }; };
module.exports = sendEmail;
