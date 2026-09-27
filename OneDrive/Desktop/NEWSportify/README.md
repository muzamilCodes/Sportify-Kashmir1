# 🏆 SPORTIFY KASHMIR — Premier Full-Stack Sports E-Commerce Platform

> **The Valley's #1 Destination for Handcrafted Kashmir Willow Cricket Bats, Professional Sports Equipment, Athletic Apparel & Academy Supply**  
> *Engineered with Next.js 16 (Turbopack), Tailwind CSS v4, TypeScript, Express.js, MongoDB Atlas, Mongoose ODM, Razorpay Payments, Cloudinary CDN, and Progressive Web App (PWA) Capabilities.*

---

## 📑 Table of Contents

1. [🌟 Executive Overview & Brand Vision](#-executive-overview--brand-vision)
2. [🎨 Complete Design System & Visual Tokens](#-complete-design-system--visual-tokens)
   - [Brand & Semantic Color Palette (HEX, RGB & Tokens)](#brand--semantic-color-palette)
   - [Light vs Dark Mode Surface Tokens](#light-vs-dark-mode-surface-tokens)
   - [Typography & Fluid Responsive Clamp Scale](#typography--fluid-responsive-clamp-scale)
   - [Elevation, Box Shadows & Glassmorphic Radii](#elevation-box-shadows--glassmorphic-radii)
3. [🏗️ Full-Stack Technology Architecture](#️-full-stack-technology-architecture)
4. [🛍️ Customer E-Commerce Feature Suite (A to Z)](#️-customer-e-commerce-feature-suite-a-to-z)
5. [💳 Payment & Account Details Suite](#-payment--account-details-suite)
6. [📱 Bulletproof Progressive Web App (PWA) Engine](#-bulletproof-progressive-web-app-pwa-engine)
7. [🛡️ Executive Admin Governance Panel](#️-executive-admin-governance-panel)
8. [🔔 Multi-Channel Real-Time Notification Hub](#-multi-channel-real-time-notification-hub)
9. [🗄️ Database Schemas & Data Models (Mongoose)](#️-database-schemas--data-models-mongoose)
10. [🌐 Complete REST API Endpoint Reference](#-complete-rest-api-endpoint-reference)
11. [⚙️ Environment Variables Reference Guide](#️-environment-variables-reference-guide)
12. [🚀 Local Setup & Installation](#-local-setup--installation)
13. [🚢 Production Cloud Deployment Guide](#-production-cloud-deployment-guide)

---

## 🌟 Executive Overview & Brand Vision

**Sportify Kashmir** is an end-to-end e-commerce and academy supply ecosystem built specifically for sports enthusiasts, professional athletes, and training academies across Jammu & Kashmir and pan-India.

- **Handcrafted Kashmir Willow Bats**: Premium cleft selection, grain profiling, hand-pressed power bows, and toe guards.
- **Zero-Friction Fast Checkout**: Razorpay payment gateway (Cards, NetBanking, UPI), Cash on Delivery (COD), and **Sportify Pay** digital wallet.
- **Cross-Platform PWA**: App-store experience with 1-tap installation, dynamic QR Code scanning for mobile cameras, and offline resiliency.
- **Executive Admin Governance**: Real-time inventory tracking, multi-image Cloudinary uploads, order fulfillment pipelines, and customer payment auditing.

---

## 🎨 Complete Design System & Visual Tokens

### Brand & Semantic Color Palette

| Color Name | Light HEX | Dark HEX | CSS Token | Usage & Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Brand Primary (Flame Orange)** | `#F97316` | `#FB923C` | `--color-brand-primary` | Primary buttons, active tabs, brand icons, key CTA accents |
| **Brand Primary Dark** | `#EA580C` | `#EA580C` | `--color-brand-primary-dark`| Button hover states, border highlights |
| **Brand Secondary (Crimson Red)** | `#EF4444` | `#F87171` | `--color-brand-secondary` | Gradient endpoints, sale badges, urgent alerts, deletions |
| **Brand Gradient** | `linear-gradient(135deg, #F97316, #EF4444)` | `linear-gradient(135deg, #FB923C, #EF4444)` | `--color-brand-gradient` | Hero banners, primary action pills, floating badges |
| **Success Emerald** | `#10B981` | `#34D399` | `--color-success` | Order delivered, in-stock badge, verified payment |
| **Tech / Info Blue** | `#3B82F6` | `#60A5FA` | `--color-info` | Order shipped status, linked bank accounts badge |
| **Warning Amber** | `#F59E0B` | `#FBBF24` | `--color-warning` | Pending order state, low-stock warnings, COD confirmation |
| **Slate Dark Surface** | `#0F172A` | `#0F172A` | `--color-bg-primary (dark)` | Dark mode background, high-contrast navbar base |

### Light vs Dark Mode Surface Tokens

```css
/* ─── Light Mode Theme Surfaces (Default) ─── */
--color-bg-primary: #f9fafb;        /* Page Canvas (Cool Gray 50) */
--color-bg-secondary: #ffffff;      /* Card, Dialog & Modal surfaces */
--color-bg-tertiary: #f3f4f6;       /* Input backgrounds & subheaders */
--color-bg-elevated: #ffffff;       /* Sticky navbars & floating menus */
--color-bg-overlay: rgba(0, 0, 0, 0.6); /* Backdrop blur overlays */

--color-text-primary: #111827;      /* Headings & prominent labels (Gray 900) */
--color-text-secondary: #4b5563;    /* Subtitles & descriptions (Gray 600) */
--color-text-tertiary: #9ca3af;     /* Placeholders & timestamps (Gray 400) */
--color-text-inverted: #ffffff;     /* Contrast text on dark backgrounds */

--color-border-primary: #e5e7eb;    /* Surface borders & dividers (Gray 200) */
--color-border-secondary: #d1d5db;  /* Form input borders (Gray 300) */
--color-border-focus: #f97316;      /* Active input focus ring */

/* ─── Dark Mode Theme Surfaces (.dark) ─── */
--color-bg-primary: #0f172a;        /* Deep Slate 900 canvas */
--color-bg-secondary: #1e293b;      /* Slate 800 cards & panels */
--color-bg-tertiary: #334155;       /* Slate 700 inputs & chip buttons */
--color-bg-elevated: #1e293b;       /* Elevated menus & dropdowns */
--color-bg-overlay: rgba(0, 0, 0, 0.75);

--color-text-primary: #f8fafc;      /* Slate 50 high-contrast headings */
--color-text-secondary: #94a3b8;    /* Slate 400 body content */
--color-text-tertiary: #64748b;     /* Slate 500 metadata */
--color-text-inverted: #0f172a;

--color-border-primary: #334155;    /* Slate 700 borders */
--color-border-secondary: #475569;  /* Slate 600 input borders */
--color-border-focus: #fb923c;      /* Flame Orange focus highlight */
```

### Typography & Fluid Responsive Clamp Scale

| Scale Role | Font Family | Fluid CSS Clamp Scale | Desktop Size | Mobile Size | Font Weight & Leading |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Brand Hero Headings** | `Outfit` | `clamp(2rem, 4.5vw, 2.75rem)` | **44px** | **32px** | `900 (Black)`, `leading-tight` |
| **Page / Section Titles**| `Outfit` | `clamp(1.5rem, 3vw, 1.875rem)` | **30px** | **24px** | `800 (ExtraBold)`, `leading-snug` |
| **Product Prices** | `Outfit` | `clamp(1.25rem, 2.5vw, 1.5rem)` | **24px** | **20px** | `800 (Bold)`, `leading-none` |
| **Body & UI Descriptions**| `Plus Jakarta Sans / DM Sans` | `clamp(0.875rem, 1.5vw, 1rem)` | **16px** | **14px** | `500 (Medium)`, `leading-relaxed` |
| **Navigation & Buttons** | `Plus Jakarta Sans` | `clamp(0.8125rem, 1.2vw, 0.9375rem)`| **15px** | **13px** | `700 (Bold)`, `leading-none` |
| **VPAs, Cards & Code** | `JetBrains Mono` | `0.75rem – 0.875rem` | **14px** | **12px** | `700 (Bold)`, `tracking-wider` |

### Elevation, Box Shadows & Glassmorphic Radii
- **Rounded Radii**: `rounded-2xl` (16px), `rounded-3xl` (24px), `rounded-full` (999px pill buttons).
- **Shadow Elevations**:
  - `shadow-md shadow-orange-500/25` — Button ambient glow.
  - `shadow-2xl shadow-black/20` — Elevated modals & dialogs.
  - `backdrop-blur-xl` — Frosted glass navbar & floating navigation bar.

---

## 🏗️ Full-Stack Technology Architecture

```
                                  ┌─────────────────────────────────────────┐
                                  │       SPORTIFY KASHMIR ECOSYSTEM        │
                                  └─────────────────────────────────────────┘
                                                       │
                 ┌─────────────────────────────────────┴─────────────────────────────────────┐
                 │                                                                           │
                 ▼                                                                           ▼
  ┌───────────────────────────────┐                                           ┌───────────────────────────────┐
  │      FRONTEND CLIENT          │                                           │     BACKEND REST SERVER       │
  │        (Port 3000)            │                                           │         (Port 4000)           │
  ├───────────────────────────────┤                                           ├───────────────────────────────┤
  │ • Next.js 16.2.3 (Turbopack)  │   ◄──────── HTTPS / JSON API ────────►   │ • Node.js + Express.js REST   │
  │ • React 18 / 19 & Tailwind v4 │                                           │ • MongoDB Atlas + Mongoose    │
  │ • Dynamic PWA & sw.js Caching │                                           │ • JWT Authentication & BCrypt │
  │ • Lucide Icons + React Toast  │                                           │ • Cloudinary Image Storage    │
  │ • QR Code Engine + Confetti   │                                           │ • Razorpay Payment Gateway    │
  │ • Multi-Language Support      │                                           │ • Nodemailer SMTP & Twilio WA │
  └───────────────────────────────┘                                           └───────────────────────────────┘
```

---

## 🛍️ Customer E-Commerce Feature Suite (A to Z)

1. **🏏 Handcrafted Kashmir Willow Cricket Bats**: Premium cricket gear catalog featuring grade specifications, short handle, scoop profiles, double blade, leather ball match bats, and tennis ball punchers.
2. **⚡ Amazon-Style Quick Category Bar**: Horizontal smooth-scrolling category discoverability (Cricket, Football, Badminton, Gym & Fitness, Tennis, Athletic Apparel, Accessories).
3. **🎡 Lucky Spin Wheel & Rewards**: Gamified prize wheel where users win discount coupons, free shipping promo codes, and cashback credited to their Sportify Pay Wallet.
4. **🤖 Rufus AI Sports Assistant**: AI assistant offering tailored advice on bat pickup weight, shoe spikes sizing, and training gear selection.
5. **🔔 Live Sales Activity Popups**: Real-time notification toasts showcasing recent customer orders across Srinagar, Anantnag, Baramulla, and pan-India.
6. **🛒 Interactive Cart & Wishlist**: Real-time quantity updating, instant price calculations, coupon code discounts, and persistent wishlist drawer.
7. **📍 Intelligent Checkout & Address Management**: GPS auto-detection, saved addresses switcher, PIN code validation, Cash on Delivery verification, and Razorpay modal.
8. **🚚 Real-Time Order Tracking & Invoice**: Live order lifecycle tracking with step-by-step progress timeline and downloadable invoices.

---

## 💳 Payment & Account Details Suite

Located directly inside the customer profile, the **Payment & Account Details** modal provides complete control over saved payment methods:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⬅️ Back    💳 Payment & Account Details                         🔄  ✖       │
│ ATM Cards, UPI IDs, Bank Accounts & Wallet                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ [ 💳 ATM / Cards (0) ]  [ 📱 UPI IDs (0) ]  [ 🏦 Bank Accounts (0) ]  [ ⚡ Wallet (₹0.00) ] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  • ATM / Debit Cards  : Save 16-digit card details for express 1-click buy  │
│  • Linked UPI IDs     : Link Google Pay, PhonePe, Paytm, BHIM VPAs          │
│  • Bank Accounts      : Link J&K Bank / SBI for direct tournament payouts   │
│  • Sportify Pay       : Clean ₹0.00 base wallet, recharge & withdrawal     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ← Back to Profile                                              [ Done ]    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Highlights:
- **Dedicated Back Navigation**: Top-left `< Back` button and bottom `← Back to Profile` buttons ensure smooth return to profile on both mobile and desktop.
- **Zero Fake / Default Amounts**: Wallet balance starts at real **₹0.00** with no artificial welcome bonus transactions.
- **Empty State UX**: Clean *"No Wallet Transactions Recorded"* when transaction history is empty.

---

## 📱 Bulletproof Progressive Web App (PWA) Engine

Sportify Kashmir provides a true app-store grade native experience without requiring app store installation:

1. **Android (Chrome, Edge, Samsung)**:
   - Early global event listener in `<head>` captures `beforeinstallprompt` into `window.__pwaInstallPrompt`.
   - 1-Tap native installation prompt with success celebration & confetti.
   - Step-by-step 3-dots Chrome guide (`Menu ⋮` ➔ `Install app` / `Add to Home screen`).
2. **iPhone & iPad (iOS Safari)**:
   - Visual 3-step guide: Tap Safari Share button (`↗`) ➔ Scroll and tap *"Add to Home Screen"* ➔ Tap *"Add"*.
3. **Desktop (Chrome / Edge / Mac)**:
   - Address bar install icon hint `(💻 ⬇ / ⊕)`.
   - **Dynamic QR Code Generator**: Generates high-contrast QR codes dynamically so desktop users can scan with their phone camera to instantly install the app on mobile!
4. **In-App Browser Detection**:
   - Detects Instagram, Facebook, and WhatsApp webviews and prompts users to open in native Chrome/Safari.

---

## 🛡️ Executive Admin Governance Panel (`/admin`)

- **📊 Dashboard Analytics**: Total revenue KPIs, sales charts, total orders, active customer counts, and pending delivery queues.
- **🏏 Product Inventory Manager**: Complete CRUD operations, multi-image Cloudinary uploads, discount prices, stock counts, and SKU management.
- **📦 Order Processing Pipeline**: Real-time status updater (`Pending` ➔ `Confirmed` ➔ `Shipped` ➔ `Out for Delivery` ➔ `Delivered` ➔ `Cancelled`) with automated customer notifications.
- **👥 User & Payment Auditing**: Inspect registered customers, active accounts, verified KYC status, and submitted payment methods.
- **🏷️ Category & Brand Taxonomy**: Organize sport categories and manufacturing brands dynamically.

---

## 🔔 Multi-Channel Real-Time Notification Hub

- **📧 Transactional Email Dispatcher**: Branded HTML order confirmation emails, shipment tracking details, and password reset OTPs via Nodemailer (SMTP / Gmail App Password).
- **💬 WhatsApp Order Alerts**: Real-time order receipts and delivery updates via Twilio WhatsApp Gateway.
- **🔔 In-App Notification Center**: Filterable in-app notification drawer with unread counters.

---

## 🗄️ Database Schemas & Data Models (Mongoose)

### 1. `User` Schema ([`server/models/userModel.js`](file:///c:/Users/warmu/OneDrive/Desktop/NEWSportify/server/models/userModel.js))
```javascript
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  
  // Real Saved Payment Accounts
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

  // Real Sportify Wallet (Default: 0)
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

## 🌐 Complete REST API Endpoint Reference

### 🔐 User & Authentication (`/user`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/user/register` | Register new customer account | Public |
| `POST` | `/user/login` | Authenticate user & return JWT token | Public |
| `GET` | `/user/profile` | Retrieve authenticated user profile | Bearer Token |
| `PUT` | `/user/profile` | Update username, mobile, password | Bearer Token |
| `GET` | `/user/payment-methods` | Fetch saved cards, UPI IDs, bank accounts & wallet | Bearer Token |
| `POST` | `/user/add-card` | Save ATM / Credit / Debit card | Bearer Token |
| `DELETE` | `/user/delete-card/:id` | Delete saved card | Bearer Token |
| `POST` | `/user/add-upi` | Link new UPI VPA address | Bearer Token |
| `DELETE` | `/user/delete-upi/:id` | Remove linked UPI address | Bearer Token |
| `POST` | `/user/add-bank` | Link bank account details | Bearer Token |
| `DELETE` | `/user/delete-bank/:id` | Delete bank account | Bearer Token |
| `POST` | `/user/wallet/recharge` | Top-up Sportify Pay digital wallet | Bearer Token |
| `POST` | `/user/wallet/withdraw` | Withdraw wallet funds to bank or UPI | Bearer Token |

### 🏏 Products & Catalog (`/product`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/product/getAll` | Retrieve paginated products with category/brand filters | Public |
| `GET` | `/product/getById/:id` | Get detailed product specifications & reviews | Public |
| `POST` | `/product/create` | Add new product with Cloudinary images | Admin Only |
| `PUT` | `/product/update/:id` | Update product inventory, pricing & details | Admin Only |
| `DELETE` | `/product/delete/:id` | Delete product from store catalog | Admin Only |

### 📦 Orders & Fulfillment (`/orders`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders/create` | Place new order (COD, Razorpay, or Wallet) | Bearer Token |
| `GET` | `/orders/my-orders` | Fetch customer personal order history | Bearer Token |
| `GET` | `/orders/:id` | View single order tracking details | Bearer Token |
| `PUT` | `/orders/update-status/:id`| Update order status (Confirmed, Shipped, Delivered) | Admin Only |

---

## ⚙️ Environment Variables Reference Guide

### Frontend Client (`main/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### Backend REST API Server (`server/.env`)
```env
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sportify
JWT_SECRET=your_jwt_secret_key

# Cloudinary CDN Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay Payments
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

## 🚀 Local Setup & Installation

### 1. Clone Repository
```bash
git clone https://github.com/muzamilCodes/Sportify-Kashmir1.git
cd Sportify-Kashmir1
```

### 2. Run Backend Server
```bash
cd server
npm install
npm run dev
# Server running on http://localhost:4000
```

### 3. Run Frontend Client
```bash
cd ../main
npm install
npm run dev
# Frontend running on http://localhost:3000
```

---

## 🚢 Production Cloud Deployment Guide

### Deploy Frontend to Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Set Root Directory to `main`.
3. Add Environment Variable: `NEXT_PUBLIC_API_URL=https://your-backend-domain.onrender.com`.
4. Deploy!

### Deploy Backend to Render
1. Create a Web Service on [Render](https://render.com).
2. Set Root Directory to `server`.
3. Build Command: `npm install`
4. Start Command: `node index.js`
5. Configure environment variables from `server/.env`.
6. Deploy!

---

## 📄 License & Ownership
Copyright © 2026 **Sportify Kashmir**. All rights reserved.  
Licensed under the [MIT License](LICENSE).
