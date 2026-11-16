# Dehydrated Fruit Marketplace — Database Schema & Data Models

Database: **MongoDB** with **Mongoose ODM**  
Design Philosophy: Clean relational normalization where consistency and multi-vendor isolation are paramount, combined with atomic subdocument snapshots for point-in-time order accuracy.

---

## 1. User Model (`users`)
Represents all system actors across the three defined roles.

| Field | Type | Description | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `name` | String | Full name | Required, trim, max 100 |
| `email` | String | Email address | Required, unique, lowercase, regex validated |
| `password` | String | bcrypt hashed password | Required, select: false, minlength: 6 |
| `role` | String | System role (`CUSTOMER`, `SELLER`, `ADMIN`) | Default `CUSTOMER`, index: true |
| `phone` | String | Contact phone | Optional, trim |
| `sellerStatus` | String | Seller account status (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`) | Optional, default `PENDING` for sellers |
| `storeName` | String | Registered store name | Trim |
| `isEmailVerified`| Boolean | Verification status | Default `false` |
| `avatar` | Object | `{ url, publicId }` | Cloudinary reference |
| `timestamps` | Date | `createdAt`, `updatedAt` | Automatic |

---

## 2. Seller Model (`sellers`)
Stores vendor compliance, FSSAI certificates, business addresses, bank details, and storefront profiles.

| Field | Type | Description | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `user` | ObjectId | Associated User reference | Required, unique, ref: `User` |
| `storeName` | String | Storefront name | Required, unique, trim, max 100 |
| `slug` | String | SEO storefront slug (`/sellers/:slug`) | Required, unique, lowercase |
| `description` | String | Orchard biography | Max 1000 characters |
| `logo` | Object | `{ url, publicId }` | Cloudinary reference |
| `banner` | Object | `{ url, publicId }` | Cloudinary reference |
| `businessInfo` | Object | Business registration details: `businessName`, `businessType`, `pan`, `gst`, `fssaiNumber`, `fssaiCertificate` | Strict compliance verification |
| `businessAddress`| Object | Physical orchard dispatch facility: `street`, `city`, `state`, `pincode`, `country` | Shipping origin |
| `bankInfo` | Object | Settlement account: `accountHolderName`, `accountNumber`, `ifscCode`, `bankName`, `branchName`, `upiId` | Sensitive financial data |
| `status` | String | Moderation state (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`) | Default `PENDING`, index: true |
| `rejectionReason`| String | Admin feedback on rejection | Default `''` |
| `commissionRate`| Number | Assigned platform take-rate percentage | Default 8% (within 5–10% bracket), min 0, max 100 |
| `rating` | Number | Dynamic average customer rating (1.0–5.0) | Default 0, min 0, max 5 |
| `reviewCount` | Number | Total verified customer reviews | Default 0 |
| `isVerified` | Boolean | FSSAI & compliance verified badge | Default `false` |

---

## 3. Category Model (`categories`)
Fruit taxonomy for catalog navigation.

| Field | Type | Description | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `name` | String | Category name (e.g. "Sun-Dried Mangoes") | Required, unique, trim |
| `slug` | String | SEO slug (`/categories/:slug`) | Required, unique, lowercase |
| `description` | String | Category explanation | Optional |
| `image` | Object | `{ url, publicId }` | Cloudinary reference |
| `isActive` | Boolean | Active flag | Default `true` |

---

## 4. Product Model (`products`)
Core catalog listing for dehydrated fruit batches.

