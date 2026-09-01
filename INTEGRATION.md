# Toolera Integration Roadmap

> **Rule:** Complete one step fully → test in browser → confirm → move to next.  
> Each step lists: what frontend pages are touched, what backend endpoints are needed, what DB tables are involved, and a checklist to tick off before moving on.

---

## Progress Overview

| Step | Area | Status |
|------|------|--------|
| [Step 1](#step-1--auth--store-bootstrap) | Auth + Store Bootstrap | ✅ Complete |
| [Step 2](#step-2--onboarding-flow) | Onboarding Flow | ✅ Complete |
| [Step 3](#step-3--dashboard-home--counts) | Dashboard Home + Counts | ✅ Complete |
| [Step 4](#step-4--products) | Products (List / Create / Edit / Delete) | ⏳ Pending |
| [Step 5](#step-5--categories) | Categories | ⏳ Pending |
| [Step 6](#step-6--orders) | Orders (List / Detail / Status Update) | ⏳ Pending |
| [Step 7](#step-7--reviews--coupons) | Reviews + Coupons | ⏳ Pending |
| [Step 8](#step-8--website-cms) | Website CMS (Header / Footer / Pages / Theme) | ⏳ Pending |
| [Step 9](#step-9--media--settings) | Media Upload + Settings | ⏳ Pending |
| [Step 10](#step-10--billing--analytics--courier) | Billing + Analytics + Courier | ⏳ Pending |

---

## Step 1 — Auth + Store Bootstrap

**Goal:** User signs up or logs in → their store is fetched → they land on `/seller/{slug}` with a working sidebar and no false payment banner.

### Frontend Pages
- `src/app/login/page.tsx`
- `src/app/signup/page.tsx`
- `src/app/admin/layout.tsx` (redirect `/admin` → `/seller/{slug}`)
- `src/app/seller/[slug]/page.tsx`
- `src/hooks/useStore.ts`
- `src/store/useTenantStore.ts`
- `src/store/useAdminAuthStore.ts`

### Backend Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/v1/auth/signup` | Register new user, return JWT + user |
| POST | `/api/v1/auth/login` | Login, return JWT + user |
| GET | `/api/v1/auth/me` | Get current user from JWT |
| GET | `/api/v1/stores/me` | Get the logged-in user's store + subscription |
| POST | `/api/v1/stores` | Create a store (used in onboarding) |
| GET | `/api/v1/stores/check-slug/:slug` | Check slug availability |

### Database Tables
- `User` — email, passwordHash, name, role
- `Store` — name, slug, ownerId, status

### Checklist
- [x] `POST /auth/signup` — creates user, returns token
- [x] `POST /auth/login` — validates credentials, returns token
- [x] `GET /stores/me` — returns store for logged-in user
- [x] Token stored in localStorage (`rm_admin_token`) after login/signup
- [x] `useStore` hook fetches store on mount
- [x] `/admin` → `/seller/{slug}` redirect fires once slug is loaded
- [x] Sidebar shows store name + "STORE ACTIVE" badge
- [x] No false "Payment Pending" banner when subscription is null
- [x] `/seller/{slug}` route created (re-exports admin layout/page)
- [x] Logout clears token and redirects to `/login`

### Known Issues Fixed This Step
- Removed hardcoded admin bypass tokens (`rm_admin_sec_*`, `admin_token_default`)
- Fixed `isPaymentPending` — was `true` when no subscription (should be `false`)
- CORS: added `localhost:3001` to backend allowlist
- `NEXT_PUBLIC_API_URL` env var fixed (no double `/api/v1`)
- `bcryptjs` installed for password hashing

---

## Step 2 — Onboarding Flow

**Goal:** New user who has no store goes through onboarding → creates store → picks plan (Free Trial or Pro) → subscription activated → lands on dashboard.

### Frontend Pages
- `src/app/onboarding/store/page.tsx` — store name, slug, description
- `src/app/onboarding/plan/page.tsx` — plan selection (Free Trial / Pro)
- `src/app/onboarding/complete/page.tsx` — success screen
- `src/app/checkout/subscription/page.tsx` — payment for Pro plan

### Backend Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/v1/stores` | Create store with name + slug |
| GET | `/api/v1/subscriptions/plans` | Fetch all active plans |
| POST | `/api/v1/subscriptions/activate` | Activate Free Trial or paid plan |

### Database Tables
- `Store` — created during onboarding
- `SubscriptionPlan` — seeded (Free Trial + Pro)
- `Subscription` — created on activation

### Checklist
- [ ] Slug availability check works (`GET /stores/check-slug/:slug`)
- [ ] Store creation saves to DB
- [ ] Plan list fetched from DB (not hardcoded)
- [ ] Free Trial activates with `TRIALING` status + 30-day `trialEndsAt`
- [ ] Pro plan activates with `ACTIVE` status + 1-month period
- [ ] After activation, user lands on `/seller/{slug}`
- [ ] No payment banner for TRIALING or ACTIVE subscriptions
- [ ] Onboarding skipped if user already has a store

---

## Step 3 — Dashboard Home + Counts

**Goal:** Dashboard home page (`/seller/{slug}`) shows real data — total orders, revenue, pending orders, low stock count.

### Frontend Pages
- `src/app/admin/page.tsx` — main dashboard
- `src/hooks/useAdminCounts.ts`

### Backend Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/v1/admin/counts` | Orders count, revenue, pending count, low stock |
| GET | `/api/v1/orders?limit=5&sort=recent` | Recent orders for dashboard table |
| GET | `/api/v1/products?lowStock=true&limit=5` | Low stock products |

### Database Tables
- `Order`, `OrderItem`, `Product`, `Inventory`

### Checklist
- [ ] Counts endpoint returns real DB aggregates
- [ ] Revenue figure is sum of PAID orders
- [ ] Recent orders table shows last 5 orders
- [ ] Low stock widget shows products below threshold
- [ ] All numbers update on page refresh

---

## Step 4 — Products

**Goal:** Merchant can view, create, edit, and delete products. Variants and images work.

### Frontend Pages
- `src/app/admin/products/page.tsx` — product list
- `src/app/admin/products/new/page.tsx` — create product
- `src/app/admin/products/edit/[id]/page.tsx` — edit product
- `src/app/admin/products/attributes/page.tsx` — manage attributes
- `src/app/admin/products/bulk/page.tsx` — bulk actions
- `src/app/admin/inventory/page.tsx` — stock levels
- `src/store/useProductStore.ts`

### Backend Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/v1/products` | List with pagination, search, category filter (in DB, not JS) |
| POST | `/api/v1/products` | Create product |
| GET | `/api/v1/products/:id` | Get single product with variants |
| PATCH | `/api/v1/products/:id` | Update product |
| DELETE | `/api/v1/products/:id` | Soft delete |
| GET | `/api/v1/products/attributes` | List attributes |
| POST | `/api/v1/products/attributes` | Create attribute |

### Database Tables
- `Product`, `ProductImage`, `ProductVariation`, `ProductVariant`, `Attribute`, `AttributeValue`, `Inventory`

### Checklist
- [ ] Product list loads from DB with real pagination
- [ ] Category filter applied in DB query (not JS array filter)
- [ ] Create product saves to DB
- [ ] Image upload works (S3/MinIO)
- [ ] Edit product pre-fills form from DB
- [ ] Delete soft-deletes (sets `deletedAt`)
- [ ] Inventory levels shown per variant
- [ ] Low stock threshold warning

---

## Step 5 — Categories

**Goal:** Merchant can manage product categories (create, edit, reorder, delete).

### Frontend Pages
- `src/app/admin/categories/page.tsx`
- `src/store/useCategoryStore.ts`

### Backend Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/v1/categories` | List all categories |
| POST | `/api/v1/categories` | Create category |
| PATCH | `/api/v1/categories/:id` | Update category |
| DELETE | `/api/v1/categories/:id` | Delete category |

### Database Tables
- `Category`

### Checklist
- [ ] Category list loads from DB
- [ ] Create saves to DB with slug auto-generation
- [ ] Edit updates name, image, description
- [ ] Delete returns 404 (not false success) when ID missing
- [ ] Products page category filter uses real category slugs

---

## Step 6 — Orders

**Goal:** Merchant can view orders, filter by status, update order status, view order detail.

### Frontend Pages
- `src/app/admin/orders/page.tsx`
- `src/store/useOrderStore.ts`
- `src/app/admin/customers/page.tsx` (customer list from orders)

### Backend Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/v1/orders` | List with pagination + status filter |
| GET | `/api/v1/orders/:id` | Order detail with items |
| PATCH | `/api/v1/orders/:id/status` | Update status (guard null-deref) |
| GET | `/api/v1/orders/customers` | Unique customers from orders |

### Database Tables
- `Order`, `OrderItem`, `OrderStatusHistory`, `Customer`

### Checklist
- [ ] Order list loads from DB
- [ ] Status filter (PENDING / CONFIRMED / SHIPPED / DELIVERED) works
- [ ] Order detail shows items, customer, shipping info
- [ ] Status update returns 404 when order not found (not crash)
- [ ] SMS sent on status change (if SMS enabled)
- [ ] Customer list derived from order records

---

## Step 7 — Reviews + Coupons

**Goal:** Merchant can approve/reject reviews and manage discount coupons.

### Frontend Pages
- `src/app/admin/reviews/page.tsx`
- `src/app/admin/marketing/coupons/page.tsx`
- `src/store/useReviewStore.ts`
- `src/store/useCouponStore.ts`

### Backend Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/v1/reviews` | List with status filter |
| PATCH | `/api/v1/reviews/:id/status` | Approve / reject |
| GET | `/api/v1/coupons` | List coupons |
| POST | `/api/v1/coupons` | Create coupon |
| PATCH | `/api/v1/coupons/:id` | Update |
| DELETE | `/api/v1/coupons/:id` | Delete |

### Database Tables
- `Review`, `Coupon`

### Checklist
- [ ] Review list loads with status filter
- [ ] Approve/reject updates DB and returns correct status
- [ ] Coupon list loads from DB
- [ ] Create coupon validates discount type (FIXED / PERCENTAGE)
- [ ] Coupon expiry date enforced

---

## Step 8 — Website CMS

**Goal:** Merchant can customise their storefront — header, footer, homepage sections, theme colours, pages.

### Frontend Pages
- `src/app/admin/website/header/page.tsx`
- `src/app/admin/website/footer/page.tsx`
- `src/app/admin/website/homepage/page.tsx`
- `src/app/admin/website/theme/page.tsx`
- `src/app/admin/website/pages/page.tsx`
- `src/app/admin/website/navigation/page.tsx`
- `src/app/admin/banners/page.tsx`
- `src/store/useHeaderStore.ts`, `useFooterStore.ts`, `useMenuStore.ts`, `usePageStore.ts`

### Backend Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/v1/settings/header` | Get header config |
| PUT | `/api/v1/settings/header` | Save header config |
| GET | `/api/v1/settings/footer` | Get footer config |
| PUT | `/api/v1/settings/footer` | Save footer config |
| GET | `/api/v1/settings/theme` | Get theme settings |
| PUT | `/api/v1/settings/theme` | Save theme |
| GET | `/api/v1/pages` | List CMS pages |
| POST | `/api/v1/pages` | Create page |
| PATCH | `/api/v1/pages/:id` | Update page |
| GET | `/api/v1/menus` | List nav menus |
| PUT | `/api/v1/menus` | Save menu items |

### Database Tables
- `HeaderSettings`, `FooterSettings`, `ThemeSettings`, `Page`, `PageRevision`, `Menu`, `MenuItem`

### Checklist
- [ ] Header settings save and reload
- [ ] Footer settings save and reload
- [ ] Theme colour changes persist
- [ ] CMS pages list, create, edit work
- [ ] Navigation menu items save order
- [ ] Banners save and display on storefront

---

## Step 9 — Media Upload + Settings

**Goal:** Media library works. Store settings, shipping, payment gateway config, account, and SEO settings all save to DB.

### Frontend Pages
- `src/app/admin/media/page.tsx`
- `src/app/admin/settings/store/page.tsx`
- `src/app/admin/settings/account/page.tsx`
- `src/app/admin/settings/page.tsx`
- `src/app/admin/seo/page.tsx`
- `src/store/useMediaStore.ts`, `useShippingSettingsStore.ts`

### Backend Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/v1/upload` | Upload file to S3/MinIO, return URL |
| GET | `/api/v1/media` | List uploaded media |
| DELETE | `/api/v1/media/:id` | Delete media item |
| GET | `/api/v1/settings/store` | Get store info |
| PATCH | `/api/v1/settings/store` | Update store info |
| GET | `/api/v1/settings/shipping` | Get shipping config |
| PUT | `/api/v1/settings/shipping` | Save shipping config |
| GET | `/api/v1/settings/payment` | Get payment gateway config |
| PUT | `/api/v1/settings/payment` | Save bKash / Nagad credentials |
| GET | `/api/v1/settings/seo` | Get SEO defaults |
| PUT | `/api/v1/settings/seo` | Save SEO settings |

### Database Tables
- `MediaItem`, `Store`, `ShippingSettings`, `PaymentSettings`, `SeoSettings`, `SiteSettings`

### Checklist
- [ ] File upload returns a real accessible URL
- [ ] Media library lists uploaded files
- [ ] Store name, logo, contact info saves
- [ ] Shipping zones and rates save
- [ ] bKash / Nagad credentials save (not stubs)
- [ ] SEO meta defaults save per store

---

## Step 10 — Billing + Analytics + Courier

**Goal:** Billing page shows subscription status. Analytics shows real charts. Courier (Pathao / Steadfast) integration works for creating shipments.

### Frontend Pages
- `src/app/admin/billing/page.tsx`
- `src/app/admin/analytics/page.tsx`
- `src/app/admin/reports/profit-loss/page.tsx`
- `src/app/admin/subscription/page.tsx`
- `src/store/useSubscriptionStore.ts`

### Backend Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/v1/subscriptions/plans` | List plans |
| GET | `/api/v1/subscriptions/my` | Current store subscription |
| POST | `/api/v1/subscriptions/activate` | Activate / upgrade plan |
| GET | `/api/v1/analytics/overview` | Revenue, orders, conversion over time |
| GET | `/api/v1/analytics/products` | Top products by revenue |
| POST | `/api/v1/courier/pathao/order` | Create Pathao shipment (real API) |
| POST | `/api/v1/courier/steadfast/order` | Create Steadfast shipment |
| GET | `/api/v1/courier/pathao/track/:id` | Track Pathao shipment |
| GET | `/api/v1/courier/steadfast/track/:code` | Track Steadfast shipment |

### Database Tables
- `Subscription`, `SubscriptionPlan`, `Order`, `OrderItem`, `CourierSettings`

### Critical Fixes Before This Step
- Replace `executePayment` stub in `bkash.service.ts` with real bKash PGW API
- Replace `verifyPayment` stub in `nagad.service.ts` with real Nagad API
- Fix Pathao `createOrder` catch block — remove fake success fallback
- Fix Steadfast status check — verify `res.ok` before returning data

### Checklist
- [ ] Billing page shows current plan, next renewal date
- [ ] Plan upgrade flow works end-to-end
- [ ] Analytics revenue chart uses real order data
- [ ] Profit/loss report pulls from DB
- [ ] Pathao order creation uses real API (no fake consignment)
- [ ] Steadfast order creation uses real API
- [ ] Courier credentials configurable from Settings page

---

## Missing Backend Modules (to be created in their step)

| Module needed | Step | Notes |
|---------------|------|-------|
| `expenses` | Step 3 | No table or controller yet |
| `abandoned-leads` | Step 6 | `AbandonedLead` table exists in schema |
| `settings/shipping` | Step 9 | `ShippingSettings` table exists |
| `settings/payment` | Step 9 | `PaymentSettings` table exists |
| `settings/sms` | Step 9 | `SmsSettings` table exists |
| `settings/seo` | Step 9 | `SeoSettings` table exists |
| `settings/theme` | Step 8 | `ThemeSettings` table exists |
| `settings/header` | Step 8 | `HeaderSettings` table exists |
| `settings/footer` | Step 8 | `FooterSettings` table exists |
| `invoice-templates` | Step 9 | No table yet — needs schema + migration |
| `analytics` | Step 10 | Aggregate queries on Order/Product |
| `backup` | Step 10 | pg_dump endpoint or admin-only |

---

## Backend Modules vs Steps

| Backend Module | Step |
|----------------|------|
| `auth` | Step 1 |
| `stores` | Step 1 + 2 |
| `subscriptions` | Step 2 + 10 |
| `categories` | Step 5 |
| `products` | Step 4 |
| `orders` | Step 6 |
| `reviews` | Step 7 |
| `coupons` | Step 7 |
| `upload` | Step 9 |
| `payment` | Step 10 |
| `courier` | Step 10 |
| `settings/*` (new) | Step 8 + 9 |
| `analytics` (new) | Step 10 |

---

## Environment Quick Reference

| Service | Port | URL |
|---------|------|-----|
| Dashboard (Next.js) | 3001 | http://localhost:3001 |
| **API Gateway** | **5000** | http://localhost:5000 — single entry point for all frontend calls |
| Store Management | 5001 | http://localhost:5001 — auth, stores, subscriptions, CMS, settings |
| Business Service | 5002 | http://localhost:5002 — products, orders, categories, courier, payment |
| PostgreSQL (store mgmt) | 5433 | `toolera_store_management_db` |
| PostgreSQL (business) | 5434 | `toolera_business_db` |
| MinIO (S3) | 9000 | http://localhost:9000 |
| Redis | 6379 | — |
| RabbitMQ | 5672 | — |

**DB credentials:** `postgres` / `toolera_dev_2026`  
**JWT secret:** `toolera_shared_jwt_secret_dev_2026_min32chars_xK9!` (same across all services)  
**Dashboard env:** `Frontend/dashboard/.env.local` → `NEXT_PUBLIC_API_URL=http://localhost:5000`

**Start order:**
```bash
cd api-gateway && bun dev                            # :5000
cd Backend/store-management && bun dev               # :5001
cd Backend/business && bun dev                       # :5002
cd Frontend/dashboard && bun dev                     # :3001
```
