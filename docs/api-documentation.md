# Dehydrated Fruit Marketplace — REST API Documentation

Base URL: `http://localhost:5000/api/v1` (Development) / `https://api.dehydratedfruit.com/api/v1` (Production)

---

## 1. Authentication & User Profile (`/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new user (`CUSTOMER` or `SELLER`). Rejects `ADMIN` requests. |
| `POST` | `/auth/login` | Public | Login with email and password. Returns JWT access token. |
| `POST` | `/auth/logout` | Authenticated | Logout current session. |
| `GET` | `/auth/me` | Authenticated | Get current authenticated user profile and role details. |
| `PUT` | `/auth/profile` | Authenticated | Update user profile name and phone number. |
| `POST` | `/auth/forgot-password` | Public | Initiate password reset with verification token. |
| `POST` | `/auth/reset-password/:token`| Public | Reset password using one-time token. |

---

## 2. Sellers & Storefronts (`/sellers`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/sellers` | Public | List verified public orchard vendors with pagination and search. |
| `GET` | `/sellers/store/:slug` | Public | Get detailed vendor storefront by slug with live approved product catalog. |
| `GET` | `/sellers/me` | Seller | Get seller profile, store details, and verification status. |
| `PUT` | `/sellers/me` | Seller | Update business information, FSSAI number, PAN, address, and bank info. |
| `GET` | `/sellers/dashboard-stats` | Seller | Get seller portal metrics (products count, pending orders). |
| `GET` | `/sellers/admin/all` | Admin | List all sellers with status filtering (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`). |
| `PATCH` | `/sellers/admin/:id/status`| Admin | Moderate seller approval state, assign custom commission rate, or reject with reason. |

---

## 3. Fruit Categories (`/categories`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/categories` | Public | List all active fruit taxonomy categories (Tropical, Berries, Sun-Dried, Freeze-Dried, Citrus, Exotic). |
| `GET` | `/categories/:slug` | Public | Get category details by SEO slug. |
| `POST` | `/categories` | Admin | Create new fruit category. |
| `PUT` | `/categories/:id` | Admin | Update fruit category name, description, or image. |
| `DELETE` | `/categories/:id` | Admin | Delete fruit category. |

---

## 4. Dehydrated Fruit Products (`/products`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/products` | Public | Discover approved fruit products with search, category, weight, added sugar, and price filters. |
| `GET` | `/products/:slug` | Public | Get product details by slug with populated weight variants, nutritional facts, and producer info. |
| `GET` | `/products/seller/my-products` | Approved Seller | List all products created by the authenticated vendor. |
| `POST` | `/products` | Approved Seller | Submit a new dehydrated fruit product with weight variants and ingredients. |
| `PUT` | `/products/:id` | Approved Seller | Update product details, inventory, and weight variants. |
| `DELETE` | `/products/:id` | Seller / Admin | Delete or soft-remove product. |
| `POST` | `/products/upload-image` | Approved Seller | Upload product photo to Cloudinary CDN (`url` and `publicId`). |
| `GET` | `/products/admin/all` | Admin | List all products across vendors for quality review. |
| `PATCH` | `/products/admin/:id/status`| Admin | Moderate product (`APPROVED`, `REJECTED`, `INACTIVE`). |

---

## 5. Shopping Cart (`/cart`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/cart` | Customer | Fetch cart with zero-trust server-side recalculation, stock checks, and per-seller dispatch grouping. |
| `POST` | `/cart/items` | Customer | Add weight variant to cart with real-time stock capping. |
| `PUT` | `/cart/items/:itemId` | Customer | Update cart item quantity. |
| `DELETE` | `/cart/items/:itemId` | Customer | Remove line item from cart. |
| `POST` | `/cart/sync` | Customer | Synchronize guest local storage cart into authenticated user cart. |
| `DELETE` | `/cart` | Customer | Clear all items from cart. |
| `POST` | `/cart/validate-checkout` | Customer | Pre-validate entire cart prices, inventory, and shipping before order creation. |

---

## 6. Addresses (`/addresses`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/addresses` | Customer | List saved delivery addresses. |
| `POST` | `/addresses` | Customer | Create a new delivery address with Indian PIN code validation. |
| `PUT` | `/addresses/:id` | Customer | Update delivery address. |
| `DELETE` | `/addresses/:id` | Customer | Remove delivery address. |
| `PATCH` | `/addresses/:id/default`| Customer | Set default shipping address. |

---

## 7. Master & Sub-Orders (`/orders`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/orders` | Customer | Place order. Decomposes 1 Master Order into $N$ isolated `SellerOrder` records with atomic stock decrement. |
| `GET` | `/orders` | Customer | List all master orders placed by customer. |
| `GET` | `/orders/:id` | Customer | Get customer Master Order with live courier tracking per vendor package. |
| `POST` | `/orders/:id/cancel` | Customer | Cancel unfulfilled master order and atomically restore stock. |
| `GET` | `/orders/seller/my-orders` | Seller | List vendor's own `SellerOrder` sub-orders (Strict isolation). |
| `GET` | `/orders/seller/orders/:id`| Seller | Get single `SellerOrder` details. |
| `PATCH` | `/orders/seller/orders/:id/status`| Seller | Update fulfillment milestone (`PROCESSING`, `SHIPPED`, `DELIVERED`) with tracking number. |
| `GET` | `/orders/admin/all` | Admin | Complete platform order supervision. |
| `GET` | `/orders/admin/:id` | Admin | Inspect master order and sub-order decomposition. |
| `PATCH` | `/orders/admin/:id/status`| Admin | Override order fulfillment status. |

---

## 8. Payments (`/payments`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/payments/create-order` | Customer | Create Razorpay payment order for Master Order grand total. |
| `POST` | `/payments/verify` | Customer | Verify HMAC SHA256 payment signature and confirm Master Order & SellerOrders. |
| `POST` | `/payments/webhook` | Public | Razorpay webhook endpoint with `x-razorpay-signature` verification and duplicate event idempotency. |
| `POST` | `/payments/failed` | Customer | Record failed or abandoned payment attempt. |

---

## 9. Customer Reviews & Ratings (`/reviews`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/reviews/products/:productId`| Public | List approved verified reviews for a fruit product. |
| `GET` | `/reviews/sellers/:sellerId`| Public | List approved verified reviews for an orchard producer. |
| `GET` | `/reviews/eligibility` | Customer | Check if authenticated customer purchased the item/vendor. |
| `POST` | `/reviews/products/:productId`| Verified Buyer | Submit product review. Enforces 1 review per product per customer via composite partial unique indexes. Recalculates product rating. |
| `POST` | `/reviews/sellers/:sellerId` | Verified Buyer | Submit seller review. Recalculates vendor rating. |
| `GET` | `/reviews/seller/my-reviews`| Seller | List feedback received for vendor's products and store. |
| `POST` | `/reviews/seller/:id/reply` | Seller | Post official orchard reply to customer review. |
| `GET` | `/reviews/admin/all` | Admin | Moderation queue for marketplace reviews. |
| `PATCH` | `/reviews/admin/:id/status`| Admin | Approve or reject review with dynamic rating aggregate recalculation. |

---

## 10. Commissions (`/commissions`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/commissions/config` | Admin | Get global platform take-rate configuration and GMV statistics. |
| `PATCH` | `/commissions/config` | Admin | Update default platform commission rate (5%–10% baseline). |
| `GET` | `/commissions/sellers` | Admin | List all sellers with their custom vs. default take-rates and lifetime sales. |
| `PATCH` | `/commissions/sellers/:sellerId`| Admin | Override commission percentage for an individual orchard producer. |

---

## 11. Payouts & Disbursements (`/payouts`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/payouts/seller/earnings` | Seller | Get seller gross sales, platform fee deductions, net earnings, pending balance, and masked bank info. |
| `GET` | `/payouts/seller/history` | Seller | View payout history with UTR bank reference numbers. |
| `GET` | `/payouts/seller/:id` | Seller | Get single payout details. |
| `GET` | `/payouts/admin/overview` | Admin | Platform-wide financial summary (GMV, platform revenue, disbursed, pending queue). |
| `GET` | `/payouts/admin/eligible-orders`| Admin | Group eligible completed orders by seller ready for settlement. |
| `POST` | `/payouts/admin/generate` | Admin | Generate a payout record. Transitions included `SellerOrder`s to `PROCESSING`. |
| `PATCH` | `/payouts/admin/:id/status`| Admin | Update payout status (`PROCESSING`, `PAID` with UTR, or `FAILED` with auto-reversion of orders). |
| `GET` | `/payouts/admin/all` | Admin | List all payouts across sellers. |

---

## 12. Admin General Operations (`/admin`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin/dashboard-stats` | Admin | Executive analytics engine (GMV, orders, revenue, sellers, products, action center queues, feeds). |
| `GET` | `/admin/customers` | Admin | Customer directory with search, order volume, and lifetime spend. |
| `GET` | `/admin/customers/:id` | Admin | Customer profile with saved address book and complete purchase history. |
| `GET` | `/admin/settings` | Admin | Retrieve platform operational settings. |
| `PATCH` | `/admin/settings` | Admin | Update platform settings (take-rate, thresholds, contact info, maintenance mode). |