| Field | Type | Description | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `name` | String | Product name | Required, trim, max 200 |
| `slug` | String | SEO slug (`[product-name]-by-[seller-slug]`) | Required, unique, lowercase |
| `category` | ObjectId | Category reference | Required, ref: `Category`, index: true |
| `seller` | ObjectId | Producer reference | Required, ref: `Seller`, index: true |
| `description` | String | Drying technique & taste profile | Required, max 3000 |
| `images` | Array | Array of `{ url, publicId }` | At least 1 image required |
| `variants` | Array | Array of ObjectId refs to `ProductVariant` | Relational reference |
| `minPrice` | Number | Lowest variant price (cached for filtering) | Default 0, index: true |
| `totalStock` | Number | Sum of variant inventory | Default 0, index: true |
| `ingredients` | Array | Ingredient declaration (e.g. `['100% Mango']`) | Purity specification |
| `nutrition` | Object | Nutritional facts per 100g: `calories`, `carbohydrates`, `naturalFruitSugars`, `fiber`, `protein`, `fat` | Standard food specification |
| `shelfLife` | String | Expiry timeframe (e.g. "12 Months") | Default "12 Months" |
| `storageInstructions`| String | Storage advice | Default airtight container advice |
| `addedSugar` | Boolean | Purity claim: added sugar present? | Default `false`, index: true |
| `preservatives`| Boolean | Purity claim: preservatives/sulfites present?| Default `false`, index: true |
| `status` | String | Quality state (`PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `INACTIVE`) | Default `PENDING_APPROVAL`, index: true |
| `rejectionReason`| String | Admin feedback on product rejection | Default `''` |
| `rating` | Number | Dynamic aggregate rating | Default 0, min 0, max 5 |
| `reviewCount` | Number | Count of approved product reviews | Default 0 |
| `isFeatured` | Boolean | Marketplace featured badge | Default `false`, index: true |

**Indexes**:
- Compound text index: `{ name: 'text', description: 'text', ingredients: 'text' }`

---

## 5. ProductVariant Model (`productvariants`)
Individual SKU weight packages.

| Field | Type | Description | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `product` | ObjectId | Parent Product reference | Required, ref: `Product`, index: true |
| `weight` | String | Weight tier (`100g`, `250g`, `500g`, `1kg`) | Required |
| `price` | Number | Selling price in ₹ | Required, min: 0 |
| `mrp` | Number | Maximum Retail Price in ₹ | Required, min: 0 |
| `SKU` | String | Stock Keeping Unit code | Required, uppercase, unique |
| `stock` | Number | Available inventory count | Required, min: 0, default 0 |
| `isDefault` | Boolean | Default selection flag | Default `false` |

**Compound Indexes**:
- `{ product: 1, weight: 1 }` with `{ unique: true }`

---

## 6. Cart Model (`carts`)
Persistent customer cart supporting multi-vendor grouping.

| Field | Type | Description | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `user` | ObjectId | Customer reference | Required, unique, ref: `User` |
| `items` | Array | Array of `{ product, variant, quantity }` | Subdocument line items |

---

## 7. Address Model (`addresses`)
Customer shipping address book.

| Field | Type | Description | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `user` | ObjectId | Customer reference | Required, ref: `User`, index: true |
| `fullName` | String | Recipient full name | Required |
| `phone` | String | 10-digit Indian phone number | Required, regex validated |
| `street` | String | Street address | Required |
| `apartment` | String | Flat / Unit | Optional |
| `city` | String | City name | Required |
| `state` | String | Indian State | Required |
| `postalCode` | String | 6-digit postal PIN code | Required, regex validated |
| `country` | String | Country | Default 'India' |
| `isDefault` | Boolean | Default address flag | Pre-save hook enforces 1 default |
| `type` | String | Address type (`HOME`, `WORK`, `OTHER`) | Default `HOME` |

---

## 8. Order Model (`orders` — Master Order)
The primary customer-facing contract resulting from a single checkout.

| Field | Type | Description | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `orderNumber` | String | Master order identifier (`DF-ORD-XXXX-XXXX`) | Required, unique, index: true |
| `customer` | ObjectId | Buyer reference | Required, ref: `User`, index: true |
| `shippingAddress`| Object | Point-in-time immutable address snapshot | Full address object |
| `sellerOrders` | Array | Array of refs to child `SellerOrder` records | Required |
| `sellers` | Array | Array of refs to distinct participating sellers | Required |
| `items` | Array | Immutable line items snapshot with weight, price, SKU, seller | Required |
| `subtotal` | Number | Sum of line item subtotals | Required |
| `totalShipping`| Number | Aggregate dispatch charges across vendors | Required |
| `tax` | Number | Standard 5% GST on packaged dried fruits | Required |
| `discount` | Number | Applied discount | Default 0 |
| `grandTotal` | Number | Net amount charged to customer | Required |
| `paymentMethod`| String | Channel (`RAZORPAY`, `COD`) | Default `RAZORPAY` |
| `paymentStatus`| String | Payment state (`PENDING`, `PAID`, `FAILED`, `REFUNDED`) | Default `PENDING`, index: true |
| `orderStatus` | String | Overall order state (`CONFIRMED`, `PROCESSING`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`) | Default `CONFIRMED`, index: true |

---

## 9. SellerOrder Model (`sellerorders` — Vendor Sub-Order)
Isolated vendor-specific fulfillment slice.

