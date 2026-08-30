# Toolera — Service Architecture

## Overview

The backend is split into two independent services. Each service owns its domain completely — its own Express process, its own database, and its own Prisma schema.

```
┌─────────────────────────────────────────────────────────────┐
│                      Cloudflare (Edge)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Nginx (Reverse Proxy)                      │
│  /api/v1/auth, /stores, /cms, /sms, /settings → :5001       │
│  /api/v1/products, /orders, /categories, ...  → :5002       │
└──────────┬───────────────────────────────────┬──────────────┘
           │                                   │
┌──────────▼──────────┐             ┌──────────▼──────────────┐
│  Store Management   │◄────────────│   Business Service       │
│     Service         │  REST (sync)│      :5002               │
│      :5001          │────────────►│                          │
└──────────┬──────────┘             └──────────┬───────────────┘
           │                                   │
           │           Kafka Events            │
           └──────────────┬────────────────────┘
                          │
               ┌──────────▼──────────┐
               │  order.placed       │
               │  order.updated      │
               │  order.shipped      │
               └─────────────────────┘
```

---

## Service 1 — Store Management Service

**Port:** `5001`  
**Directory:** `services/store-management/`  
**Database:** `store_management_db`

Owns everything about **how a store is configured and operated at the platform level**.

### Responsibilities

| Domain            | Endpoints                          |
|-------------------|------------------------------------|
| Auth              | `/api/v1/auth/*`                   |
| Store settings    | `/api/v1/stores/*`                 |
| CMS / Theme       | `/api/v1/cms/*`                    |
| SMS gateway       | `/api/v1/sms/*`                    |
| Shipping rates    | `/api/v1/settings/shipping`        |
| Invoice template  | `/api/v1/settings/invoice`         |
| Subscriptions     | `/api/v1/subscriptions/*`          |
| Backup / Restore  | `/api/v1/backup/*`                 |
| Internal API      | `/api/v1/internal/*`               |

### Database Tables — `store_management_db`

```
stores
store_members
store_domains
cms_sections
theme_config
sms_settings
sms_logs
invoice_templates
shipping_zones
shipping_rates
expenses
subscriptions
subscription_plans
subscription_invoices
audit_logs
users
```

### Files

