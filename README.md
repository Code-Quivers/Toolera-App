# Toolera App — Multi-Tenant E-Commerce SaaS Platform

Modern, full-featured multi-tenant e-commerce SaaS platform engineered for merchants and digital storefronts in Bangladesh.

## ✨ Core Features

- **SaaS Architecture (1 User = 1 Store)**:
  - Multi-tenant data isolation by `storeId`.
  - Onboarding wizard with auto-fill, back/next navigation, and draft persistence.
  - Subscription plan selection with PayStation gateway integration.
  - Gated navigation: locked catalog, orders, and CMS until subscription payment is completed.
- **Storefront & CMS**:
  - Modular Theme Customizer (Header, Navigation, Homepage Banners, Sliders, Footers).
  - High-converting product pages with attribute & variation management.
  - One-page streamlined checkout with Courier Logistics (Inside/Outside Dhaka) & COD support.
- **Admin Dashboard**:
  - Multi-tenant isolated KPIs (Revenue, Orders, Products, Net Profit & COGS).
  - Real-time Anti-Fraud engine (detection of duplicate checkouts and blacklisted phone numbers).
  - Dynamic store settings & resource utilization meters.

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and set your database connection and payment gateway credentials.

### 3. Database Migration & Prisma Setup
```bash
npm run db:push
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion, Lucide Icons, Zustand
- **Backend & Database**: Express / Next API, Prisma ORM, PostgreSQL / SQLite
- **Payments & Logistics**: PayStation, bKash, Nagad, Steadfast, Pathao Courier
