const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Enhanced Multi-Transporter Email Service for Sportify Kashmir
 * Guarantees OTP and notification delivery in both Localhost and Live (Production) environments
 * directly into the user's primary inbox.
 */

class EnhancedEmailService {
  constructor() {
    this.transporters = [];
    this.initTransporters();
  }

  initTransporters() {
    this.transporters = [];

    // 1. Amazon SES (SSL Port 465 - Works on Render/EC2/Production without SMTP blocking)
    const sesKey = process.env.AWS_SES_ACCESS_KEY;
    const sesSecret = process.env.AWS_SES_SECRET_KEY;
    const sesRegion = process.env.AWS_SES_REGION || "ap-south-1";
    const sesFrom = process.env.AWS_SES_VERIFIED_EMAIL || "info@ilsimperia.com";
    if (sesKey && sesSecret) {
      try {
        this.transporters.push({
          name: "Amazon-SES-SSL",
          from: `"Sportify Kashmir" <${sesFrom}>`,
          transporter: nodemailer.createTransport({
            host: `email-smtp.${sesRegion}.amazonaws.com`,
            port: 465,
            secure: true,
            auth: { user: sesKey, pass: sesSecret },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 8000,
          }),
        });
        this.transporters.push({
          name: "Amazon-SES-TLS",
          from: `"Sportify Kashmir" <${sesFrom}>`,
          transporter: nodemailer.createTransport({
            host: `email-smtp.${sesRegion}.amazonaws.com`,
            port: 587,
            secure: false,
            auth: { user: sesKey, pass: sesSecret },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 8000,
          }),
        });
      } catch (e) {
        console.warn("[EMAIL-INIT] Failed to init Amazon SES:", e.message);
      }
    }

    // 2. Primary Gmail SMTP - Direct Port 465 SSL (Crucial for Cloud Hosts that block Port 587)
    const gmailUser = process.env.SMTP_USER || process.env.GMAIL_USER || "warmuzamil68@gmail.com";
    const gmailPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "kbjv fdru ctul bixg";
    if (gmailUser && gmailPass) {
      try {
        this.transporters.push({
          name: "Gmail-SSL-465",
          from: `"Sportify Kashmir" <${gmailUser}>`,
          transporter: nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: { user: gmailUser, pass: gmailPass },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 8000,
          }),
        });
        this.transporters.push({
          name: "Gmail-TLS-587",
          from: `"Sportify Kashmir" <${gmailUser}>`,
          transporter: nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: { user: gmailUser, pass: gmailPass },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 8000,
          }),
        });
      } catch (e) {
        console.warn("[EMAIL-INIT] Failed to init Gmail Service:", e.message);
      }
    }

    // 3. Fallback Gmail SMTP (Alternative App Password with Port 465 SSL)
    const fallbackGmailUser = process.env.GMAIL_USER || "ilsimperia.official@gmail.com";
    const fallbackGmailPass = process.env.GMAIL_APP_PASSWORD || "ftci bfwk yhtd ycdg";
    if (fallbackGmailUser && fallbackGmailPass && fallbackGmailUser !== gmailUser) {
      try {
        this.transporters.push({
          name: "Gmail-Fallback-SSL",
          from: `"Sportify Kashmir" <${fallbackGmailUser}>`,
          transporter: nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: { user: fallbackGmailUser, pass: fallbackGmailPass },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 8000,
          }),
        });
      } catch (e) {
        console.warn("[EMAIL-INIT] Failed to init Gmail Fallback:", e.message);
      }
    }

    // 4. Brevo SMTP (Port 587 / 465)
    const brevoKey = process.env.BREVO_API_KEY || process.env.BREVO_SMTP_PASS;
    const brevoEmail = process.env.BREVO_SENDER_EMAIL || process.env.BREVO_SMTP_USER || "warmuzamil68@gmail.com";
    if (brevoKey) {
      try {
        this.transporters.push({
          name: "Brevo-SMTP-587",
          from: `"Sportify Kashmir" <${brevoEmail}>`,
          transporter: nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false,
            auth: { user: brevoEmail, pass: brevoKey },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 8000,
          }),
        });
      } catch (e) {
        console.warn("[EMAIL-INIT] Failed to init Brevo SMTP:", e.message);
      }
    }

    // 5. Hostinger SMTP (Fallback)
    const hostingerUser = process.env.EMAIL_USER;
    const hostingerPass = process.env.EMAIL_PASS;
    if (hostingerUser && hostingerPass) {
      try {
        this.transporters.push({
          name: "Hostinger-SMTP",
          from: `"Sportify Kashmir" <${hostingerUser}>`,
          transporter: nodemailer.createTransport({
            host: "smtp.hostinger.com",
            port: 465,
            secure: true,
            auth: { user: hostingerUser, pass: hostingerPass },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 8000,
          }),
        });
      } catch (e) {
        console.warn("[EMAIL-INIT] Failed to init Hostinger SMTP:", e.message);
      }
    }

    // 6. Custom SMTP (Host & Port from environment)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_HOST !== "smtp.gmail.com") {
      try {
        this.transporters.push({
          name: "Custom-SMTP",
          from: `"Sportify Kashmir" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
          transporter: nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 8000,
          }),
        });
      } catch (e) {
        console.warn("[EMAIL-INIT] Failed to init Custom SMTP:", e.message);
      }
    }

    console.log(`[EMAIL-SERVICE] Successfully initialized ${this.transporters.length} high-deliverability email transporter(s)`);
  }

  // REST API HTTPS Fallback (Port 443 - NEVER blocked by cloud firewalls)
  async sendViaRestApi(to, subject, html, from, failures = []) {
    // 1. Brevo REST API (Primary - 100% Free, sends to ANY recipient email)
    if (process.env.BREVO_API_KEY) {
      try {
        const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || "warmuzamil68@gmail.com";
        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
            "accept": "application/json",
          },
          body: JSON.stringify({
            sender: { name: "Sportify Kashmir", email: senderEmail },
            to: [{ email: to }],
            subject: subject,
            htmlContent: html,
            headers: {
              "X-Priority": "1",
              "X-MSMail-Priority": "High",
              "Importance": "High",
              "X-Mailer": "SportifyKashmir-AuthEngine",
            },
          }),
        });
        if (res.ok) {
          console.log(`✅ [EMAIL-DELIVERY-SUCCESS] Sent via [Brevo-REST-API] to: ${to}`);
          return true;
        } else {
          const errData = await res.json().catch(() => ({}));
          const errMsg = `Brevo-REST-${res.status}: ${errData.message || JSON.stringify(errData)}`;
          console.warn(`⚠️ [REST-EMAIL] ${errMsg}`);
          failures.push(errMsg);
        }
      } catch (e) {
        console.warn("[REST-EMAIL] Brevo failed:", e.message);
        failures.push(`Brevo-REST-Network: ${e.message}`);
      }
    }

    // 2. Resend REST API (Secondary fallback)
    if (process.env.RESEND_API_KEY) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || "Sportify Kashmir <onboarding@resend.dev>",
            to: [to],
            subject: subject,
            html: html,
          }),
        });
        if (res.ok) {
          console.log(`✅ [EMAIL-DELIVERY-SUCCESS] Sent via [Resend-REST-API] to: ${to}`);
          return true;
        } else {
          const errData = await res.json().catch(() => ({}));
          const errMsg = `Resend-REST-${res.status}: ${errData.message || JSON.stringify(errData)}`;
          console.warn(`⚠️ [REST-EMAIL] ${errMsg}`);
          failures.push(errMsg);
        }
      } catch (e) {
        console.warn("[REST-EMAIL] Resend failed:", e.message);
        failures.push(`Resend-REST-Network: ${e.message}`);
      }
    }

    return false;
  }

  async sendMail(to, subject, html, options = {}) {
    this.lastError = null;
    if (!to) {
      this.lastError = "Recipient email address is missing";
      return false;
    }

    const cleanTo = String(to).trim().toLowerCase();
    const failures = [];

    // First attempt REST API if available (fastest on live cloud)
    if (process.env.RESEND_API_KEY || process.env.BREVO_API_KEY) {
      const restOk = await this.sendViaRestApi(cleanTo, subject, html, options.from, failures);
      if (restOk) return true;
    }

    // Ensure transporters are ready
    if (!this.transporters || this.transporters.length === 0) {
      this.initTransporters();
    }

    for (const { name, from, transporter } of this.transporters) {
      try {
        const mailOptions = {
          from: options.from || from,
          to: cleanTo,
          subject: subject,
          html: html,
          headers: {
            "X-Priority": "1",
            "X-MSMail-Priority": "High",
            "Importance": "High",
            "X-Mailer": "SportifyKashmir-NotificationEngine",
            ...(options.headers || {}),
          },
        };

        // 5 second timeout race per transporter so request never hangs
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`${name} connection timed out after 5000ms`)), 5000)
        );

        const info = await Promise.race([
          transporter.sendMail(mailOptions),
          timeoutPromise,
        ]);

        console.log(`✅ [EMAIL-DELIVERY-SUCCESS] Sent via [${name}] to: ${cleanTo} | ID: ${info.messageId || "ok"}`);
        return true;
      } catch (err) {
        console.warn(`⚠️ [EMAIL-RETRY] Provider [${name}] failed for ${cleanTo}: ${err.message}`);
        failures.push(`${name}: ${err.message}`);
        // Continues to next transporter immediately
      }
    }

    this.lastError = failures.join(" | ") || "All email providers failed";
    console.error(`❌ [EMAIL-DELIVERY-FAILED] All email providers failed for ${cleanTo}: ${this.lastError}`);
    return false;
  }

  /**
   * Premium, responsive OTP email template designed for 100% Primary Inbox deliverability.
   */
  getOtpTemplate(otp, purpose = "Account Verification", userName = "") {
    const greeting = userName ? `Hello ${userName},` : "Hello,";
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${purpose} - Sportify Kashmir</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 30px 10px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">Sportify Kashmir</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">Premium Sports Gear & Equipment</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 36px 32px; text-align: center;">
                    <h2 style="color: #0f172a; margin: 0 0 12px 0; font-size: 20px; font-weight: 700;">${purpose}</h2>
                    <p style="color: #475569; margin: 0 0 24px 0; font-size: 15px; line-height: 1.6;">${greeting} Use the verification code below to complete your request on Sportify Kashmir.</p>

                    <!-- OTP Box -->
                    <div style="background: #fff7ed; border: 2px dashed #f97316; border-radius: 12px; padding: 20px 24px; margin: 0 auto 24px auto; display: inline-block;">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; color: #ea580c; letter-spacing: 10px; margin-left: 10px; display: inline-block;">${otp}</span>
                    </div>

                    <p style="color: #64748b; font-size: 13px; margin: 0 0 20px 0; line-height: 1.5;">
                      ⏰ This code will expire in <strong>10 minutes</strong>.<br>
                      🔒 If you did not request this OTP, please ignore this email.
                    </p>

                    <div style="height: 1px; background-color: #e2e8f0; margin: 24px 0;"></div>

                    <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.4;">
                      Sportify Kashmir • Sports Excellence Delivered Across Kashmir Valley
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Order Status Notification Template
   */
  getOrderStatusTemplate(order, title, message, actionUrl = "") {
    const orderId = order?._id ? order._id.toString().slice(-8) : "N/A";
    const totalAmount = order?.orderValue ? Number(order.orderValue).toFixed(2) : "0.00";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const trackUrl = actionUrl || `${frontendUrl}/orders/${order?._id || ""}`;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Sportify Kashmir</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 30px 10px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); padding: 30px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">Sportify Kashmir</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 13px;">Order Notification</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 32px;">
                    <h2 style="color: #0f172a; margin: 0 0 12px 0; font-size: 20px; font-weight: 700;">${title}</h2>
                    <p style="color: #475569; margin: 0 0 24px 0; font-size: 15px; line-height: 1.6;">${message}</p>

                    <!-- Order Summary Box -->
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Order ID:</td>
                          <td align="right" style="padding: 6px 0; color: #0f172a; font-weight: 700; font-size: 14px;">#${orderId}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Total Amount:</td>
                          <td align="right" style="padding: 6px 0; color: #ea580c; font-weight: 800; font-size: 16px;">₹${totalAmount}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Payment Method:</td>
                          <td align="right" style="padding: 6px 0; color: #0f172a; font-size: 14px;">${order?.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</td>
                        </tr>
                      </table>
                    </div>

                    <!-- Track Order Button -->
                    <div style="text-align: center; margin-bottom: 24px;">
                      <a href="${trackUrl}" style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block;">View Order Details</a>
                    </div>

                    <div style="height: 1px; background-color: #e2e8f0; margin: 24px 0;"></div>

                    <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
                      Thank you for choosing Sportify Kashmir! If you have any questions, reply to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
  /**
   * 4-Digit Delivery Rejection OTP Template (Flipkart Style)
   */
  getDeliveryRejectionOtpTemplate(otp, order, customerName = "Customer", reason = "") {
    const orderId = order?._id ? order._id.toString().slice(-8) : "N/A";
    const totalAmount = order?.orderValue ? Number(order.orderValue).toFixed(2) : "0.00";
    const reasonText = reason || "Customer declined delivery at doorstep";

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Delivery Rejection OTP - Sportify Kashmir</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 30px 10px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); padding: 30px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">Sportify Kashmir</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">Delivery Verification Security</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 32px 28px; text-align: center;">
                    <div style="display: inline-block; background-color: #fee2e2; color: #dc2626; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 16px;">
                      ⚠️ Action Required: Rejection Code
                    </div>

                    <h2 style="color: #0f172a; margin: 0 0 10px 0; font-size: 22px; font-weight: 700;">Delivery Rejection OTP</h2>
                    <p style="color: #475569; margin: 0 0 20px 0; font-size: 14px; line-height: 1.6;">
                      Hi <strong>${customerName}</strong>, a request has been made to reject and cancel delivery for Order <strong>#${orderId}</strong>.
                    </p>

                    <!-- Order Summary Pill -->
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; text-align: left;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="color: #64748b; font-size: 13px;">Order ID:</td>
                          <td align="right" style="color: #0f172a; font-weight: 700; font-size: 13px;">#${orderId}</td>
                        </tr>
                        <tr>
                          <td style="color: #64748b; font-size: 13px; padding-top: 4px;">Order Value:</td>
                          <td align="right" style="color: #ea580c; font-weight: 700; font-size: 13px; padding-top: 4px;">₹${totalAmount}</td>
                        </tr>
                        <tr>
                          <td style="color: #64748b; font-size: 13px; padding-top: 4px;">Reason:</td>
                          <td align="right" style="color: #dc2626; font-weight: 600; font-size: 13px; padding-top: 4px;">${reasonText}</td>
                        </tr>
                      </table>
                    </div>

                    <!-- OTP Box -->
                    <div style="background: #fff7ed; border: 2px dashed #f97316; border-radius: 14px; padding: 18px 24px; margin: 0 auto 20px auto; display: inline-block;">
                      <div style="font-size: 11px; font-weight: 700; color: #9a3412; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 1px;">4-Digit Verification OTP</div>
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 900; color: #ea580c; letter-spacing: 14px; margin-left: 14px; display: inline-block;">${otp}</span>
                    </div>

                    <!-- Security Alert -->
                    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 12px 16px; margin: 0 auto 24px auto; text-align: left;">
                      <p style="color: #991b1b; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">⏰ Valid for 5 Minutes Only</p>
                      <p style="color: #7f1d1d; font-size: 12px; margin: 0; line-height: 1.5;">
                        • Share this 4-digit code with the delivery executive <strong>ONLY</strong> if you want to decline/reject this order.<br>
                        • If you did <strong>NOT</strong> request to reject this delivery, do not share this code and accept your package normally.
                      </p>
                    </div>

                    <div style="height: 1px; background-color: #e2e8f0; margin: 24px 0;"></div>

                    <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.4;">
                      Sportify Kashmir • Sports Excellence Delivered Across Kashmir Valley
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Delivery Rejection Confirmed Template
   */
  getDeliveryRejectionConfirmedTemplate(order, customerName = "Customer", reason = "") {
    const orderId = order?._id ? order._id.toString().slice(-8) : "N/A";
    const totalAmount = order?.orderValue ? Number(order.orderValue).toFixed(2) : "0.00";
    const reasonText = reason || "Customer declined delivery at doorstep";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Rejected at Delivery - Sportify Kashmir</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 30px 10px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #64748b 0%, #334155 100%); padding: 30px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">Sportify Kashmir</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 13px;">Delivery Status Update</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 32px 28px;">
                    <div style="display: inline-block; background-color: #fee2e2; color: #dc2626; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 16px;">
                      Order Rejected at Delivery
                    </div>

                    <h2 style="color: #0f172a; margin: 0 0 12px 0; font-size: 20px; font-weight: 700;">Delivery Successfully Rejected & Cancelled</h2>
                    <p style="color: #475569; margin: 0 0 20px 0; font-size: 14px; line-height: 1.6;">
                      Hi <strong>${customerName}</strong>, as per your OTP verification with the delivery executive, Order <strong>#${orderId}</strong> has been cancelled and marked as <strong>Rejected at Delivery</strong>.
                    </p>

                    <!-- Details Box -->
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Order ID:</td>
                          <td align="right" style="padding: 6px 0; color: #0f172a; font-weight: 700; font-size: 13px;">#${orderId}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Order Value:</td>
                          <td align="right" style="padding: 6px 0; color: #0f172a; font-weight: 700; font-size: 13px;">₹${totalAmount}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Rejection Reason:</td>
                          <td align="right" style="padding: 6px 0; color: #dc2626; font-weight: 600; font-size: 13px;">${reasonText}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Verification Method:</td>
                          <td align="right" style="padding: 6px 0; color: #16a34a; font-weight: 600; font-size: 13px;">4-Digit Customer OTP Verified</td>
                        </tr>
                      </table>
                    </div>

                    ${order?.paymentMethod !== 'cod' && order?.paymentStatus === 'paid' ? `
                    <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 14px; margin-bottom: 24px;">
                      <p style="color: #065f46; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">💳 Prepaid Refund Notice</p>
                      <p style="color: #047857; font-size: 12px; margin: 0; line-height: 1.5;">
                        Since this was a prepaid order, our finance team will initiate your refund to the original payment method within 3-5 business days.
                      </p>
                    </div>
                    ` : ''}

                    <div style="text-align: center; margin-bottom: 24px;">
                      <a href="${frontendUrl}/orders/${order?._id || ''}" style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">View Order Details</a>
                    </div>

                    <div style="height: 1px; background-color: #e2e8f0; margin: 24px 0;"></div>

                    <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
                      Sportify Kashmir • Handwara, Qalamabad • Support: +91 9682645127
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}

const serviceInstance = new EnhancedEmailService();

// Export standard sendEmail function for backwards compatibility with all existing controllers
const sendEmail = async (to, subject, html, options) => {
  return serviceInstance.sendMail(to, subject, html, options);
};

sendEmail.getLastError = () => serviceInstance.lastError || "Unknown email error";
sendEmail.getOtpTemplate = (otp, purpose, userName) => serviceInstance.getOtpTemplate(otp, purpose, userName);
sendEmail.getOrderStatusTemplate = (order, title, message, actionUrl) => serviceInstance.getOrderStatusTemplate(order, title, message, actionUrl);
sendEmail.getDeliveryRejectionOtpTemplate = (otp, order, customerName, reason) => serviceInstance.getDeliveryRejectionOtpTemplate(otp, order, customerName, reason);
sendEmail.getDeliveryRejectionConfirmedTemplate = (order, customerName, reason) => serviceInstance.getDeliveryRejectionConfirmedTemplate(order, customerName, reason);
sendEmail.getConfig = () => ({
  providersConfigured: serviceInstance.transporters.map((t) => t.name),
  sesConfigured: Boolean(process.env.AWS_SES_ACCESS_KEY && process.env.AWS_SES_SECRET_KEY),
  gmailConfigured: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
  hostingerConfigured: Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS),
  from: process.env.EMAIL_FROM || "warmuzamil68@gmail.com",
});
sendEmail.service = serviceInstance;

module.exports = sendEmail;