```
services/store-management/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── backup.controller.ts
│   │   ├── cms.controller.ts
│   │   ├── internal.controller.ts
│   │   ├── settings.controller.ts
│   │   ├── sms.controller.ts
│   │   ├── store.controller.ts
│   │   └── subscription.controller.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── backup.routes.ts
│   │   ├── cms.routes.ts
│   │   ├── internal.routes.ts
│   │   ├── settings.routes.ts
│   │   ├── sms.routes.ts
│   │   ├── store.routes.ts
│   │   └── subscription.routes.ts
│   ├── services/
│   │   └── sms.service.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── prisma.ts
│   └── index.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── seed-saas-migration.js
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Service 2 — Business Service

**Port:** `5002`  
**Directory:** `services/business/`  
**Database:** `business_db`

Owns everything about **day-to-day operations** — what customers and staff interact with.

### Responsibilities

| Domain            | Endpoints                          |
|-------------------|------------------------------------|
| Products          | `/api/v1/products/*`               |
| Categories        | `/api/v1/categories/*`             |
| Orders            | `/api/v1/orders/*`                 |
| Customers         | (within orders domain)             |
| Inventory         | `/api/v1/inventory/*`              |
| Courier           | `/api/v1/courier/*`                |
| Payments          | `/api/v1/payment/*`                |
| Reviews           | `/api/v1/reviews/*`                |
| Coupons           | `/api/v1/coupons/*`                |
| Abandoned Leads   | `/api/v1/orders/abandoned-leads/*` |
| File Uploads      | `/api/v1/upload/*`                 |

### Database Tables — `business_db`

```
products
product_variants
product_attributes
product_attribute_values
categories
orders
order_items
order_status_logs
customers
inventory_logs
courier_bookings
courier_logs
abandoned_leads
reviews
coupons
media_items
audit_logs
```

### Files

```
services/business/
├── src/
│   ├── controllers/
│   │   ├── categories.controller.ts
│   │   ├── coupons.controller.ts
│   │   ├── courier.controller.ts
│   │   ├── orders.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── products.controller.ts
│   │   ├── reviews.controller.ts
│   │   └── upload.controller.ts
│   ├── routes/
│   │   ├── categories.routes.ts
│   │   ├── coupons.routes.ts
│   │   ├── courier.routes.ts
│   │   ├── orders.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── products.routes.ts
│   │   ├── reviews.routes.ts
│   │   └── upload.routes.ts
│   ├── services/
│   │   ├── bkash.service.ts
│   │   ├── nagad.service.ts
│   │   ├── pathao.service.ts
│   │   └── steadfast.service.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── prisma.ts
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── uploads/
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Cross-Service Communication

### Synchronous (REST)

| Trigger                        | From    | To                  | Endpoint                              |
|-------------------------------|---------|---------------------|---------------------------------------|
| Checkout needs shipping rate  | Business | Store Management   | `GET /api/v1/settings/shipping`       |
| Invoice PDF needs template    | Business | Store Management   | `GET /api/v1/settings/invoice`        |
| P&L needs order revenue       | Store Mgmt | Business        | `GET /api/v1/orders/revenue-summary`  |
| Frontend auth guard (SSR)     | Frontend | Store Management   | `GET /api/v1/internal/user`           |
| Frontend store guard (SSR)    | Frontend | Store Management   | `GET /api/v1/internal/store`          |

### Asynchronous (Kafka — future phase)

| Event            | Published by    | Consumed by          | Action                      |
|------------------|-----------------|----------------------|-----------------------------|
| `order.placed`   | Business        | Store Management     | Send SMS to customer        |
| `order.updated`  | Business        | Store Management     | Send status SMS             |
| `order.shipped`  | Business        | Store Management     | Send tracking SMS           |
| `payment.done`   | Business        | Store Management     | Update P&L revenue record   |

---

## Database Split

```
store_management_db              business_db
────────────────────────         ─────────────────────────
stores                           products
store_members                    product_variants
store_domains                    categories
cms_sections                     orders
theme_config                     order_items
sms_settings                     customers
sms_logs                         inventory_logs
invoice_templates                courier_bookings
shipping_zones                   abandoned_leads
shipping_rates                   audit_logs
expenses
audit_logs
users
subscriptions
subscription_plans
```

---

## Environment Variables

### Store Management Service (`services/store-management/.env`)

```env
PORT=5001
DATABASE_URL=postgresql://...store_management_db
JWT_SECRET=
INTERNAL_SERVICE_KEY=
BUSINESS_SERVICE_URL=http://localhost:5002
```

### Business Service (`services/business/.env`)

```env
PORT=5002
DATABASE_URL=postgresql://...business_db
JWT_SECRET=                         # same as store-management
STORE_MANAGEMENT_URL=http://localhost:5001
STEADFAST_API_KEY=
STEADFAST_SECRET_KEY=
PATHAO_CLIENT_ID=
PATHAO_CLIENT_SECRET=
PATHAO_USERNAME=
PATHAO_PASSWORD=
PATHAO_STORE_ID=
```

---

## Running Locally

```bash
# Store Management Service
cd services/store-management
npm install
npm run dev          # starts on :5001

# Business Service (separate terminal)
cd services/business
npm install
npm run dev          # starts on :5002

# Frontend
cd frontend
npm install
npm run dev          # starts on :3000
```

---

## Migration Phases

| Phase | What                                            | Status   |
|-------|-------------------------------------------------|----------|
| 1     | Split into two service directories (done)       | ✅ Done  |
| 2     | Separate PostgreSQL databases per service       | Pending  |
| 3     | Add Kafka for async cross-service events        | Pending  |
| 4     | Containerise each service independently         | Pending  |
| 5     | Deploy to Kubernetes with separate scaling      | Pending  |
