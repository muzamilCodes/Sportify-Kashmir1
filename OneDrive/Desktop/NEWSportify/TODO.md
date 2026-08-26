# TODO & Feature Status — Sportify Kashmir

- [x] **Product Reviews & 5-Star Ratings**:
  - Interactive star rating picker (1-5 stars), review title, and detailed comments.
  - Review summary with verified average rating and review counter on Product Detail page (`/product/[id]`).
  - Backend API: `GET /reviews/:productId` and `POST /reviews/:productId`.

- [x] **Product Comparison for 2–4 Products**:
  - Compare action button on all product cards with max 4 products selection limit.
  - Dedicated comparison page (`/compare`) side-by-side specs, price comparison, rating, and stock status.
  - Persistent sticky comparison bar with floating badge.

- [x] **Recently Viewed Products**:
  - Tracks viewed items in localStorage on product page visits.
  - Displayed on Product Details page and Storefront with thumbnail, price, and direct link.

- [x] **“You May Also Like” Recommendations**:
  - Curated category-based and sports-gear product recommendations on Product Details and Order Tracking pages.

- [x] **Smart Live Search Suggestions**:
  - Real-time debounced autocomplete search in Header with live product thumbnail, price, discount badge, category, and direct navigation.

- [x] **Product Quick View**:
  - Quick View modal directly from product card with product preview, price, description, and instant Add to Cart.

- [x] **Pincode-based Delivery Availability & Estimated Delivery Date**:
  - Interactive pincode checker on product details page calculating estimated delivery date based on region/Kashmir zones.

- [x] **“Only X Left” Low-Stock Indicator**:
  - Urgency indicators when stock is between 1 and 5 items (`Only X left`).

- [x] **Back-in-Stock Notifications**:
  - Out of stock notification subscription box on product details page triggering `POST /stock-notifications/:productId`.

- [x] **Downloadable Order Invoice PDF**:
  - Clean, professional Tax Invoice generator with instant print / Save as PDF capability on My Orders (`/orders`) and Order Detail page (`/orders/[orderId]`).

- [x] **Guest Checkout**:
  - Frictionless guest address & order placement supporting both COD and Razorpay payments without mandatory login.

- [x] **WhatsApp & Email Order Notifications**:
  - Integrated notification dispatcher sending formatted order confirmation, status updates, and tracking links to customer WhatsApp & Email.

- [x] **PWA Support with Installable Web App**:
  - Complete `manifest.json`, high-res maskable app icons, viewport configurations, and background service worker registration (`sw.js`).

- [x] **Proper 404, Loading, Empty, and Error States**:
  - Sports-themed 404 Not Found, global 500 error boundary with retry, animated loading screens, and rich empty states for cart/wishlist/orders.
