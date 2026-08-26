# 🏆 SPORTIFY KASHMIR — Ultimate Full-Stack E-Commerce Platform

> **Premier Kashmir Sports Equipment & Gear E-Commerce Platform**  
> Built with modern architecture, luxury design system, real-time multi-channel notification engine, OTP-verified checkout, full admin governance suite, and Progressive Web App (PWA) capabilities.

---

## 📑 Table of Contents

1. [🌟 Executive Overview](#-executive-overview)
2. [🎨 Complete Design System & Theme Engine](#-complete-design-system--theme-engine)
   - [Brand & Semantic Color Palette (HEX & RGBA)](#brand--semantic-color-palette)
   - [Light vs Dark Mode Surface Tokens](#light-vs-dark-mode-surface-tokens)
   - [Typography & Fluid Font Scale](#typography--fluid-font-scale)
   - [Box Shadows, Border Radii & Elevation](#box-shadows-border-radii--elevation)
   - [Animation Keyframes & Micro-interactions](#animation-keyframes--micro-interactions)
3. [🏗️ Project Architecture & Tech Stack](#️-project-architecture--tech-stack)
4. [🗄️ Database Schemas & Models (Mongoose)](#️-database-schemas--models-mongoose)
5. [🌐 Complete REST API Endpoint Reference](#-complete-rest-api-endpoint-reference)
6. [🔔 Real-Time In-App & Multi-Channel Notification Engine](#-real-time-in-app--multi-channel-notification-engine)
7. [🛍️ Customer E-Commerce Feature Suite](#️-customer-e-commerce-feature-suite)
8. [🛡️ Executive Admin Dashboard & Operations Suite](#️-executive-admin-dashboard--operations-suite)
9. [💳 Checkout, Payments & Verification Flows](#-checkout-payments--verification-flows)
10. [📱 PWA & Mobile Native Experience](#-pwa--mobile-native-experience)
11. [⚙️ Environment Variables & Setup Guide](#️-environment-variables--setup-guide)
12. [🚀 Running Locally & Production Deployment](#-running-locally--production-deployment)

---

## 🌟 Executive Overview

**Sportify Kashmir** is an end-to-end e-commerce ecosystem designed specifically for sports enthusiasts, professional academies, and retail customers across Jammu & Kashmir and pan-India. It delivers high-grade Kashmir Willow cricket bats, football gear, badminton equipment, sports apparel, and wholesale academy supply with sub-second page loads, real-time order tracking, and instant multi-channel alerts (In-App, Email, WhatsApp).

---

## 🎨 Complete Design System & Theme Engine

### Brand & Semantic Color Palette

| Token Name | Light Theme HEX | Dark Theme HEX | CSS Variable | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Brand Primary (Flame Orange)** | `#F97316` | `#FB923C` | `--color-brand-primary` | Main buttons, primary badges, highlights, CTA accents |
| **Brand Secondary (Crimson Red)** | `#EF4444` | `#F87171` | `--color-brand-secondary` | Gradient endpoints, sale badges, urgent alerts |
| **Brand Gradient** | `linear-gradient(135deg, #F97316, #EF4444)` | `linear-gradient(135deg, #FB923C, #EF4444)` | `--color-brand-gradient` | Primary hero CTAs, price tags, active indicators |
| **Success Green** | `#10B981` | `#34D399` | `--color-success` | Order delivered, in-stock pills, payment verified |
| **Warning Amber** | `#F59E0B` | `#FBBF24` | `--color-warning` | Pending orders, low stock warnings, COD verification |
| **Error / Destructive** | `#EF4444` | `#F87171` | `--color-error` | Cancelled orders, rejection notices, delete triggers |
| **Info / Tech Blue** | `#3B82F6` | `#60A5FA` | `--color-info` | Order shipped status, user registration notices |
| **Special / Broadcast Purple** | `#9333EA` | `#A855F7` | N/A | Store announcements, feature broadcasts, promo badges |

### Light vs Dark Mode Surface Tokens

```css
/* ─── Light Mode Surfaces (Default) ─── */
--color-bg-primary: #f9fafb;      /* Page background (Cool Gray 50) */
--color-bg-secondary: #ffffff;    /* Card & Modal backgrounds */
--color-bg-tertiary: #f3f4f6;     /* Input fields & strip headers */
--color-bg-elevated: #ffffff;     /* Sticky navbars & floating menus */
--color-bg-overlay: rgba(0, 0, 0, 0.5); /* Modal backdrops */

--color-text-primary: #111827;    /* High-contrast headings & labels (Gray 900) */
--color-text-secondary: #4b5563;  /* Subtitles & description text (Gray 600) */
--color-text-tertiary: #9ca3af;   /* Placeholders & timestamps (Gray 400) */
--color-text-inverted: #ffffff;   /* Text on dark buttons */

--color-border-primary: #e5e7eb;  /* Card dividers & subtle borders (Gray 200) */
--color-border-secondary: #d1d5db;/* Input field borders (Gray 300) */
--color-border-focus: #f97316;    /* Active input focus rings */

/* ─── Dark Mode Surfaces (.dark) ─── */
--color-bg-primary: #0f172a;      /* Slate 900 dark background */
--color-bg-secondary: #1e293b;    /* Slate 800 cards & containers */
--color-bg-tertiary: #334155;     /* Slate 700 inputs & hover states */
--color-bg-elevated: #1e293b;     /* Elevated dropdown menus */
--color-bg-overlay: rgba(0, 0, 0, 0.7);

--color-text-primary: #f1f5f9;    /* Slate 100 high-contrast text */
--color-text-secondary: #94a3b8;  /* Slate 400 body descriptions */
--color-text-tertiary: #64748b;   /* Slate 500 metadata */
--color-text-inverted: #0f172a;

--color-border-primary: #334155;  /* Slate 700 borders */
--color-border-secondary: #475569;/* Slate 600 input borders */
--color-border-focus: #fb923c;    /* Orange focus highlight */
```

### Typography & Fluid Font Scale

The design utilizes a **Fluid Responsive Clamp Scale** providing natural proportions across mobile phones, tablets, laptops, and 4K displays:

| Scale Class | Fluid CSS Clamp | Desktop Pixels | Mobile Pixels | Weight & Leading |
| :--- | :--- | :--- | :--- | :--- |
| `.heading-page` | `clamp(1.875rem, 4vw, 2.25rem)` | **36px** | **30px** | `800 (ExtraBold)`, `line-height: 1.2` |
| `.heading-section` | `clamp(1.5rem, 3vw, 1.75rem)` | **28px** | **24px** | `700 (Bold)`, `line-height: 1.25` |
| `.product-price` | `clamp(1.125rem, 2.5vw, 1.375rem)` | **22px** | **18px** | `700 (Bold)`, `line-height: 1.2` |
| `.product-title` | `clamp(0.9375rem, 2vw, 1rem)` | **16px** | **15px** | `600 (SemiBold)`, `line-height: 1.35` |
| `.body-text` | `clamp(0.875rem, 1.5vw, 1rem)` | **16px** | **14px** | `400–500 (Regular)`, `line-height: 1.5` |
| `.btn-text` / `.nav-text`| `clamp(0.875rem, 1.2vw, 0.9375rem)` | **15px** | **14px** | `600 (SemiBold)`, `line-height: 1.4` |
| `Metadata / Badges` | `0.6875rem – 0.75rem` | **11px–12px** | **10px–11px** | `800 (ExtraBold)`, uppercase |

### Box Shadows, Border Radii & Elevation

- `--radius-sm`: `0.5rem` (8px) — Buttons, tags, inline badges
- `--radius-md`: `0.75rem` (12px) — Input inputs, notification items, quick-filter chips
- `--radius-lg`: `1rem` (16px) — Product cards, banner tiles
- `--radius-xl`: `1.5rem` (24px) — Modal dialogs, notification dropdowns, checkout blocks
- `--radius-full`: `9999px` — Avatars, pill badges, icon circles
- `--shadow-brand`: `0 4px 20px rgba(249, 115, 22, 0.25)` — Vibrant orange glowing CTAs
- `Glassmorphism (.glass)`: `backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.8); border: 1px solid rgba(255, 255, 255, 0.5);`

### Animation Keyframes & Micro-interactions

- **`fadeInUp`**: Smooth 0.4s entrance for cards and page transitions (`translateY(20px) -> 0`).
- **`shimmer`**: Infinite gradient wave for skeleton loaders during API queries.
- **`pulseGlow`**: High-priority alert pulsing effect for unread badges and live status alerts.
- **`float`**: Subtle hovering effect (`translateY(-15px)`) for featured sports gear showcases.
- **`scaleIn`**: Bouncy modal zoom-in (`scale(0.9) -> scale(1.0)`).

---

## 🏗️ Project Architecture & Tech Stack

```
NEWSportify/
├── main/                           # 🌐 Next.js 14+ Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/             # Login, Signup, OTP Verify, Forgot Password
│   │   │   ├── (main)/             # Public Store (Home, Products, Cart, Checkout, Notifications, Orders)
│   │   │   ├── admin/              # Admin Workspace (Orders, Inventory, Broadcasts, Users, Analytics)
│   │   │   ├── globals.css         # Complete Design Tokens & Theme Engine
│   │   │   └── layout.tsx          # Root Layout with Theme Providers & Notification Polling
│   │   └── components/
│   │       ├── admin/              # Admin Notification Center, Order Editors, Banner Form
│   │       ├── shared/             # Header, Footer, NotificationCenter, ProductCard, SearchBar
│   │       └── ui/                 # Accessible Radix Primitives, Modals, Buttons, Sliders
│   └── package.json
│
└── server/                         # ⚙️ Node.js + Express REST Backend
    ├── config/                     # MongoDB connection with failover resilience
    ├── controllers/                # Business logic controllers
    ├── middlewares/                # JWT Auth, Admin Verification, Multer Storage
    ├── models/                     # 17 Mongoose Data Models
    ├── routes/                     # REST API Routers
    ├── utilities/                  # Email Transporters, WhatsApp Gateway, Notification Engine
    ├── index.js                    # Server Bootstrapper & CORS Setup
    └── package.json
```

### Technology Matrix

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14+ (App Router)** | SSR, Streaming, React Server Components, TypeScript |
| **Styling & Icons** | **Tailwind CSS + Lucide React** | Fluid clamp typography, dark mode auto-inversion, icons |
| **Backend Runtime** | **Node.js 20+ & Express.js** | RESTful routing, CORS security, non-blocking async events |
| **Database & ODM** | **MongoDB Atlas + Mongoose 8** | Schemas with indexing, aggregate pipelines, optimistic locks |
| **Authentication** | **JWT & Bcrypt + OTP Engine** | 4-digit email OTPs, Bearer token auth, role-based access |
| **Multi-Email Engine** | **Nodemailer + SendGrid + Resend** | 7-tier failover transporter pool, HTML branded email receipts |
| **WhatsApp Dispatch**| **Twilio API + REST Fallbacks** | Direct order delivery alerts to customer mobile numbers |
| **Media Management** | **Cloudinary API** | Automatic WebP optimization, multi-image product gallery |
| **Progressive Web App**| **@ducanh2912/next-pwa** | Service worker, offline catalog browsing, installable app |

---

## 🗄️ Database Schemas & Models (Mongoose)

### 1. `Notification` (`notificationModel.js`)
- `recipientType`: `'user' | 'admin' | 'all'`
- `userId`: ObjectId reference to `User` (for individual user notifications)
- `title`: String (e.g. `🎉 Order Confirmed!`)
- `message`: Detailed description text
- `type`: `'order_created' | 'order_status' | 'user_registered' | 'website_update' | 'promo' | 'alert' | 'system'`
- `data`: Metadata payload (`orderId`, `orderNumber`, `orderValue`, `status`, `customerName`, `email`)
- `link`: Optional deep-link destination URL
- `isRead`: Boolean (for user & admin specific items)
- `readBy`: `[ObjectId]` (tracks individual user reads for global broadcasts)
- `deletedBy`: `[ObjectId]` (tracks dismissals for global broadcasts)

### 2. `Order` (`orderModel.js`)
- `orderId`: Human-readable identifier (e.g. `SK-994812`)
- `userId`: Ref to `User` (or guest metadata)
- `products`: Array of `{ productId, name, price, quantity, size, weight, image }`
- `orderValue`: Total amount (Subtotal + Shipping - Discounts)
- `paymentMethod`: `'cod' | 'razorpay' | 'stripe' | 'upi'`
- `paymentStatus`: `'pending' | 'paid' | 'failed' | 'refunded'`
- `orderStatus`: `'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'rejected'`
- `shippingAddress`: Full shipping address object with GPS coordinates
- `deliveryOtp`: 4-digit secure handshake OTP for COD verification/rejection
- `notificationLog`: Idempotency tracking array preventing duplicate messages

### 3. `User` (`userModel.js`)
- `username`: Customer full name
- `email`: Normalized unique email address
- `password`: Bcrypt hashed password
- `mobile`: Contact phone number (used for WhatsApp & SMS alerts)
- `isAdmin`: Boolean role flag
- `isVerified`: Boolean (true after email OTP confirmation)
- `otp`: 4-digit authentication code
- `otpExpiry`: Expiry timestamp (10 minutes window)
- `addresses`: Array of saved delivery addresses

### 4. `Product` (`productModel.js`)
- `name`: Product title (e.g. `Kashmir Willow Pro Grade Edition Bat`)
- `slug`: URL-friendly unique slug
- `description`: Full HTML product specifications
- `price`: Selling price
- `originalPrice`: MRP before discount
- `category`: Ref to `Category`
- `brand`: Ref to `Brand`
- `stock`: Current available inventory quantity
- `lowStockThreshold`: Minimum stock level triggering admin restock alerts
- `productImgUrls`: Cloudinary image gallery array
- `ratings`: Average star rating & total review count

---

## 🌐 Complete REST API Endpoint Reference

### 🔔 Notifications & Announcements (`/notifications`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | User / Admin | Get paginated user notifications & broadcast history with unread count |
| `PUT` | `/notifications/:id/read` | User / Admin | Mark single user notification as read |
| `PUT` | `/notifications/read-all` | User / Admin | Mark all user notifications as read |
| `DELETE` | `/notifications/:id` | User / Admin | Dismiss single notification |
| `GET` | `/notifications/admin` | Admin Only | Get real-time admin activity feed (New users, orders, cancellations) |
| `PUT` | `/notifications/admin/:id/read`| Admin Only | Mark admin alert as read |
| `PUT` | `/notifications/admin/read-all`| Admin Only | Mark all admin activity alerts as read |
| `DELETE`| `/notifications/admin/:id`| Admin Only | Dismiss admin alert |
| `POST`| `/notifications/broadcast` | Admin Only | Compose and broadcast website update/promo to all users |
| `GET` | `/notifications/broadcasts`| Admin Only | Get all broadcast campaign history |
| `DELETE`| `/notifications/broadcast/:id`| Admin Only | Delete broadcast campaign |

### 🔐 Authentication & Accounts (`/api/users`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/register` | Public | Register new customer & dispatch 4-digit OTP email |
| `POST` | `/api/users/verify-otp` | Public | Verify OTP, activate account, trigger Admin alert & User welcome |
| `POST` | `/api/users/login` | Public | Login with email/password and receive JWT token |
| `POST` | `/api/users/forgot-password`| Public | Send password reset OTP code |
| `POST` | `/api/users/reset-password` | Public | Reset account password via OTP |
| `GET` | `/api/users/profile` | Auth User | Get current logged-in customer profile |
| `PUT` | `/api/users/profile` | Auth User | Update profile details (Name, mobile, avatar) |

### 🛍️ Orders & Fulfillment (`/api/orders`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Auth / Guest | Place a new order (COD or Online), trigger notifications |
| `GET` | `/api/orders` | Auth User | Get order history for current customer |
| `GET` | `/api/orders/:id` | Auth User | Get detailed order invoice & live timeline tracking |
| `PUT` | `/api/orders/:id/cancel` | Auth User | Request customer-side cancellation |
| `GET` | `/api/orders/admin/all` | Admin Only | Get master order table with filters, search, and status counters |
| `PUT` | `/api/orders/admin/:id/status`| Admin Only | Update status (`Confirmed`, `Shipped`, `Delivered`) |
| `POST` | `/api/orders/verify-delivery-otp`| Delivery/Admin| 4-digit OTP verification for COD delivery or rejection |

### 📦 Products & Catalog (`/api/products`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | Query products with filtering, search, category, brand, sorting |
| `GET` | `/api/products/:id` | Public | Get single product specification & reviews |
| `POST` | `/api/products` | Admin Only | Create new sports product with Cloudinary images |
| `PUT` | `/api/products/:id` | Admin Only | Update product details, pricing, and inventory |
| `DELETE`| `/api/products/:id` | Admin Only | Remove product from store |

---

## 🔔 Real-Time In-App & Multi-Channel Notification Engine

### 1. Dual-Channel Architecture

```
                                  [EVENT OCCURS]
                  (User Registration / Order Placement / Status Change)
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
        [In-App Notification Engine]            [Multi-Channel Dispatcher]
                    │                                       │
        ┌───────────┴───────────┐               ┌───────────┴───────────┐
        ▼                       ▼               ▼                       ▼
 [User Bell Feed]       [Admin Activity Feed] [Branded HTML Email]   [WhatsApp Alert]
 (Unread Badges,        (New Orders, Users,   (High Deliverability   (Order Confirmed,
  Live Polling 20s)      Restock Alerts)       Transporter Pool)      Out for Delivery)
```

### 2. Event Triggers & Notification Matrix

| Life-Cycle Event | User Experience | Admin Experience |
| :--- | :--- | :--- |
| **New User Registration** | 🔔 Welcome notification in bell + ✉️ Branded Welcome Email | 🔔 Activity Alert *"New User Registered: [Name]"* + ✉️ **Admin New User Email Alert** with full contact details |
| **Order Placed ("Maine yeh order kiya")** | 🔔 Bell Alert *"Order Placed Successfully (#SK-...)"* + ✉️ **Order Confirmation Email Receipt** with product breakdown | 🔔 Activity Alert *"New Order Received: #SK-... (₹...)"* + ✉️ **Admin Invoice Email Alert** with shipping address |
| **Order Shipped ("Order kahan pahuncha")** | 🔔 Status update in bell *"🚚 Order Shipped!"* with tracking button + ✉️ Shipped status email + 📱 WhatsApp Alert | 📊 Status automatically updated in Admin Orders Dashboard |
| **Order Delivered / Completed** | 🔔 Bell alert *"✅ Order Delivered!"* + ✉️ Delivery confirmation email | 📊 Marked as Completed in fulfillment reports |
| **Website Updates & Sale Announcements** | 🔔 Store Update card in bell dropdown with **"View Update 📢"** button | 📢 Created via Admin Broadcast Composer (`/admin/notifications`) with optional mass email blast |

---

## 🛍️ Customer E-Commerce Feature Suite

- **High-Performance Home Page**: Hero sliders, flash sale countdown timers, sports category pills, trending Kashmir Willow showcases.
- **Smart Catalog & Filter Engine**: Price range slider, brand checkboxes, category hierarchy, in-stock only filter, rating filter.
- **Unified Notification Bell**:
  - Located in the top header bar (Desktop & Mobile).
  - Unread badge with real-time polling every 20 seconds.
  - Interactive tabs: **All**, **Orders 📦**, **Store Updates 📢**, **Unread 🔴**.
  - Expandable message view without forced page redirection.
  - Direct **"Track Order 📦"** and **"View Update 📢"** action buttons.
- **Dedicated Full Notification Page (`/notifications`)**: Full-screen view with search and filter controls.
- **Interactive Cart & Drawer**: Persistent local storage cart with quantity modifiers, coupon code applicator, and subtotal calculation.
- **Live Order Tracking**: Visual timeline tracker (`Pending -> Confirmed -> Shipped -> Out for Delivery -> Delivered`).
- **Wishlist & Compare**: Save favorites and compare bat weights, grain count, and willow grades side-by-side.
- **Academy Wholesale Request (`/wholesale`)**: Dedicated bulk order enquiry portal for cricket academies and schools.

---

## 🛡️ Executive Admin Dashboard & Operations Suite

- **Command Center Dashboard (`/admin`)**:
  - Live revenue metrics, total orders count, active customers count, and inventory valuation.
  - Interactive sales graphs and low-stock warning tables.
- **Admin Notification Center (`<AdminNotificationCenter />`)**:
  - Embedded directly in the top header bar of `/admin`.
  - Immediate activity stream for every new customer signup, new order placed, and cancellation.
- **Broadcast & Alerts Center (`/admin/notifications`)**:
  - **Announcement Composer**: Create broadcast updates with Title, Message, Category, and Action URL.
  - **Live User Preview**: Real-time visual mockup showing how the announcement appears on mobile devices.
  - **Optional Email Blast**: Checkbox to simultaneously deliver the announcement to all registered customer inboxes.
  - **Broadcast History**: Delete or audit past store announcements.
- **Order Management & Fulfillment**:
  - View full customer address with Google Maps directions.
  - Status updater with automatic customer email and in-app triggers.
  - Price adjuster and refund manager for prepaid returns.
- **Inventory & Catalog Control**:
  - Cloudinary drag-and-drop image uploader.
  - Bulk stock modifier and low-stock threshold triggers.
- **Customer CRM (`/admin/users`)**: Search, block/unblock, view order history of any registered user.

---

## 💳 Checkout, Payments & Verification Flows

1. **Cash on Delivery (COD)**:
   - Zero advance payment required.
   - Generates a **4-Digit Secure Delivery Handshake OTP** sent to customer email & mobile.
   - Delivery agent verifies the OTP upon delivery for 100% fraud protection.
2. **Online Prepaid Payments**:
   - Integrated Razorpay gateway (UPI, Google Pay, PhonePe, Paytm, Credit/Debit Cards, Netbanking).
   - Automatic webhook verification and instant invoice generation.
3. **Prepaid Refund Tracking**:
   - If a prepaid order is cancelled, a refund ledger is created, and customer receives an automated refund timeline notice.

---

## 📱 PWA & Mobile Native Experience

- **Installable Progressive Web App (PWA)**: Works as a standalone app on iOS, Android, macOS, and Windows.
- **Offline Catalog Mode**: Service worker caches static assets, product images, and recent catalog items.
- **App-Like Navigation**: Mobile bottom navigation bar with quick access to Home, Search, Cart, Wishlist, and Profile.
- **Safe Area Inset Adaptation**: Full compatibility with iPhone notch and Android gesture navigation bars.

---

## ⚙️ Environment Variables & Setup Guide

### 1. Server Configuration (`server/.env`)

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGO_URI=mongodb://localhost:27017/sportify_kashmir

# JWT Secrets
JWT_SECRET=your_jwt_super_secret_key_here
JWT_EXPIRATION=7d

# Primary Admin Notification Email
ADMIN_NOTIFICATION_EMAIL=warmuzamil68@gmail.com
ADMIN_EMAIL=warmuzamil68@gmail.com

# SMTP Email Transporters (Gmail / Hostinger / SendGrid / Resend)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_test_xxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Twilio WhatsApp Gateway (Optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### 2. Frontend Configuration (`main/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxx
```

---

## 🚀 Running Locally & Production Deployment

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **MongoDB**: Local MongoDB community server or MongoDB Atlas URI
- **Package Manager**: `npm` or `yarn`

### 2. Installation & Local Development

```bash
# Clone the official repository
git clone https://github.com/muzamilCodes/Sportify-Kashmir1.git
cd NEWSportify

# 1. Start the Backend API Server
cd server
npm install
npm run dev

# 2. Start the Frontend Next.js Server (in a new terminal)
cd ../main
npm install
npm run dev
```

- **Frontend Application**: `http://localhost:3000`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **Backend API**: `http://localhost:4000`

### 3. Production Build

```bash
# Build Frontend
cd main
npm run build
npm start

# Run Backend in Production
cd ../server
npm start
```

---

## 📄 License & Maintainer

- **Brand**: **Sportify Kashmir** (Handwara, Qalamabad, Kashmir)
- **Support & Inquiries**: `+91 9682645127` / `warmuzamil68@gmail.com`
- **License**: ISC License • Developed with ❤️ for Kashmir Sports
