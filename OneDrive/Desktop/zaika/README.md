# Zaika Restaurant Platform

Production-oriented full-stack restaurant ordering platform for Zaika Restaurant, Handwara, Jammu & Kashmir, India.

## Structure

- `frontend/` - React 19 + Vite + Tailwind + Framer Motion
- `backend/` - Node.js + Express + MongoDB + Mongoose

## Folder Structure

- `frontend/src/components/`
- `frontend/src/pages/`
- `frontend/src/services/`
- `frontend/src/hooks/`
- `frontend/src/store/`
- `frontend/src/layouts/`
- `frontend/src/assets/`
- `backend/src/controllers/`
- `backend/src/routes/`
- `backend/src/models/`
- `backend/src/middleware/`
- `backend/src/services/`
- `backend/src/config/`
- `backend/src/utils/`

## Features

- Customer ordering, cart, checkout, payments, reservations, and order tracking
- JWT auth with refresh tokens and protected routes
- Reservation booking with email OTP verification, no registration required
- Admin dashboard for menu, orders, reservations, coupons, and customers
- Cloudinary uploads, Razorpay payments, Google Maps, and invoice generation

## Quick Start

1. Copy env files from `frontend/.env.example` and `backend/.env.example`
2. Install dependencies in both apps
3. Run backend with `npm run dev` inside `backend/`
4. Run frontend with `npm run dev` inside `frontend/`

## Environment Variables

### Backend

- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `RESERVATION_OTP_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `CORS_ORIGIN`
- `CLIENT_URL`

### Frontend

- `VITE_API_URL`
- `VITE_RAZORPAY_KEY_ID`
- `VITE_GOOGLE_MAPS_EMBED_URL`

## Deployment

- Frontend: Vercel, Netlify, or any static host
- Backend: Render, Railway, Fly.io, or a Node server
- Database: MongoDB Atlas
- Media: Cloudinary
- Payments: Razorpay

### Backend Deployment

1. Set production env vars in your host dashboard
2. Point `MONGODB_URI` to MongoDB Atlas
3. Set `CLIENT_URL` and `CORS_ORIGIN` to your frontend domain
4. Deploy `backend/` as a Node service

### Frontend Deployment

1. Set `VITE_API_URL` to the deployed backend `/api` URL
2. Set `VITE_RAZORPAY_KEY_ID` and Google Maps embed URL
3. Deploy `frontend/` as a static React app

## Notes

- This repo is organized as two clean apps so you can deploy independently.
- Replace sample images, contact details, and Razorpay/Google Maps keys before going live.
- Add your own product seed data and Cloudinary presets before production launch.
