import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { subscriptionPlansTable } from './src/app/db/schema.js';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const plans = [
  {
    name: 'Free Trial',
    slug: 'free-trial',
    description: 'Full access to all features free for 30 days. No credit card required.',
    priceMonthly: 0,
    priceYearly: 0,
    badge: '30 Days Free',
    features: [
      'Unlimited products',
      'Unlimited orders',
      'Advanced analytics',
      'Courier integration (Pathao & Steadfast)',
      'SMS gateway',
      'Custom domain',
      'Up to 5 staff members',
      'Priority support',
      'Full access — no restrictions',
    ],
    maxProducts: 999999,
    maxOrdersPerMonth: 999999,
    maxStaffMembers: 5,
    allowCustomDomain: true,
    allowCourierIntegration: true,
    allowSmsGateway: true,
    allowAnalytics: true,
    prioritySupport: true,
    isActive: true,
    position: 0,
  },
  {
    name: 'Pro',
    slug: 'pro',
    description: 'Everything you need to grow your online business.',
    priceMonthly: 999,
    priceYearly: 9990,
    badge: 'Most Popular',
    features: [
      'Unlimited products',
      'Unlimited orders',
      'Advanced analytics',
      'Courier integration (Pathao & Steadfast)',
      'SMS gateway',
      'Custom domain',
      'Up to 5 staff members',
      'Priority support',
    ],
    maxProducts: 999999,
    maxOrdersPerMonth: 999999,
    maxStaffMembers: 5,
    allowCustomDomain: true,
    allowCourierIntegration: true,
    allowSmsGateway: true,
    allowAnalytics: true,
    prioritySupport: true,
    isActive: true,
    position: 1,
  },
];

async function seed() {
  console.log('Seeding subscription plans...');
  for (const plan of plans) {
    await db
      .insert(subscriptionPlansTable)
      .values(plan)
      .onConflictDoUpdate({ target: subscriptionPlansTable.slug, set: plan });
    console.log(`✓ ${plan.name}`);
  }
  console.log('Done.');
  await pool.end();
}

seed().catch((err) => { console.error(err); process.exit(1); });
