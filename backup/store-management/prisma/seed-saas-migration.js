const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  console.log('--- Starting Phase 2: Raifa\'s Mart Data Migration ---');
  
  // 1. Find or verify Raifa\'s Mart Store
  let store = await prisma.store.findFirst({
    where: { slug: 'raifas-mart' }
  });

  if (!store) {
    let owner = await prisma.user.findFirst({
      where: { email: 'admin@raifasmart.com' }
    });
    if (!owner) {
      owner = await prisma.user.create({
        data: {
          email: 'admin@raifasmart.com',
          passwordHash: '$2a$12$K1n0/fV596YdG3y1hFvS2.6E9gqQ.pA6hS7gKjB6i6e3gXmO9Ew6S', // password123
          name: 'Raifa Admin',
          role: 'OWNER'
        }
      });
    }
    store = await prisma.store.create({
      data: {
        name: "Raifa's Mart",
        slug: 'raifas-mart',
        ownerId: owner.id,
        status: 'ACTIVE',
        currency: 'BDT',
        currencySymbol: '৳',
        country: 'Bangladesh',
        timezone: 'Asia/Dhaka'
      }
    });
  }

  console.log('Target store:', store.id, store.name, '(' + store.slug + ')');

  // 2. Seed / Update Subscription Plans
  const plans = [
    {
      name: 'Starter',
      slug: 'starter',
      description: 'Ideal for new sellers launching their first store',
      priceMonthly: 499,
      priceYearly: 4990,
      badge: null,
      maxProducts: 100,
      maxOrdersPerMonth: 200,
      maxStaffMembers: 2,
      allowCustomDomain: false,
      allowCourierIntegration: true,
      allowSmsGateway: false,
      allowAnalytics: false,
      features: [
        '100 Products Catalog',
        'Built-in E-Commerce CMS',
        'Order & Dispatch Management',
        'Courier Booking (Steadfast & Pathao)',
        'Inventory & Stock Tracking',
        'Basic SEO & Sitemap'
      ]
    },
    {
      name: 'Growth',
      slug: 'growth',
      description: 'Everything you need to scale your e-commerce brand',
      priceMonthly: 999,
      priceYearly: 9990,
      badge: 'MOST POPULAR',
      maxProducts: 500,
      maxOrdersPerMonth: 1000,
      maxStaffMembers: 5,
      allowCustomDomain: true,
      allowCourierIntegration: true,
      allowSmsGateway: true,
      allowAnalytics: true,
      features: [
        '500 Products Catalog',
        'Advanced CMS & Drag-Drop Sections',
        'Discount Coupons & Promotions',
        'Customer Reviews & Photo Feedback',
        'Business Analytics & Profit/Loss',
        'Custom Domain Support',
        'Multi-Staff Access (Up to 5 accounts)'
      ]
    },
    {
      name: 'Pro',
      slug: 'pro',
      description: 'For high-volume merchants demanding maximum power',
      priceMonthly: 1999,
      priceYearly: 19990,
      badge: 'ENTERPRISE POWER',
      maxProducts: -1, // Unlimited
      maxOrdersPerMonth: -1,
      maxStaffMembers: 15,
      allowCustomDomain: true,
      allowCourierIntegration: true,
      allowSmsGateway: true,
      allowAnalytics: true,
      prioritySupport: true,
      features: [
        'Unlimited Products Catalog',
        'Unlimited Monthly Orders',
        'Advanced Marketing & GA4/Pixel Tracking',
        'Automated SMS Gateways (BulkSMS, Greenweb)',
        'Up to 15 Staff Accounts with Role Gating',
        'Priority 24/7 Dedicated Support',
        'Early Access to New Platform Features'
      ]
    }
  ];

  for (const p of plans) {
    const existing = await prisma.subscriptionPlan.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await prisma.subscriptionPlan.create({ data: p });
      console.log('Created plan:', p.name);
    } else {
      await prisma.subscriptionPlan.update({
        where: { slug: p.slug },
        data: p
      });
      console.log('Updated plan:', p.name);
    }
  }

  // 3. Ensure Subscription for Raifa's Mart
  const growthPlan = await prisma.subscriptionPlan.findUnique({ where: { slug: 'growth' } });
  let sub = await prisma.subscription.findUnique({ where: { storeId: store.id } });
  if (!sub && growthPlan) {
    const start = new Date();
    const end = new Date();
    end.setFullYear(end.getFullYear() + 1);
    await prisma.subscription.create({
      data: {
        storeId: store.id,
        planId: growthPlan.id,
        planSlug: 'growth',
        status: 'ACTIVE',
        billingCycle: 'YEARLY',
        currentPeriodStart: start,
        currentPeriodEnd: end,
        lastPaymentAmount: 9990,
        paymentMethod: 'BKASH'
      }
    });
    console.log('Assigned Growth subscription to Raifa\'s Mart');
  }

  // 4. Batch associate all existing orphaned data to Raifa's Mart
  const storeId = store.id;

  const [pCount, cCount, oCount, custCount, rCount, mCount, cpCount, pgCount, mnCount, alCount] = await Promise.all([
    prisma.product.updateMany({ where: { storeId: null }, data: { storeId } }),
    prisma.category.updateMany({ where: { storeId: null }, data: { storeId } }),
    prisma.order.updateMany({ where: { storeId: null }, data: { storeId } }),
    prisma.customer.updateMany({ where: { storeId: null }, data: { storeId } }),
    prisma.review.updateMany({ where: { storeId: null }, data: { storeId } }),
    prisma.mediaItem.updateMany({ where: { storeId: null }, data: { storeId } }),
    prisma.coupon.updateMany({ where: { storeId: null }, data: { storeId } }),
    prisma.page.updateMany({ where: { storeId: null }, data: { storeId } }),
    prisma.menu.updateMany({ where: { storeId: null }, data: { storeId } }),
    prisma.abandonedLead.updateMany({ where: { storeId: null }, data: { storeId } })
  ]);

  console.log('Migration results:');
  console.log('  Products assigned:', pCount.count);
  console.log('  Categories assigned:', cCount.count);
  console.log('  Orders assigned:', oCount.count);
  console.log('  Customers assigned:', custCount.count);
  console.log('  Reviews assigned:', rCount.count);
  console.log('  MediaItems assigned:', mCount.count);
  console.log('  Coupons assigned:', cpCount.count);
  console.log('  Pages assigned:', pgCount.count);
  console.log('  Menus assigned:', mnCount.count);
  console.log('  Abandoned Leads assigned:', alCount.count);

  console.log('--- Phase 2 Migration Completed Successfully! ---');
}

migrate().catch(console.error).finally(() => prisma['$disconnect']());
