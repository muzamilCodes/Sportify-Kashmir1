# ⚙️ Sportify Kashmir — Backend API Server & Engine

> **RESTful API Engine, Real-Time Notifications & Payment Processor**  
> *Engineered with Node.js, Express.js, MongoDB Atlas with Mongoose ODM, Razorpay Payment Gateway, Cloudinary CDN, Nodemailer, and Twilio WhatsApp Alerts.*

---

## 📑 Table of Contents

1. [🌟 Architecture Overview](#-architecture-overview)
2. [🗄️ Database Models & Schemas](#️-database-models--schemas)
3. [🌐 Complete API Endpoint Reference](#-complete-api-endpoint-reference)
4. [💳 Payment & Wallet Logic](#-payment--wallet-logic)
5. [🔔 Email & WhatsApp Notification Engine](#-email--whatsapp-notification-engine)
6. [🛠️ Environment Variables Configuration](#️-environment-variables-configuration)
7. [🚀 Running Locally & Production Deployment](#-running-locally--production-deployment)

---

## 🌟 Architecture Overview

- **Port**: `4000` (Default)
- **Database**: MongoDB Atlas (Connection via Mongoose ODM)
- **Media Engine**: Cloudinary CDN with Multer file uploads
- **Authentication**: JWT (JSON Web Tokens) with BCrypt password hashing
- **Payments**: Razorpay Node SDK (Order creation, signature verification, webhooks)
- **Communications**: Nodemailer (SMTP / Gmail App Password) & Twilio WhatsApp Gateway

---

## 🗄️ Database Models & Schemas

### 1. `User` Schema (`models/userModel.js`)
```javascript
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  
  // Real Saved Payment Methods
  savedCards: [{
    cardHolder: String,
    cardNumber: String,
    expiryDate: String,
    cardType: String,
    bankName: String,
    createdAt: { type: Date, default: Date.now }
  }],
  savedUpi: [{
    vpa: String,
    name: String,
    provider: String,
    createdAt: { type: Date, default: Date.now }
  }],
  savedBankAccounts: [{
    accountHolder: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    branchName: String,
    createdAt: { type: Date, default: Date.now }
  }],

  // Real Sportify Wallet (Base 0)
  walletBalance: { type: Number, default: 0 },
  walletTransactions: [{
    title: String,
    type: { type: String, enum: ["credit", "debit"], default: "credit" },
    amount: Number,
    date: String,
    status: { type: String, default: "Completed" },
    paymentMethod: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
```

---

## 🌐 Complete API Endpoint Reference

### 👤 Customer & Auth (`/user`)
- `POST /user/register` — Register a new customer account
- `POST /user/login` — Login user & return JWT token
- `GET /user/profile` — Fetch authenticated customer profile
- `PUT /user/profile` — Update customer username, phone, or password
- `GET /user/payment-methods` — Retrieve saved cards, UPI IDs, bank accounts & wallet
- `POST /user/add-card` — Save new ATM / Credit / Debit card
- `DELETE /user/delete-card/:id` — Delete saved card
- `POST /user/add-upi` — Link UPI ID (VPA)
- `DELETE /user/delete-upi/:id` — Remove linked UPI ID
- `POST /user/add-bank` — Link bank account details
- `DELETE /user/delete-bank/:id` — Remove bank account
- `POST /user/wallet/recharge` — Add funds to Sportify Pay wallet via Razorpay
- `POST /user/wallet/withdraw` — Payout from wallet to bank or UPI

### 🏏 Products Catalog (`/product`)
- `GET /product/getAll` — Get all products with filters & pagination
- `GET /product/getById/:id` — Get single product specifications & reviews
- `POST /product/create` — Create product with Cloudinary image uploads (Admin)
- `PUT /product/update/:id` — Update product details (Admin)
- `DELETE /product/delete/:id` — Delete product from database (Admin)

### 📦 Orders & Fulfillment (`/orders`)
- `POST /orders/create` — Place new order (COD, Razorpay, or Sportify Wallet)
- `GET /orders/my-orders` — Logged in customer order history
- `GET /orders/:id` — View single order tracking details
- `PUT /orders/update-status/:id` — Update order fulfillment status (Admin)

---

## 🛠️ Environment Variables Configuration (`.env`)

```env
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sportify
JWT_SECRET=your_super_secret_jwt_key

# Cloudinary CDN Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Nodemailer SMTP Email Dispatcher
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM=Sportify Kashmir <noreply@sportifykashmir.com>

# Twilio WhatsApp Notifications (Optional)
TWILIO_ACCOUNT_SID=AC_your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=+14155238886
```

---

## 🚀 Running Locally & Production Deployment

```bash
# 1. Install dependencies
npm install

# 2. Start in development mode
npm run dev

# 3. Start in production mode
npm start
```

### Production Deployment (Render)
1. Push `server` directory to GitHub.
2. Create Web Service in Render.
3. Build Command: `npm install`
4. Start Command: `node index.js`
5. Configure all `.env` variables in Render dashboard.
6. Deploy!

---

## 📄 License
Copyright © 2026 **Sportify Kashmir**. MIT License.
