# Master Architecture & Technical Specification

## Project Overview

**Dehydrated Fruit Marketplace** is a specialized multi-vendor e-commerce platform dedicated exclusively to dehydrated, sun-dried, and freeze-dried fruits. Unlike single-brand shops, it connects verified regional fruit processors and growers directly with health-conscious consumers.

- **Marketplace Tagline**: *"Discover. Compare. Buy. Dehydrated."*
- **Vendor Value Proposition**: *"Turn your dehydrated fruit business into an online store."*

---

## 1. System Architecture

The project consists of three core directories:
- `client/`: Single-page application built with React, Vite, Redux Toolkit, and Tailwind CSS.
- `server/`: REST API backend built with Node.js, Express, MongoDB, and Mongoose.
- `docs/`: Master architectural and API specifications.

```
dehydrated-fruit-marketplace/
├── client/                      # Frontend SPA
│   ├── public/
│   ├── src/
│   │   ├── assets/              # Static branding and media
│   │   ├── components/
│   │   │   ├── common/          # Reusable UI primitives (Button, Input, Modal, etc.)
│   │   │   └── navigation/      # Navbar, Footer, SearchBar, UserMenu, CartIcon
│   │   ├── constants/           # Roles, route paths, status enums
│   │   ├── hooks/               # Custom React hooks
│   │   ├── layouts/             # CustomerLayout, SellerLayout, AdminLayout, AuthLayout
│   │   ├── pages/
│   │   │   ├── admin/           # Administrative portal views
│   │   │   ├── auth/            # Sign in, registration, seller onboarding
│   │   │   ├── common/          # 404, error boundaries
│   │   │   ├── customer/        # Storefront, exploration, cart, checkout, orders
│   │   │   └── seller/          # Vendor portal views (inventory, earnings, payouts)
│   │   ├── redux/
│   │   │   ├── slices/          # authSlice, cartSlice, wishlistSlice, uiSlice
│   │   │   └── store.js         # Redux store configuration
│   │   ├── routes/              # AppRoutes, ProtectedRoute, SellerRoute, AdminRoute
│   │   ├── services/            # RTK Query API slice definitions
│   │   └── utils/               # Client helpers
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                      # Backend REST API
│   ├── src/
│   │   ├── config/              # Environment and MongoDB connection
│   │   ├── constants/           # Roles, statuses, defaults
│   │   ├── controllers/         # HTTP request/response handlers
│   │   ├── middleware/          # Auth, roles, notFound, error handler
│   │   ├── models/              # Mongoose schemas (User, Product, Order, etc.)
│   │   ├── routes/              # Express route declarations (/api/v1)
│   │   ├── seeders/             # Initial system database seeds
│   │   ├── services/            # Core business logic
│   │   ├── utils/               # Commission calculation, apiResponse, asyncHandler
│   │   ├── validators/          # Request validation
│   │   ├── app.js               # Express application pipeline
│   │   └── server.js            # Server entrypoint and listener
│   └── package.json
├── docs/                        # Architecture & API documentation
│   └── architecture.md
└── README.md
```

---

## 2. Multi-Vendor Cart & Order Decomposition

A fundamental principle of the platform is the **Unified Multi-Vendor Cart & Single Checkout**:

1. **Customer Experience**:
   - Customers add products from multiple distinct fruit vendors (e.g., Seller A, Seller B, Seller C) into a single cart.
   - Customers complete checkout **once** and make a single payment via Razorpay.
   - Customers receive a **Master Order** containing all purchased items and a combined order total.

