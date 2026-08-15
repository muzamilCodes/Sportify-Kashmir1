

## Express Project

This is an Mern Stack project. Below are the required environment variables for configuration of server ,
In the Server Folder create .env File and paste these variables with your own credentials 

```env
SECRET_KEY=""
PORT=""
CLOUDINARY_URI=""
SMTP_USERNAME=""
SMTP_PASSWORD=""
SMTP_HOST=""
SMTP_PORT=""
```

### Getting Started

1. Clone the repository.
2. Install dependencies:
    ```bash
    npm install
    ```
3. Create a `.env` file in the root directory and add the above environment variables.
4. Start the server:
    ```bash
    npm run dev
    ```

### Environment Variables

- **SECRET_KEY**: Secret key for your application.
- **PORT**: Port number for the server.
- **CLOUDINARY_URI**: Cloudinary connection string.
- **SMTP_USERNAME**: SMTP username for sending emails.
- **SMTP_PASSWORD**: SMTP password for sending emails.
- **SMTP_HOST**: SMTP server host.
- **SMTP_PORT**: SMTP server port.

### Production notifications

The deployed service must run `node index.js` from this `server` directory and define the following variables in Render/Vercel (values are never committed):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=verified-sender@example.com
SMTP_PASS=provider-app-password
EMAIL_FROM=verified-sender@example.com

# Either Twilio WhatsApp or the configured WhatsApp gateway
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=+14155238886
# Required for production WhatsApp messages outside the 24-hour window
TWILIO_WHATSAPP_CONTENT_SID=HX...
TWILIO_WHATSAPP_CONTENT_VARIABLES={"1":"{{message}}"}
# Alternative gateway:
# WHATSAPP_API_URL=https://...
# WHATSAPP_API_TOKEN=...
```

Check `GET /health/notifications` after deployment. It reports only whether credentials are configured (never their values). Each order notification stores the provider's actual error in `notificationLog.error`; order persistence is not rolled back when a provider is unavailable.

### License

This project is licensed under the MIT License.
