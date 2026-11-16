# Dehydrated Fruit Marketplace

> **"Discover. Compare. Buy. Dehydrated."**
> A production-ready multi-vendor e-commerce platform dedicated exclusively to dehydrated, sun-dried, and freeze-dried fruits.

---

## 🌟 Architectural Highlights

- **Multi-Vendor Cart**: Customers can place items from 3+ different regional fruit processors into a single shopping cart.
- **Single Checkout & Order Decomposition**: 1 unified customer checkout produces **1 Master Order** for the buyer and **separate `SellerOrder` records** for each vendor.
- **Strict Role-Based Portals**: Dedicated experiences for Customers, Sellers (Vendor Portal), and Super Admins (Admin Console).
- **Separation of Concerns**: Pure JavaScript/JSX, Vite, Redux Toolkit + RTK Query, Express.js REST API with `/api/v1` prefix.
- **Food Marketplace Aesthetic**: Earthy forest greens, cream backgrounds, warm mango/apricot accents, generous whitespace, and mobile-first responsiveness (390px, 1024px, 1440px).

---

## 📁 Repository Structure

```
dehydrated-fruit-marketplace/
├── client/          # React (Vite) + Tailwind CSS + Redux Toolkit
├── server/          # Node.js + Express + Mongoose + JWT
├── docs/            # Architecture and system documentation
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Server Setup
```bash
cd server
npm install
cp .env.example .env
npm run dev
```
The server will run on `http://localhost:5000`.
Health check: `http://localhost:5000/api/v1/health`

### 2. Client Setup
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
The client will run on `http://localhost:5173`.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, JavaScript (ESM), Redux Toolkit, RTK Query, React Router, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs |
| **Services** | Cloudinary, Razorpay, Nodemailer |
| **API** | `/api/v1` REST API standard |

---

## 📖 Documentation
Detailed architectural blueprints, API specifications, and database schemas can be found in:
- [docs/architecture.md](docs/architecture.md) — Master Architecture & Technical Specification
- [docs/api-documentation.md](docs/api-documentation.md) — Complete REST API Reference (12 Modules)
- [docs/database-schema.md](docs/database-schema.md) — Comprehensive Data Dictionary & Schema Models (13 Models)

---

## 🗺️ Implementation Phases
- [x] **Phase 1: Foundation** (Directory structure, Express base, Redux/RTK Query, layouts, routes, reusable UI)
- [x] **Phase 2: Authentication** (User model, bcrypt, JWT, roles, auth middleware, customer/seller onboarding, password reset foundation, RTK Query authApi)
- [x] **Phase 3: Seller onboarding and verification** (Seller model, FSSAI/PAN/GST compliance, bank details, isApprovedSeller backend authorization, Seller Portal dashboard & settings, Admin moderation, Sell With Us landing page)
- [x] **Phase 4: Categories and products** (Category, Product, ProductVariant models; weight variants 100g/250g/500g/1kg; Cloudinary integration; ProductForm, Gallery, Card, Grid, Filters, Sort; Seller & Admin moderation; realistic seed data)
- [x] **Phase 5: Customer marketplace** (Home sections with Shop by Fruit, Trending Products, Featured Sellers, Why Shop With Us, Seller CTA, Testimonials; Explore catalog with multi-entity search, category/weight/price/availability/diet filters, 6 sorting modes, pagination; Public slug URLs `/products/:slug`, `/sellers/:slug`, `/categories/:slug`; Seller storefront with live catalog; Wishlist management)
- [x] **Phase 6: Cart and checkout** (Multi-vendor Cart model, Address model, Cart & Address REST APIs, server-side price & stock recalculation, multi-vendor seller grouping, per-seller shipping, CartItem, SellerCartGroup, CartSummary, AddressSelector, AddressForm, OrderSummary, PriceBreakdown, PaymentMethod, CartPage, CheckoutPage)
- [x] **Phase 7: Orders** (Order Master model, SellerOrder sub-order model, atomic stock reduction & negative inventory prevention, multi-vendor order decomposition: 1 Master Order -> N SellerOrders, Customer Orders & OrderDetails, Seller Orders with fulfillment milestones & courier tracking, Admin Orders supervision & override, Order cancellation with stock restoration)
- [x] **Phase 8: Razorpay payments** (Razorpay SDK config, Payment model, PaymentService, paymentRoutes, HMAC SHA256 payment signature verification, webhook processing with x-razorpay-signature verification, duplicate webhook idempotency, payment tampering protection, frontend Razorpay script loader and checkout integration)
- [x] **Phase 9: Reviews** (Dual Review architecture: Product & Seller reviews; verified purchase gating with 403 enforcement; composite partial unique indexes preventing duplicate reviews; atomic MongoDB aggregation pipeline recalculating rating and reviewCount; ReviewForm, ReviewCard, ReviewList; Seller dashboard reviews & vendor replies; Admin moderation queue with status changes)
- [x] **Phase 10: Commission and payouts** (Configurable platform commission with initial default 8% in 5–10% bracket; `calculateCommission.js` computing gross sales, platform fee, seller earnings, and payout amount; `Payout` model with statuses `PENDING`, `PROCESSING`, `PAID`, `FAILED`; Seller Earnings ledger with strict data isolation; Bank details masking `•••• •••• 1234`; Admin payout batch generation and settlement with UTR tracking; Payout failure and order reversion to protect seller funds; Admin commission configuration & vendor-level overrides; RTK Query `payoutApi`, SellerEarningsPage, SellerPayoutsPage, AdminPayoutsPage, AdminCommissionsPage)
- [x] **Phase 11: Admin dashboard and management** (Executive analytics dashboard with GMV, platform revenue, order fulfillment breakdown, vendor status, product counts, and moderation action center; Seller Management: list, approve, reject with reason, suspend; Product Management: list, inspect specifications, approve, reject with reason, deactivate/activate; Order Management: list, inspect multi-vendor decomposition, status override; Customer Management: directory, profiles, saved addresses, lifetime spend & order histories; Category Management: full CRUD taxonomy manager; Platform Settings: global policies, support contact, maintenance mode; Backend role authorization enforcing `ADMIN` on `/api/v1/admin/*`)
- [x] **Phase 12: Final QA, security, optimization and production readiness** (Security audit with Helmet headers, CORS policies, general & auth rate limiting via express-rate-limit; MongoDB indexing optimization on User, Seller, Product, Review, and Order collections; atomic stock handling & negative inventory prevention; zero-trust pricing and commission calculation; frontend Vite manualChunks code splitting into vendor, redux, and icons bundles; 48/48 automated end-to-end integration assertions verified; complete API & database schema documentation)