2. **Order Decomposition**:
   - The backend creates **1 Master Order** for the customer.
   - The backend automatically decomposes and generates **separate `SellerOrder` records** for each vendor involved.
   - Every `SellerOrder` maintains its own fulfillment lifecycle (`CONFIRMED`, `PROCESSING`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`).

3. **Vendor Isolation**:
   - Sellers see **only** their own `SellerOrder` records in the Seller Portal.
   - Sellers cannot access items, customer billing information, or payout details of other sellers.

4. **Platform Commission Calculation**:
   - Calculated in `server/src/utils/calculateCommission.js`.
   - Default commission rate: 5%–10% (configurable by Admin).
   - `SellerOrder` records store `sellerSubtotal`, `platformCommission`, `sellerEarning`, and `payoutAmount`.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18+ (JavaScript / JSX)
- **Bundler**: Vite
- **Styling**: Tailwind CSS (custom natural forest palette, rounded corners, soft shadows)
- **Routing**: React Router DOM (v7)
- **State Management**:
  - Global Client State: Redux Toolkit (`authSlice`, `cartSlice`, `wishlistSlice`, `uiSlice`)
  - Server / Cache State: RTK Query (`apiSlice`, code-split per domain)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Web Framework**: Express.js
- **Database**: MongoDB & Mongoose
- **Authentication**: JWT & bcryptjs
- **Image Hosting**: Cloudinary
- **Payments**: Razorpay
- **Email Service**: Nodemailer

### API Convention
- **Prefix**: `/api/v1`
- **Response Format**:
  - Success: `{ "success": true, "message": "...", "data": {} }`
  - Error: `{ "success": false, "message": "..." }`

---

## 4. Role Hierarchy & Status Lifecycles

### User Roles
1. `CUSTOMER`: Default public signup. Cannot access vendor/admin consoles.
2. `SELLER`: Created via dedicated seller onboarding.
3. `ADMIN`: Internal/seeded account. Full governance over vendors, products, commissions, and payouts.

### Lifecycles
- **Seller Status**: `PENDING` → `APPROVED` / `REJECTED` / `SUSPENDED`
- **Product Status**: `PENDING_APPROVAL` → `APPROVED` / `REJECTED` / `INACTIVE`
- **Order Status**: `CONFIRMED` → `PROCESSING` → `SHIPPED` → `OUT_FOR_DELIVERY` → `DELIVERED` / `CANCELLED`
- **Payout Status**: `PENDING` → `PROCESSING` → `PAID` → `FAILED`

---

## 5. Authentication & Authorization Architecture (Phase 2 Implemented)

### Flow & Security Model
1. **Password Hashing**: Salted bcrypt (10 rounds) handled in Mongoose pre-save hook.
2. **JWT Issuance**: Signed using `JWT_SECRET` with 7-day expiration containing `{ id, role, email }`.
3. **Role Enforcement**:
   - `CUSTOMER`: Default public signup. Cannot register with role `ADMIN`.
   - `SELLER`: Dedicated registration creating account with status `PENDING`.
   - `ADMIN`: Strict internal seeding (`server/src/seeders/admin.seeder.js`). Public signup is blocked with HTTP 403.
4. **Middleware Pipeline**:
   - `authenticate`: Validates HTTP `Authorization: Bearer <token>`, looks up user in MongoDB, and attaches to `req.user`.
   - `authorizeRoles(...roles)`: Verifies role membership before controller execution.
5. **Endpoints Implemented**:
   - `POST /api/v1/auth/register` (Customer registration)
   - `POST /api/v1/auth/seller/register` (Seller registration with PENDING status)
   - `POST /api/v1/auth/login` (Authentication)
   - `POST /api/v1/auth/logout` (Session invalidation)
   - `GET /api/v1/auth/me` (Protected profile)
   - `POST /api/v1/auth/forgot-password` (Password recovery token generation)
   - `POST /api/v1/auth/reset-password/:token` (Password update)
   - `GET /api/v1/auth/verify-email/:token` (Email verification)

---

## 6. Seller Onboarding & Verification Architecture (Phase 3 Implemented)

### Lifecycle & Verification Workflow
1. **Registration**:
   - Initial vendor registration generates a `User` account (`role: SELLER`) and auto-initializes a linked `Seller` record with `status: PENDING`.
   - URL slug is automatically generated using sanitized store name (e.g. `/sellers/konkan-sundry-naturals`).
2. **Onboarding Requirements**:
   - Store Profile: Store name, description, logo, and banner.
   - Business Legal Entity: Legal name, entity type (`INDIVIDUAL`, `PROPRIETORSHIP`, `PARTNERSHIP`, `LLP`, `PRIVATE_LIMITED`), 10-character PAN, 15-character GSTIN.
   - Food Safety Compliance: **14-digit numeric FSSAI registration/license** mandatory for food processors.
   - Facility Location: Physical processing facility or orchard address with 6-digit pincode.
   - Bank Account Information: Account holder name, account number, 11-character IFSC code, bank/branch name, optional UPI ID.
3. **Backend Selling Authorization (`isApprovedSeller` Middleware)**:
   - A seller in `PENDING`, `REJECTED`, or `SUSPENDED` status is **strictly blocked** from publishing, editing, or selling dehydrated fruits with HTTP 403 Forbidden.
   - Only sellers with status `APPROVED` (moderated by Super Admin) are granted selling privileges.
4. **Admin Governance**:
   - Super Admin reviews pending sellers via `/api/v1/sellers/admin/all`.
   - Approves sellers with custom tiered platform commission rate (default 10%, configurable per vendor).
   - Rejects non-compliant submissions with a required rejection reason displayed on the seller's portal.
5. **Endpoints Implemented**:
   - `GET /api/v1/sellers/me` (Protected Seller profile)
   - `PUT /api/v1/sellers/me` (Update onboarding, business, FSSAI & bank info)
   - `GET /api/v1/sellers/dashboard-stats` (Vendor portal summary metrics)
   - `GET /api/v1/sellers/store/:slug` (Public sanitized storefront)
   - `POST /api/v1/sellers/test-sell-permission` (Gated verification check)
   - `GET /api/v1/sellers/admin/all` (Admin seller moderation list)
   - `PATCH /api/v1/sellers/admin/:id/status` (Admin approve/reject/suspend)

---

## 7. Category & Product Architecture (Phase 4 Implemented)

### Data Models & Taxonomy
1. **Category**:
   - `name`, `slug`, `description`, `image: { url, publicId }`, `isActive`.
   - Seeded with core dried fruit categories: Tropical Fruits, Berries & Cherries, Figs & Mediterranean, Citrus & Orchard.
2. **Product**:
   - `name`, unique URL `slug`, `category`, `seller`, `description`, `images` (Cloudinary `url`, `publicId`).
   - Pure fruit attributes: `ingredients`, `nutrition` (calories, carbs, natural sugars, protein, fiber, fat), `shelfLife`, `storageInstructions`, `addedSugar` (boolean), `preservatives` (boolean).
   - Approval lifecycle: `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `INACTIVE`.
   - Cached aggregates: `minPrice`, `totalStock`, `rating`, `reviewCount`, `isFeatured`.
3. **ProductVariant**:
   - Dedicated weight tiers: `100g`, `250g`, `500g`, `1kg`.
   - `price`, `mrp`, `SKU`, `stock`, `isDefault`.

### Security & Moderation Pipeline
- **Submission Gate**: Only sellers with `APPROVED` status can submit products (enforced via `isApprovedSeller`).
- **Public Visibility**: Only products with `status: APPROVED` are visible in public listings, search, and category views.
- **Admin Moderation**: Admins review product submissions, verify image clarity and ingredient compliance, and approve/reject via `/api/v1/products/admin/:id/status`.

### Multi-Vendor Comparison
- Multiple certified sellers can list equivalent fruits (e.g. Alphonso Mango from *Konkan SunDry Naturals* vs Mango Chews from *Himalayan Orchard Co.*).
- Customers compare price per weight, moisture, zero-sugar claims, and seller ratings before adding to a unified cart.

---

## 8. Customer Marketplace Architecture (Phase 5 Implemented)

### Customer Shopping Experience & Public Slugs
- **Homepage (`/`)**:
  - Hero banner highlighting direct-orchard sun-dried fruit discovery.
  - **Shop by Fruit**: Responsive category browser linking to `/categories/:slug` (e.g. `/categories/tropical-fruits`).
  - **Trending Batches**: Live approved product cards with quick variant indicators, price, rating, and add to cart/wishlist.
  - **Featured Producers**: Verified regional processors with FSSAI badge, ratings, and links to `/sellers/:slug`.
  - **Why Shop With Us & Testimonials**: Trust markers for multi-vendor unified cart, direct orchard sourcing, and zero hidden preservatives.
  - **Vendor CTA**: Prominent driver routing prospective growers to `/sell-with-us`.

- **Explore & Multi-Entity Search (`/explore` & `/categories/:slug`)**:
  - Full-text regex search querying across product title, description, ingredients, matching category name, and seller store name.
  - **Tabs**: Switch between **Fruit Batches** and **Verified Producers** (seller search).
  - **Faceted Filters**:
    - **Weight Tier**: Specific pills for `100g`, `250g`, `500g`, `1kg`.
    - **Availability**: "In Stock Only" toggle (`totalStock > 0`).
    - **Price Range**: Min and Max bounds in ₹.
    - **Diet & Additives**: Checkboxes for "Zero Added Sugar" and "No Sulfites / Preservatives".
    - **Minimum Rating**: Star rating tiers (`4★+`, `3★+`, `2★+`).
  - **6 Sorting Modes**:
    - `newest` (Newest Arrivals)
    - `relevance` (Featured / Highest rated)
    - `price-low-high` (Price: Low to High)
    - `price-high-low` (Price: High to Low)
    - `top-rated` (Highest average rating)
    - `popular` (Most reviewed)
  - **Pagination**: Responsive pagination component with page navigation.

- **Product Details (`/products/:slug`)**:
  - URL slugs formatted as `[product-name]-by-[seller-slug]`.
  - High-resolution gallery with thumbnail switcher.
  - Interactive weight variant selector dynamically updating price, MRP, SKU, and stock availability.
  - Quantity controls with stock caps.
  - Nutritional facts table (calories, carbs, natural fruit sugars, fiber, protein, fat per 100g).
  - Ingredient declaration and pure diet badges (No Added Sugar, Zero Preservatives).
  - Storage advice and shelf life.
  - Verified producer storefront summary card with FSSAI license and direct link to `/sellers/:slug`.

- **Seller Storefront (`/sellers/:slug`)**:
  - Store banner, avatar/logo, verified FSSAI license number, geographic location (city, state), rating, and story/description.
  - Dedicated product catalog populated exclusively with the vendor's active approved products.

- **Customer Wishlist (`/wishlist`)**:
  - Redux Toolkit + LocalStorage persistent state.
  - Visual grid of saved fruits with quick "Add to Cart" and individual / bulk removal.

---

## 9. Multi-Vendor Cart & Checkout Architecture (Phase 6 Implemented)

### Multi-Vendor Cart Design
- **Single Cart with Multiple Regional Vendors**:
  - Customers can combine products from 2, 3, or more verified fruit processors (e.g. Alphonso mango slices from *Konkan SunDry Naturals* in Ratnagiri and dried apricots from *Himalayan Orchard Co.* in Shimla) into a single cart.
  - Cart data is persisted both locally in Redux Toolkit/localStorage (for guest discovery) and in MongoDB `Cart` models upon customer authentication (`/api/v1/cart`).
  - Automatic guest-to-account cart synchronization via `POST /api/v1/cart/sync`.

- **Server-Side Recalculation Engine**:
  - **Zero Trust on Frontend Numbers**: Frontend never dictates prices, shipping rates, or totals.
  - Server recalculates all line items against live `ProductVariant` prices and stock in real time.
  - Automatically identifies out-of-stock items, sold-out weight options, and caps quantities to maximum available orchard stock.
  - **Per-Seller Shipping Fees**: Each seller fulfills from their own geographic facility. If seller subtotal >= ₹500, shipping for that seller is Free; otherwise, a standard ₹50 dispatch charge is calculated per seller. Total shipping is the aggregate of all active vendor shipping fees.
  - **Tax & Grand Total**: Computes standard 5% GST on packaged dried fruit batches. `grandTotal = subtotal + totalShipping + tax - discount`.

- **Cart UI Hierarchy**:
  - `CartPage.jsx`: Main responsive cart container.
  - `SellerCartGroup.jsx`: Visual grouping per seller with FSSAI badge, fulfillment location, seller-level subtotal, and free shipping progress meter.
  - `CartItem.jsx`: Weight variant badge, unit price, quantity increment/decrement controls bounded to live stock, and delete action.
  - `CartSummary.jsx`: Summary breakdown with seller count, item count, shipping charges, GST, and "Proceed to Single Checkout" trigger.

### Checkout Foundation & Address Management
- **Address Architecture (`/api/v1/addresses`)**:
  - Dedicated `Address` model: `fullName`, `phone`, `street`, `apartment`, `city`, `state`, `postalCode`, `country`, `isDefault`, and `type` (`HOME`, `WORK`, `OTHER`).
  - Strict pre-save hooks ensuring only one address per customer has `isDefault: true`.
  - Reusable `AddressForm.jsx` with input validation for 10-digit Indian phone numbers and 6-digit postal PIN codes.
  - `AddressSelector.jsx` allowing seamless switching, editing, and default address selection.

- **Checkout Engine (`/checkout`)**:
  - Real-time pre-checkout validation endpoint: `POST /api/v1/cart/validate-checkout`.
  - Re-verifies all product prices, stock, shipping address, and seller groups before checkout execution.
  - `OrderSummary.jsx`: Compact multi-vendor grouped breakdown of batches being ordered.
  - `PriceBreakdown.jsx`: Financial breakdown showing subtotal, orchard dispatch fees, GST, and final grand total.
  - `PaymentMethod.jsx`: Selection of payment channels (Razorpay Online vs Cash/Pay on Delivery).
  - Decomposition Preview: Previews the single Master Order decomposing into separate `SellerOrder` records for each orchard.

---

## 10. Order Architecture & Multi-Vendor Decomposition (Phase 7 Implemented)

### Master Order vs. SellerOrder Architecture
- **Single Checkout $\to$ 1 Master Order + $N$ SellerOrders**:
  - When a customer checks out a cart holding products from multiple vendors (e.g. *Konkan SunDry Naturals* and *Himalayan Orchard Co.*):
    1. **Master Order** (`DF-ORD-XXXX-XXXX`): The comprehensive customer-facing contract containing full cart line items, recipient shipping address, overall grand total, payment details, and links to all underlying `SellerOrders`.
    2. **SellerOrder** (`DF-ORD-XXXX-XXXX-S1`, `DF-ORD-XXXX-XXXX-S2`): Dedicated, isolated fulfillment record created for each vendor involved. Contains only the items, subtotal, shipping fee, and earnings pertaining to that specific producer.
- **Strict Role-Based Access Isolation**:
  - **Customer**: Sees the complete Master Order (`/orders/:id`), with full visibility of vendor dispatch milestones and tracking numbers for each package.
  - **Seller**: Strictly isolated. Seller A sees ONLY their own `SellerOrder` records (`/api/v1/orders/seller/my-orders`). Accessing another seller's sub-order is forbidden (returns 404). Sellers CANNOT alter payment records or customer billing data.
  - **Super Admin**: Complete supervision across all Master Orders and all child `SellerOrders` (`/api/v1/orders/admin/all`).

### Inventory Safety & Negative Stock Prevention
- **Atomic Stock Decrement**:
  - Stock is decremented atomically during order placement using:
    `ProductVariant.findOneAndUpdate({ _id, stock: { $gte: quantity } }, { $inc: { stock: -quantity } })`.
  - If any product in the multi-vendor cart has insufficient inventory, the entire order fails immediately with a `400 Bad Request`, all decremented variants are rolled back, and stock remains safe from negative inventory.
- **Order Cancellation & Stock Restoration**:
  - If a customer cancels an unfulfilled order (statuses `CONFIRMED` or `PROCESSING`), both the Master Order and all its child `SellerOrders` transition to `CANCELLED`, and inventory is automatically returned back to each variant's stock.

### Order Status Lifecycle
- `CONFIRMED`: Order successfully verified and assigned to vendor queues.
- `PROCESSING`: Regional orchard is vacuum-sealing and preparing fruit batches.
- `SHIPPED`: Courier partner assigned (e.g. BlueDart, Delhivery) with live tracking number.
- `OUT_FOR_DELIVERY`: Package is out with regional courier agent.
- `DELIVERED`: Package delivered to customer.
- `CANCELLED`: Order cancelled by customer or admin with stock restoration.

---

## 11. Razorpay Payment Integration Architecture (Phase 8 Implemented)

### End-to-End Payment Lifecycle
```
Customer Checkout -> Backend creates Master Order -> Backend creates Razorpay Order
                                                              |
                                                              v
Customer verifies with UPI/Card/Netbanking <- Razorpay Modal Opens on Client
                 |
                 v
Backend receives verification request (POST /api/v1/payments/verify)
                 |
        [HMAC SHA256 Signature Match?]
            /                       \
        (Yes)                       (No)
          |                           |
  Payment -> PAID              Reject 400 Bad Request
  Master Order -> CONFIRMED    Payment -> PENDING/FAILED
  SellerOrders -> CONFIRMED
```

### Security & Tamper-Proof Verification
- **Zero Trust on Frontend**: Client payment success responses are never assumed to be valid. The backend independently generates and verifies the HMAC SHA256 cryptographic signature:
  `HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET)`.
- **Payment Amount Mismatch Protection**: Webhooks and payment verification check that the received currency amount matches the exact evaluated Master Order grand total in paise, rejecting any altered or tampered transaction values with `400 Bad Request`.
- **Webhook Idempotency & Duplicate Handling**:
  - Webhooks delivered to `/api/v1/payments/webhook` are cryptographically verified using `x-razorpay-signature` and `RAZORPAY_WEBHOOK_SECRET`.
  - Event IDs are indexed in `Payment.webhookEvents`. Duplicate webhooks are flagged and handled gracefully without double-charging or mutating confirmed orders.
- **Environment Protection**: Razorpay API secrets are strictly loaded through server-side environment variables and never exposed to the frontend bundle.

---

## 12. Reviews & Ratings Architecture (Phase 9 Implemented)

### Dual Review Model Architecture
- **Separation of Concerns: Product vs. Seller Reviews**:
  - The dehydrated fruit marketplace features two distinct review channels managed within a unified `Review` schema:
    1. **Product Reviews** (`reviewType: 'PRODUCT'`): Focuses on the taste, texture, dehydration quality, moisture level, aroma, and packaging of a specific dehydrated fruit batch.
    2. **Seller Reviews** (`reviewType: 'SELLER'`): Focuses on the orchard producer's fulfillment speed, vacuum-sealing integrity, freshness guarantee, and customer service.
- **Verified Purchase Gating**:
  - Customers can only review dehydrated fruit products they have legitimately purchased and paid for (checked via `Order` history with non-cancelled status).
  - Customers can only review an orchard seller if they have placed an order with that seller.
  - Non-purchasers attempting review submission are blocked server-side with `403 Forbidden` (`Only verified purchasers of this dehydrated fruit batch can submit a review`).
- **Duplicate Review Prevention via Database Indexes**:
  - MongoDB composite partial unique indexes strictly enforce exactly 1 review per product per customer, and 1 review per seller per customer:
    - `{ customer: 1, product: 1 }` with partial filter `{ reviewType: 'PRODUCT' }`
    - `{ customer: 1, seller: 1 }` with partial filter `{ reviewType: 'SELLER' }`
  - Prevents rating manipulation or spam while allowing a customer to review different fruits or sellers freely.

### Real-Time Rating Aggregation
- **MongoDB Aggregation Pipeline**:
  - Whenever a review is submitted, edited, or moderated by an admin, an atomic MongoDB aggregation pipeline recalculates the average rating and review count:
    ```javascript
    Review.aggregate([
      { $match: { product: new ObjectId(productId), reviewType: 'PRODUCT', status: 'APPROVED' } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    ```
  - Updates `Product.rating` (rounded to 1 decimal place) and `Product.reviewCount`.
  - Analogous pipeline recalculates `Seller.rating` and `Seller.reviewCount`.
  - Immediate dynamic reflection: If an admin rejects a review, the product and seller average ratings update instantaneously.

### Review Moderation & Seller Interaction
- **Admin Moderation Queue (`/admin/reviews`)**:
  - Super admins can view all marketplace reviews, filter by status (`PENDING`, `APPROVED`, `REJECTED`), and approve or reject reviews with a mandatory rejection reason.
  - Status transitions automatically trigger aggregate recalculation for the affected product or seller.
- **Seller Portal Reviews & Replies (`/seller/reviews`)**:
  - Vendors can view all customer feedback submitted for their products or their storefront.
  - Vendors can submit an official orchard reply (`POST /api/v1/reviews/seller/:id/reply`) displayed alongside the verified customer review on the public storefront.

---

## 13. Commission & Payouts Architecture (Phase 10 Implemented)

### Commission Calculation Engine (`calculateCommission.js`)
- **Mathematical Specification**:
  - `grossOrderAmount`: Total line items amount for vendor order (`subtotal + shippingFee + tax`).
  - `commissionRate`: Configurable platform percentage (default 8%, within the 5–10% bracket; can be customized per vendor or globally).
  - `platformCommission`: Deducted strictly from the dehydrated fruit products subtotal:
    $$\text{platformCommission} = \text{round}\left(\frac{\text{subtotal} \times \text{commissionRate}}{100}\right)$$
  - `sellerEarning`: Net earnings payable to the producer:
    $$\text{sellerEarning} = \text{grossOrderAmount} - \text{platformCommission}$$
  - `payoutAmount`: Equal to net seller earnings for batch disbursement.
  - Floating-point calculations are rounded to 2 decimal places to ensure ledger consistency.

### Configurable Platform & Vendor Take-Rates
- **Global Configuration (`SystemConfig` Model)**:
  - Admin can adjust the baseline platform take-rate (default 8%, adjustable between 5% and 25%) and minimum payout threshold.
  - All non-customized sellers inherit this global default automatically.
- **Vendor-Specific Commission Overrides**:
  - Admins can override individual orchard commission rates (e.g. 5% for high-volume producers, 10% for boutique seasonal processors).
  - Multi-vendor carts compute independent, seller-specific commission amounts and net earnings on each child `SellerOrder`.

### Payout Model & Settlement Lifecycle
- **Status Progression**:
  - `PENDING`: Payout record generated; associated `SellerOrder` records transition from `PENDING` to `PROCESSING`.
  - `PROCESSING`: Payout batch queued with clearing bank for NEFT/IMPS transfer.
  - `PAID`: Transaction confirmed with mandatory bank UTR reference; associated `SellerOrder` records transition to `PAID`.
  - `FAILED`: Transfer rejected by bank with mandatory failure reason; associated `SellerOrder` records automatically revert back to `PENDING` to protect vendor earnings from loss.
- **Zero-Exposure Security & Banking Privacy**:
  - Bank account numbers are never exposed in plain text in financial summaries or client responses (`maskAccountNumber` format: `•••• •••• 1234`).
  - Snapshots of masked bank information are captured on payout creation to maintain immutable audit records.
- **Strict Role-Based Isolation**:
  - Vendors see ONLY their own financial records, gross orders, commission deductions, and payout history.
  - Vendors CANNOT generate, modify, or delete payout or commission records (`403 Forbidden`).
  - Customers cannot access seller or admin financial endpoints (`403 Forbidden`).

---

## 14. Admin Dashboard & Governance Architecture (Phase 11 Implemented)

### Executive Analytics Engine (`/api/v1/admin/dashboard-stats`)
- **Key Metrics Aggregated**:
  - **GMV**: Total gross customer spend across all non-cancelled orders.
  - **Platform Revenue**: Cumulative platform take-rate commission collected.
  - **Orders**: Total orders placed with complete status lifecycle breakdown (`CONFIRMED`, `PROCESSING`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`).
  - **Seller Registry**: Active counts for `APPROVED`, `PENDING`, `REJECTED`, and `SUSPENDED` vendors.
  - **Catalog**: Live distribution of `APPROVED`, `PENDING_APPROVAL`, `INACTIVE`, and `REJECTED` dehydrated fruit products.
  - **Action Hub Queues**: Real-time counters for pending seller onboarding, pending fruit quality reviews, pending payout batches, and pending customer reviews.
  - **Live Feeds**: Recent 5 master orders and recent 5 seller onboarding applications.
  - **Taxonomy Distribution**: Product counts mapped across fruit categories.

### Multi-Faceted Governance Modules
- **Seller Management (`/admin/sellers`)**:
  - Full vendor directory with search across store names, owner emails, and compliance IDs.
  - Approval, rejection with mandatory seller feedback notes, and suspension controls.
- **Product Management (`/admin/products`)**:
  - Batch moderation workflow checking photos, ingredient purity declarations, sugar/preservative claims, and weight variants.
  - Status management: `APPROVED`, `REJECTED`, `INACTIVE` (deactivation / reactivation).
- **Order Management (`/admin/orders`)**:
  - Master Order supervision with multi-vendor decomposition inspect modal.
  - Admin status override across fulfillment milestones.
- **Customer Directory (`/admin/customers`)**:
  - Buyer directory with search, order volume, and lifetime GMV contributions.
  - Profile inspection modal with saved address book and complete purchase histories.
- **Category Taxonomy (`/admin/categories`)**:
  - Full CRUD operations for dehydrated fruit categories (Tropical, Berries, Sun-Dried, Freeze-Dried, Citrus, Exotic).
- **Platform Settings (`/admin/settings`)**:
  - Dynamic configuration stored in `SystemConfig` (`PLATFORM_SETTINGS`): platform name, support contact, default take-rate, free shipping threshold, minimum payout threshold, maintenance mode toggle.

### Backend Authorization Guardrails
- **Dual-Layer Protection**:
  - Frontend: `AdminRoute` protecting all `/admin/*` routes in `AppRoutes.jsx`.
  - Backend: Strict `authenticate` and `authorizeRoles(ROLES.ADMIN)` on `/api/v1/admin/*`, `/api/v1/sellers/admin/*`, `/api/v1/products/admin/*`, `/api/v1/orders/admin/*`, `/api/v1/payouts/admin/*`, `/api/v1/commissions/*`, `/api/v1/reviews/admin/*`, and category modification routes.
  - Non-admin requests (customers, sellers, or unauthenticated users) are rejected with `403 Forbidden` or `401 Unauthorized`.

---

## 15. Security, Performance & QA Hardening (Phase 12 Implemented)

### Security Architecture & Threat Mitigations
- **HTTP Header Protection**: Configured `helmet` middleware across all incoming requests with secure defaults (`X-DNS-Prefetch-Control`, `X-Frame-Options: SAMEORIGIN`, `Strict-Transport-Security`, `X-Download-Options: noopen`, `X-Content-Type-Options: nosniff`, `X-Permitted-Cross-Domain-Policies: none`). Cross-origin resource policy set to `cross-origin` to support CDN asset delivery.
- **DDoS & Brute-Force Rate Limiting**:
  - Global API Limiter: 1000 requests per 15-minute window for standard REST endpoints.
  - Authentication Limiter: 60 requests per 15-minute window on `/api/v1/auth/*` to prevent credential stuffing and brute-force attacks.
- **Cryptographic Payment Integrity**:
  - Razorpay webhooks and client signatures validated with Node.js native `crypto.createHmac('sha256', secret)`.
  - Zero-trust order verification: frontend payment status is ignored; backend directly marks order as `CONFIRMED` only after cryptographic signature match.
- **Zero-Trust Financial Calculations**:
  - Frontend cart totals and subtotals are never trusted. All product prices, weight variants, shipping fees, platform commissions (8%), and net seller payouts are recalculated server-side.
- **Vendor & Data Isolation**:
  - Strict role-based middleware (`authenticate`, `authorizeRoles`, `isApprovedSeller`).
  - Sellers cannot access other sellers' orders, earnings, bank accounts, or customer sensitive data (`403 Forbidden`).
  - Bank account numbers masked (`•••• •••• 1234`) across all seller and admin API responses.
- **Atomic Concurrency & Stock Integrity**:
  - Atomic `$inc: { stock: -quantity }` prevents overselling and race conditions under concurrent checkouts.
  - Negative inventory guardrail: stock decrements verify `stock >= quantity` atomically; orders fail gracefully if inventory is exhausted.

### Database Indexing & Query Optimization
- **Mongoose Index Optimization**:
  - `User`: Unique index on `email`, index on `role` for high-throughput auth and role authorization.
  - `Seller`: Unique indexes on `user`, `slug`, `fssaiNumber`, `panNumber`, index on `status`.
  - `Product`: Text index on `title`, `description`, `tags`; compound index on `(seller, status)`; unique index on `slug`.
  - `ProductVariant`: Compound unique index on `(product, weight)` ensuring variant uniqueness; index on `sku`.
  - `Review`: Partial unique index `{ customer: 1, product: 1 }` (where `product: { $exists: true }`) and `{ customer: 1, seller: 1 }` (where `seller: { $exists: true }`) preventing duplicate reviews.
  - `Order` & `SellerOrder`: Compound index on `(customer, createdAt)` and `(seller, status, createdAt)` for rapid dashboard queries.

### Frontend Optimization & Bundle Splitting
- **Vite Rollup Code Splitting**:
  - `vendor`: React 18, React DOM, React Router DOM (174 kB gzipped to 57 kB).
  - `redux`: Redux Toolkit, React-Redux (41 kB gzipped to 15 kB).
  - `icons`: Lucide React iconography (31 kB gzipped to 6 kB).
  - `index`: Application logic, styles, and page chunks (415 kB gzipped to 89 kB).
- **Responsive Layout Verification**:
  - 390px (Mobile Web): Fully tested collapsed mobile navbar, bottom sheets, full-width touch cards, sticky checkout bars.
  - 1024px (Tablet): 2-to-3 column product grid, collapsible sidebars, scrollable table views.
  - 1440px (Desktop): 4-column product grid, fixed sticky filter sidebar, comprehensive multi-vendor cart and dashboard tables.

---

## 16. Development & Execution Commands

### Prerequisites
- Node.js >= 18
- MongoDB instance (running at `mongodb://127.0.0.1:27017/dehydrated_fruit_marketplace`)

### Server
```bash
cd server
npm install
npm run dev   # Starts server on http://localhost:5000
```
Health Check: `http://localhost:5000/api/v1/health`

### Client
```bash
cd client
npm install
npm run dev   # Starts Vite dev server on http://localhost:5173
```
Production Build: `npm run build`

---

## 17. Production Deployment Checklist

1. **Environment Variables**:
   - Set `NODE_ENV=production`.
   - Configure a strong, random 64-character `JWT_SECRET`.
   - Supply production `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
   - Supply live `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`.
   - Point `MONGODB_URI` to a secure, clustered replica set (e.g. MongoDB Atlas).
   - Set `CLIENT_URL` to the production domain (e.g. `https://dehydratedfruits.com`).
2. **Reverse Proxy & SSL**:
   - Deploy behind Nginx or AWS CloudFront/ALB with TLS 1.3 encryption.
   - Configure `trust proxy` in Express if running behind reverse proxy.
3. **Database Performance**:
   - Ensure MongoDB Atlas indexes are built (`ensureIndexes()` on server boot).
   - Enable automated daily snapshots and point-in-time recovery.
4. **Monitoring & Logging**:
   - Connect Winston/Morgan logs to a centralized log aggregator (Datadog, CloudWatch, or Logtail).
   - Set up synthetic uptime monitoring on `/api/v1/health`.