| Field | Type | Description | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `sellerOrderNumber`| String | Vendor order identifier (`DF-ORD-XXXX-XXXX-S1`) | Required, unique, index: true |
| `masterOrder` | ObjectId | Parent Master Order reference | Required, ref: `Order`, index: true |
| `seller` | ObjectId | Producer reference | Required, ref: `Seller`, index: true |
| `customer` | ObjectId | Customer reference | Required, ref: `User`, index: true |
| `items` | Array | Line items belonging solely to this vendor | Subdocument array |
| `subtotal` | Number | Vendor items subtotal | Required |
| `shippingFee` | Number | Vendor courier dispatch fee | Free if $\ge$ ₹500 |
| `tax` | Number | 5% GST component | Required |
| `totalAmount` | Number | Gross sub-order total | Required |
| `commissionRate`| Number | Platform take-rate applied to this order (%) | Required |
| `commissionAmount`| Number | Platform fee deducted by marketplace | Required |
| `sellerEarnings`| Number | Net earnings owed to vendor | Required |
| `payoutStatus` | String | Settlement state (`PENDING`, `PROCESSING`, `PAID`, `FAILED`) | Default `PENDING`, index: true |
| `orderStatus` | String | Fulfillment milestone (`CONFIRMED`, `PROCESSING`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`) | Default `CONFIRMED`, index: true |
| `trackingInfo` | Object | `{ courier, trackingNumber, dispatchedAt, deliveredAt }` | Live courier tracking |
| `statusHistory`| Array | Array of `{ status, timestamp, note }` | Full audit trail |

---

## 10. Payment Model (`payments`)
Cryptographic transaction record.

| Field | Type | Description | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `order` | ObjectId | Associated Master Order | Required, ref: `Order`, index: true |
| `razorpayOrderId`| String | Razorpay Order ID | Sparse unique index |
| `razorpayPaymentId`| String | Razorpay Payment ID | Sparse unique index |
| `amount` | Number | Transaction amount in ₹ | Required |
| `amountPaid` | Number | Captured amount | Default 0 |
| `currency` | String | Currency code | Default 'INR' |
| `paymentStatus`| String | Status (`PENDING`, `PAID`, `FAILED`, `REFUNDED`) | Default `PENDING`, index: true |
| `signature` | String | HMAC SHA256 verified signature | Cryptographic proof |
| `webhookEvents`| Array | Array of processed webhook event IDs | Duplicate prevention |

---

## 11. Review Model (`reviews`)
Customer feedback for products and orchard vendors.

| Field | Type | Description | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `customer` | ObjectId | Reviewer reference | Required, ref: `User`, index: true |
| `product` | ObjectId | Fruit Product reference | Optional (required for product review) |
| `seller` | ObjectId | Orchard Seller reference | Required, ref: `Seller`, index: true |
| `order` | ObjectId | Verified Purchase Order reference | Required, ref: `Order` |
| `reviewType` | String | Review type (`PRODUCT`, `SELLER`) | Required, enum |
| `rating` | Number | Score (1 to 5 stars) | Required, min 1, max 5 |
| `title` | String | Review headline | Trim, max 100 |
| `comment` | String | Detailed review text | Required, trim, max 1000 |
| `isVerifiedPurchase`| Boolean| Verified buyer flag | Gated server-side |
| `status` | String | Moderation state (`PENDING`, `APPROVED`, `REJECTED`) | Default `APPROVED`, index: true |
| `sellerReply` | Object | `{ comment, repliedAt }` | Official vendor reply |

**Partial Unique Indexes**:
- `{ customer: 1, product: 1 }` with partial filter `{ reviewType: 'PRODUCT' }`
- `{ customer: 1, seller: 1 }` with partial filter `{ reviewType: 'SELLER' }`

---

## 12. Payout Model (`payouts`)
Financial disbursements to orchard vendors.

| Field | Type | Description | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `payoutNumber`| String | Unique payout reference (`DF-PAY-XXXXXXXX-XXXX`) | Required, unique, index: true |
| `seller` | ObjectId | Beneficiary vendor | Required, ref: `Seller`, index: true |
| `sellerOrders` | Array | Array of refs to settled `SellerOrder` records | Required |
| `grossAmount` | Number | Gross sales of included orders | Required |
| `commissionDeducted`| Number| Platform commission retained | Required |
| `amount` | Number | Net disbursed payout amount | Required |
| `status` | String | Payout state (`PENDING`, `PROCESSING`, `PAID`, `FAILED`) | Default `PENDING`, index: true |
| `paymentMethod`| String | Method (`BANK_TRANSFER`, `UPI`, `NEFT`, `IMPS`) | Default `BANK_TRANSFER` |
| `bankDetailsSnapshot`| Object | `{ accountHolderName, bankName, accountNumberMasked, ifscCode, upiId }` | Masked snapshot |
| `transactionReference`| String | Bank UTR / NEFT reference number | Mandatory for `PAID` |
| `failureReason`| String | Reason if transfer rejected | Mandatory for `FAILED` |
| `initiatedBy` | ObjectId | Admin user who authorized payout | ref: `User` |
| `paidAt` | Date | Timestamp of bank settlement | Recorded when PAID |

---

## 13. SystemConfig Model (`systemconfigs`)
Global marketplace operational configuration.

| Field | Type | Description | Constraints |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated |
| `key` | String | Unique config key (e.g. `PLATFORM_COMMISSION`, `PLATFORM_SETTINGS`) | Required, unique, uppercase, index |
| `value` | Mixed | Configuration payload object | Required |
| `description`| String | Config purpose | Optional |
| `updatedBy` | ObjectId | Admin user reference | ref: `User` |
