import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { subscriptionPlansTable } from './src/app/db/schema.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool);

const plans = [
  {
    name: 'Free Trial',
    slug: 'free-trial',
    description: '30-day free trial — full access to all features',
    priceMonthly: 0,
    priceYearly: 0,
    badge: 'Free',
    features: ['All features included', 'Up to 500 products', 'Unlimited orders', 'Custom domain', 'Analytics', 'SMS gateway', 'Priority support'],
    maxProducts: 500,
    maxOrdersPerMonth: 9999,
    maxStaffMembers: 10,
    maxStorageMb: 2048,
    allowCustomDomain: true,
    allowCourierIntegration: true,
    allowSmsGateway: true,
    allowAnalytics: true,
    prioritySupport: true,
    trialDays: 30,
    isActive: true,
    position: 0,
  },
  {
    name: 'Pro',
    slug: 'pro',
    description: 'Full-featured plan for growing businesses',
    priceMonthly: 999,
    priceYearly: 9990,
    badge: 'Popular',
    features: ['500 products', 'Unlimited orders', 'Custom domain', 'Analytics', 'SMS gateway', 'Courier integration', 'Priority support'],
    maxProducts: 500,
    maxOrdersPerMonth: 9999,
    maxStaffMembers: 10,
    maxStorageMb: 2048,
    allowCustomDomain: true,
    allowCourierIntegration: true,
    allowSmsGateway: true,
    allowAnalytics: true,
    prioritySupport: true,
    trialDays: 0,
    isActive: true,
    position: 1,
  },
];

async function seed() {
  console.log('Seeding subscription plans...');
  for (const plan of plans) {
    await db.insert(subscriptionPlansTable).values(plan as any).onConflictDoUpdate({
      target: subscriptionPlansTable.slug,
      set: {
        name: plan.name,
        description: plan.description,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        badge: plan.badge,
        features: plan.features,
        maxProducts: plan.maxProducts,
        maxOrdersPerMonth: plan.maxOrdersPerMonth,
        maxStaffMembers: plan.maxStaffMembers,
        maxStorageMb: plan.maxStorageMb,
        allowCustomDomain: plan.allowCustomDomain,
        allowCourierIntegration: plan.allowCourierIntegration,
        allowSmsGateway: plan.allowSmsGateway,
        allowAnalytics: plan.allowAnalytics,
        prioritySupport: plan.prioritySupport,
        trialDays: plan.trialDays,
        isActive: plan.isActive,
        position: plan.position,
      },
    });
    console.log(`  ✓ ${plan.name}`);
  }
  console.log('Done.');
  await pool.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
