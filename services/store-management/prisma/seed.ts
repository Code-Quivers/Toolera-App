import { PrismaClient, AttributeType, ReviewStatus, DiscountType, Role } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const DB_DIR = path.join(process.cwd(), "src", "data", "db");

function readJson(filename: string, fallback: any = []) {
  try {
    const file = path.join(DB_DIR, filename);
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return fallback;
  }
}

async function main() {
  console.log("🌱 Starting Supabase PostgreSQL Data Seed...");

  // 1. Admin User & SaaS Multi-Tenant Plans & Store
  console.log("👤 Seeding Admin User & SaaS Platform Plans...");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@raifasmart.com" },
    update: {},
    create: {
      email: "admin@raifasmart.com",
      passwordHash: "admin123",
      name: "Raifa's Mart Super Admin",
      role: Role.ADMIN,
    },
  });

  // Seed SaaS Subscription Plans
  console.log("💎 Seeding SaaS Subscription Plans...");
  const plans = [
    {
      name: "Free Trial",
      slug: "free",
      description: "Perfect for testing and launching your first online store",
      priceMonthly: 0,
      priceYearly: 0,
      badge: null,
      maxProducts: 20,
      maxOrdersPerMonth: 50,
      maxStaffMembers: 1,
      allowCustomDomain: false,
      allowCourierIntegration: false,
      allowSmsGateway: false,
      allowAnalytics: false,
      prioritySupport: false,
      position: 0,
      features: [
        "Up to 20 Products",
        "50 Orders per month",
        "Standard Cash on Delivery",
        "1 Staff Seat",
        "Standard Themes",
        "Community Support",
      ],
    },
    {
      name: "Starter",
      slug: "starter",
      description: "For small businesses and ambitious creator shops",
      priceMonthly: 990,
      priceYearly: 9900,
      badge: null,
      maxProducts: 100,
      maxOrdersPerMonth: 500,
      maxStaffMembers: 3,
      allowCustomDomain: true,
      allowCourierIntegration: true,
      allowSmsGateway: false,
      allowAnalytics: true,
      prioritySupport: false,
      position: 1,
      features: [
        "Up to 100 Products",
        "500 Orders per month",
        "Custom Domain Connection",
        "Steadfast & Pathao Courier API",
        "3 Staff Seats",
        "Basic Analytics & Sales Reports",
        "bKash & Nagad Payment Verification",
        "Email Support",
      ],
    },
    {
      name: "Pro Business",
      slug: "pro",
      description: "For scaling brands and high-volume e-commerce stores",
      priceMonthly: 2490,
      priceYearly: 24900,
      badge: "Most Popular",
      maxProducts: 1000,
      maxOrdersPerMonth: 3000,
      maxStaffMembers: 10,
      allowCustomDomain: true,
      allowCourierIntegration: true,
      allowSmsGateway: true,
      allowAnalytics: true,
      prioritySupport: true,
      position: 2,
      features: [
        "Up to 1,000 Products",
        "3,000 Orders per month",
        "Free Custom Domain SSL",
        "Full Courier Integrations (Steadfast/Pathao)",
        "Automated SMS Gateway (Greenweb/BulkSMSBD)",
        "10 Staff Seats & Role Permissions",
        "Advanced Analytics, Meta Pixel & GA4",
        "Priority 24/7 WhatsApp Support",
      ],
    },
    {
      name: "Enterprise",
      slug: "enterprise",
      description: "Dedicated infrastructure, unlimited capacity, and custom features",
      priceMonthly: 4990,
      priceYearly: 49900,
      badge: "Best Value",
      maxProducts: -1,
      maxOrdersPerMonth: -1,
      maxStaffMembers: 50,
      allowCustomDomain: true,
      allowCourierIntegration: true,
      allowSmsGateway: true,
      allowAnalytics: true,
      prioritySupport: true,
      position: 3,
      features: [
        "Unlimited Products & Orders",
        "Multiple Custom Domains & Subdomains",
        "All Courier & Automated SMS Integrations",
        "50 Staff Seats & Granular Permissions",
        "Dedicated Account Manager",
        "Daily Cloud Database Backups",
        "Zero Transaction Commission",
        "VIP Support & Custom Integrations",
      ],
    },
  ];

  const planMap = new Map<string, string>();
  for (const p of plans) {
    const createdPlan = await prisma.subscriptionPlan.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        priceMonthly: p.priceMonthly,
        priceYearly: p.priceYearly,
        badge: p.badge,
        maxProducts: p.maxProducts,
        maxOrdersPerMonth: p.maxOrdersPerMonth,
        maxStaffMembers: p.maxStaffMembers,
        allowCustomDomain: p.allowCustomDomain,
        allowCourierIntegration: p.allowCourierIntegration,
        allowSmsGateway: p.allowSmsGateway,
        allowAnalytics: p.allowAnalytics,
        prioritySupport: p.prioritySupport,
        features: p.features,
        position: p.position,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        priceMonthly: p.priceMonthly,
        priceYearly: p.priceYearly,
        badge: p.badge,
        maxProducts: p.maxProducts,
        maxOrdersPerMonth: p.maxOrdersPerMonth,
        maxStaffMembers: p.maxStaffMembers,
        allowCustomDomain: p.allowCustomDomain,
        allowCourierIntegration: p.allowCourierIntegration,
        allowSmsGateway: p.allowSmsGateway,
        allowAnalytics: p.allowAnalytics,
        prioritySupport: p.prioritySupport,
        features: p.features,
        position: p.position,
      },
    });
    planMap.set(p.slug, createdPlan.id);
  }

  // Seed Default Store & Pro Subscription
  console.log("🏪 Seeding Default Store & Active Subscription...");
  const defaultStore = await prisma.store.upsert({
    where: { slug: "raifas-mart" },
    update: {
      name: "Raifa's Mart",
      currency: "BDT",
      currencySymbol: "৳",
    },
    create: {
      name: "Raifa's Mart",
      slug: "raifas-mart",
      description: "Trending Lifestyle & Smart Tech Store in Bangladesh",
      currency: "BDT",
      currencySymbol: "৳",
      ownerId: adminUser.id,
      status: "ACTIVE",
    },
  });

  // Attach Store Membership for Admin
  await prisma.storeMember.upsert({
    where: {
      storeId_userId: {
        storeId: defaultStore.id,
        userId: adminUser.id,
      },
    },
    update: { role: "OWNER" },
    create: {
      storeId: defaultStore.id,
      userId: adminUser.id,
      role: "OWNER",
      status: "ACTIVE",
    },
  });

  // Attach Active Pro Subscription
  const proPlanId = planMap.get("pro");
  if (proPlanId) {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    await prisma.subscription.upsert({
      where: { storeId: defaultStore.id },
      update: {
        planId: proPlanId,
        planSlug: "pro",
        status: "ACTIVE",
        currentPeriodEnd: nextYear,
      },
      create: {
        storeId: defaultStore.id,
        planId: proPlanId,
        planSlug: "pro",
        status: "ACTIVE",
        billingCycle: "YEARLY",
        currentPeriodStart: new Date(),
        currentPeriodEnd: nextYear,
        paymentMethod: "BKASH",
        lastPaymentTrxId: "TRX_PRO_SAAS_2026",
        lastPaymentAmount: 24900,
        lastPaymentDate: new Date(),
      },
    });

    // Seed initial invoice
    await prisma.subscriptionInvoice.upsert({
      where: { invoiceNumber: "INV-2026-0001" },
      update: {},
      create: {
        storeId: defaultStore.id,
        subscriptionId: (await prisma.subscription.findUnique({ where: { storeId: defaultStore.id } }))!.id,
        invoiceNumber: "INV-2026-0001",
        amount: 24900,
        currency: "BDT",
        status: "PAID",
        paymentMethod: "bKash PGW",
        transactionId: "TRX_PRO_SAAS_2026",
        periodStart: new Date(),
        periodEnd: nextYear,
        notes: "Annual Pro Business SaaS Subscription for Raifa's Mart",
        paidAt: new Date(),
      },
    });
  }

  // 2. Categories
  console.log("📁 Seeding Categories...");
  const rawCategories = readJson("categories.json", []);
  const categoryMap = new Map<string, string>(); // name/slug -> category.id

  for (const cat of rawCategories) {
    const slug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-");
    const created = await prisma.category.upsert({
      where: { slug },
      update: {
        name: cat.name,
        image: cat.image || null,
        description: cat.description || null,
      },
      create: {
        id: cat.id || undefined,
        name: cat.name,
        slug,
        image: cat.image || null,
        description: cat.description || null,
      },
    });
    categoryMap.set(slug, created.id);
    categoryMap.set(cat.name.toLowerCase(), created.id);
  }

  // Ensure default fallback category exists
  const defaultCat = await prisma.category.upsert({
    where: { slug: "general" },
    update: {},
    create: {
      name: "General Collection",
      slug: "general",
      description: "General curated store products",
    },
  });

  // 3. Attributes & Values
  console.log("🎨 Seeding Attributes...");
  const rawAttributes = readJson("attributes.json", []);
  for (const attr of rawAttributes) {
    if (!attr.slug || !attr.name) continue;
    const typeEnum = (attr.type as AttributeType) || AttributeType.SELECT;
    const createdAttr = await prisma.attribute.upsert({
      where: { slug: attr.slug },
      update: { name: attr.name, type: typeEnum },
      create: {
        id: attr.id || undefined,
        name: attr.name,
        slug: attr.slug,
        type: typeEnum,
        position: attr.position || 0,
      },
    });

    if (Array.isArray(attr.values)) {
      for (const val of attr.values) {
        if (!val.slug || !val.name) continue;
        await prisma.attributeValue.upsert({
          where: {
            attributeId_slug: {
              attributeId: createdAttr.id,
              slug: val.slug,
            },
          },
          update: {
            name: val.name,
            colorHex: val.colorHex || null,
            imageUrl: val.imageUrl || null,
          },
          create: {
            id: val.id || undefined,
            attributeId: createdAttr.id,
            name: val.name,
            slug: val.slug,
            colorHex: val.colorHex || null,
            imageUrl: val.imageUrl || null,
            position: val.position || 0,
          },
        });
      }
    }
  }

  // 4. Products & Product Images
  console.log("📦 Seeding Products...");
  const rawProducts = readJson("products.json", []);
  const productMap = new Map<string, string>(); // slug/id -> product.id

  for (const prod of rawProducts) {
    const slug = prod.slug || prod.title.toLowerCase().replace(/\s+/g, "-");
    const catSlug = prod.categorySlug || (prod.category ? prod.category.toLowerCase().replace(/\s+/g, "-") : "general");
    const categoryId = categoryMap.get(catSlug) || categoryMap.get(prod.category?.toLowerCase()) || defaultCat.id;

    const createdProd = await prisma.product.upsert({
      where: { slug },
      update: {
        title: prod.title,
        price: Number(prod.price) || 0,
        sku: prod.sku || `SKU-${slug}`,
        shortDescription: prod.shortDescription || prod.title,
        description: prod.description || prod.shortDescription || prod.title,
        badge: prod.badge || null,
        tags: Array.isArray(prod.tags) ? prod.tags : [],
        isFeatured: Boolean(prod.isFeatured),
        isTrending: Boolean(prod.isTrending),
        isNewArrival: Boolean(prod.isNewArrival),
        isBestSeller: Boolean(prod.isBestSeller),
        productType: prod.productType || "SIMPLE",
        categoryId,
      },
      create: {
        id: prod.id || undefined,
        title: prod.title,
        slug,
        price: Number(prod.price) || 0,
        compareAtPrice: prod.compareAtPrice ? Number(prod.compareAtPrice) : null,
        stock: Number(prod.stock) || 0,
        sku: prod.sku || `SKU-${slug}`,
        shortDescription: prod.shortDescription || prod.title,
        description: prod.description || prod.shortDescription || prod.title,
        badge: prod.badge || null,
        tags: Array.isArray(prod.tags) ? prod.tags : [],
        isFeatured: Boolean(prod.isFeatured),
        isTrending: Boolean(prod.isTrending),
        isNewArrival: Boolean(prod.isNewArrival),
        isBestSeller: Boolean(prod.isBestSeller),
        productType: prod.productType || "SIMPLE",
        categoryId,
      },
    });

    productMap.set(slug, createdProd.id);
    productMap.set(createdProd.id, createdProd.id);

    // Seed product images
    if (Array.isArray(prod.images)) {
      await prisma.productImage.deleteMany({ where: { productId: createdProd.id } });
      for (let i = 0; i < prod.images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: createdProd.id,
            url: prod.images[i],
            position: i,
          },
        });
      }
    }
  }

  // 5. Reviews
  console.log("⭐ Seeding Reviews...");
  const rawReviews = readJson("reviews.json", []);
  const reviewList = Array.isArray(rawReviews)
    ? rawReviews
    : Array.isArray(rawReviews?.reviews)
    ? rawReviews.reviews
    : [];

  for (const rev of reviewList) {
    const prodId = productMap.get(rev.productId) || productMap.get(rev.productSlug) || (Array.from(productMap.values())[0] ?? null);
    if (!prodId) continue;

    await prisma.review.create({
      data: {
        productId: prodId,
        customerName: rev.authorName || rev.customerName || "Customer",
        customerLocation: rev.authorLocation || rev.location || "Dhaka",
        rating: Math.min(5, Math.max(1, Number(rev.rating) || 5)),
        comment: rev.comment || "Great product!",
        status: rev.status === "REJECTED" ? ReviewStatus.REJECTED : rev.status === "PENDING" ? ReviewStatus.PENDING : ReviewStatus.APPROVED,
      },
    }).catch(() => {});
  }

  // 6. Coupons
  console.log("🏷️ Seeding Coupons...");
  const rawCoupons = readJson("coupons.json", []);
  for (const c of rawCoupons) {
    if (!c.code) continue;
    await prisma.coupon.upsert({
      where: { code: c.code.toUpperCase() },
      update: {
        discountType: c.discountType === "FIXED" ? DiscountType.FIXED : DiscountType.PERCENTAGE,
        discountValue: Number(c.discountValue) || 10,
        active: c.active !== false,
      },
      create: {
        id: c.id || undefined,
        code: c.code.toUpperCase(),
        discountType: c.discountType === "FIXED" ? DiscountType.FIXED : DiscountType.PERCENTAGE,
        discountValue: Number(c.discountValue) || 10,
        active: c.active !== false,
      },
    });
  }

  // 7. Site & Shipping Settings
  console.log("⚙️ Seeding Settings...");
  await prisma.siteSettings.upsert({
    where: { id: "default_site_settings" },
    update: {},
    create: {
      id: "default_site_settings",
      storeName: "Raifa's Mart",
      tagline: "Discover What's Trending. Smart Finds. Better Prices.",
      phone: "+880 1712-345678",
      whatsapp: "+8801712345678",
      email: "support@raifasmart.com",
    },
  });

  await prisma.shippingSettings.upsert({
    where: { id: "default_shipping_settings" },
    update: {},
    create: {
      id: "default_shipping_settings",
      insideDhakaFee: 70,
      outsideDhakaFee: 130,
      freeShippingThreshold: 2000,
    },
  });

  console.log("✅ Supabase PostgreSQL Database Seeded Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
