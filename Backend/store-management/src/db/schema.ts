import { randomUUID } from 'crypto';
import {
  pgTable,
  pgEnum,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  doublePrecision,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── Enums ──────────────────────────────────────────────────────────────────

export const storeStatusEnum = pgEnum('StoreStatus', ['SETUP', 'CLOSED', 'ACTIVE', 'TRIAL', 'SUSPENDED', 'INACTIVE']);
export const storeMemberRoleEnum = pgEnum('StoreMemberRole', ['OWNER', 'ADMIN', 'MANAGER', 'STAFF']);
export const subscriptionStatusEnum = pgEnum('SubscriptionStatus', ['ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELLED', 'EXPIRED']);
export const billingCycleEnum = pgEnum('BillingCycle', ['MONTHLY', 'YEARLY']);
export const roleEnum = pgEnum('Role', ['OWNER', 'ADMIN', 'EDITOR', 'MANAGER', 'STAFF']);
export const pageStatusEnum = pgEnum('PageStatus', ['DRAFT', 'PUBLISHED']);
export const menuLocationEnum = pgEnum('MenuLocation', ['HEADER', 'FOOTER', 'MOBILE']);
export const productStatusEnum = pgEnum('ProductStatus', ['DRAFT', 'PUBLISHED']);
export const attributeTypeEnum = pgEnum('AttributeType', ['COLOR', 'BUTTON', 'SELECT', 'IMAGE', 'TEXT']);
export const variationStatusEnum = pgEnum('VariationStatus', ['ACTIVE', 'INACTIVE', 'ARCHIVED']);
export const orderStatusEnum = pgEnum('OrderStatus', ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']);
export const paymentStatusEnum = pgEnum('PaymentStatus', ['PENDING', 'PAID', 'FAILED', 'REFUNDED']);
export const paymentProviderEnum = pgEnum('PaymentProvider', ['COD', 'BKASH', 'NAGAD', 'CARD']);
export const reviewStatusEnum = pgEnum('ReviewStatus', ['PENDING', 'APPROVED', 'REJECTED']);
export const discountTypeEnum = pgEnum('DiscountType', ['PERCENTAGE', 'FIXED']);

// ── Tables ─────────────────────────────────────────────────────────────────

export const usersTable = pgTable('User', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  email: text('email').notNull().unique(),
  passwordHash: text('passwordHash').notNull(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  role: roleEnum('role').notNull().default('OWNER'),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (t) => [
  index('User_email_idx').on(t.email),
]);

export const storesTable = pgTable('Store', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  customDomain: text('customDomain').unique(),
  description: text('description'),
  tagline: text('tagline'),
  logoUrl: text('logoUrl'),
  faviconUrl: text('faviconUrl'),
  email: text('email'),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  address: text('address'),
  district: text('district'),
  country: text('country').notNull().default('Bangladesh'),
  currency: text('currency').notNull().default('BDT'),
  currencySymbol: text('currencySymbol').notNull().default('৳'),
  timezone: text('timezone').notNull().default('Asia/Dhaka'),
  status: storeStatusEnum('status').notNull().default('SETUP'),
  ownerId: text('ownerId').notNull().unique(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (t) => [
  index('Store_slug_idx').on(t.slug),
  index('Store_customDomain_idx').on(t.customDomain),
  index('Store_ownerId_idx').on(t.ownerId),
  index('Store_status_idx').on(t.status),
]);

export const storeDomainsTable = pgTable('StoreDomain', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  storeId: text('storeId').notNull(),
  domain: text('domain').notNull().unique(),
  isPrimary: boolean('isPrimary').notNull().default(false),
  verified: boolean('verified').notNull().default(false),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('StoreDomain_storeId_idx').on(t.storeId),
  index('StoreDomain_domain_idx').on(t.domain),
]);

export const storeMembersTable = pgTable('StoreMember', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  storeId: text('storeId').notNull(),
  userId: text('userId').notNull(),
  role: storeMemberRoleEnum('role').notNull().default('STAFF'),
  status: text('status').notNull().default('ACTIVE'),
  joinedAt: timestamp('joinedAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique('StoreMember_storeId_userId_key').on(t.storeId, t.userId),
  index('StoreMember_storeId_idx').on(t.storeId),
  index('StoreMember_userId_idx').on(t.userId),
]);

export const subscriptionPlansTable = pgTable('SubscriptionPlan', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  priceMonthly: integer('priceMonthly').notNull().default(0),
  priceYearly: integer('priceYearly').notNull().default(0),
  badge: text('badge'),
  features: jsonb('features').notNull(),
  maxProducts: integer('maxProducts').notNull().default(50),
  maxOrdersPerMonth: integer('maxOrdersPerMonth').notNull().default(100),
  maxStaffMembers: integer('maxStaffMembers').notNull().default(2),
  allowCustomDomain: boolean('allowCustomDomain').notNull().default(false),
  allowCourierIntegration: boolean('allowCourierIntegration').notNull().default(false),
  allowSmsGateway: boolean('allowSmsGateway').notNull().default(false),
  allowAnalytics: boolean('allowAnalytics').notNull().default(false),
  prioritySupport: boolean('prioritySupport').notNull().default(false),
  isActive: boolean('isActive').notNull().default(true),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (t) => [
  index('SubscriptionPlan_slug_idx').on(t.slug),
  index('SubscriptionPlan_isActive_idx').on(t.isActive),
]);

export const subscriptionsTable = pgTable('Subscription', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  storeId: text('storeId').notNull().unique(),
  planId: text('planId').notNull(),
  planSlug: text('planSlug').notNull().default('pro'),
  status: subscriptionStatusEnum('status').notNull().default('ACTIVE'),
  billingCycle: billingCycleEnum('billingCycle').notNull().default('MONTHLY'),
  currentPeriodStart: timestamp('currentPeriodStart', { withTimezone: true }).notNull().defaultNow(),
  currentPeriodEnd: timestamp('currentPeriodEnd', { withTimezone: true }).notNull(),
  trialEndsAt: timestamp('trialEndsAt', { withTimezone: true }),
  cancelAtPeriodEnd: boolean('cancelAtPeriodEnd').notNull().default(false),
  paymentMethod: text('paymentMethod').notNull().default('BKASH'),
  lastPaymentTrxId: text('lastPaymentTrxId'),
  lastPaymentAmount: integer('lastPaymentAmount').notNull().default(0),
  lastPaymentDate: timestamp('lastPaymentDate', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (t) => [
  index('Subscription_storeId_idx').on(t.storeId),
  index('Subscription_planId_idx').on(t.planId),
  index('Subscription_status_idx').on(t.status),
]);

export const subscriptionInvoicesTable = pgTable('SubscriptionInvoice', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  subscriptionId: text('subscriptionId').notNull(),
  storeId: text('storeId').notNull(),
  invoiceNumber: text('invoiceNumber').notNull().unique(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('BDT'),
  status: paymentStatusEnum('status').notNull().default('PAID'),
  paymentMethod: text('paymentMethod').notNull().default('BKASH'),
  transactionId: text('transactionId'),
  periodStart: timestamp('periodStart', { withTimezone: true }).notNull(),
  periodEnd: timestamp('periodEnd', { withTimezone: true }).notNull(),
  notes: text('notes'),
  pdfUrl: text('pdfUrl'),
  paidAt: timestamp('paidAt', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('SubscriptionInvoice_subscriptionId_idx').on(t.subscriptionId),
  index('SubscriptionInvoice_storeId_idx').on(t.storeId),
  index('SubscriptionInvoice_invoiceNumber_idx').on(t.invoiceNumber),
]);

export const auditLogsTable = pgTable('AuditLog', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  storeId: text('storeId'),
  userId: text('userId'),
  userName: text('userName').notNull(),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: text('entityId'),
  metadata: jsonb('metadata'),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('AuditLog_entity_entityId_idx').on(t.entity, t.entityId),
  index('AuditLog_userId_idx').on(t.userId),
  index('AuditLog_timestamp_idx').on(t.timestamp),
]);

export const pagesTable = pgTable('Page', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  storeId: text('storeId'),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  status: pageStatusEnum('status').notNull().default('PUBLISHED'),
  isHomepage: boolean('isHomepage').notNull().default(false),
  currentRevisionId: text('currentRevisionId'),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (t) => [
  index('Page_slug_idx').on(t.slug),
  index('Page_status_idx').on(t.status),
]);

export const pageRevisionsTable = pgTable('PageRevision', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  pageId: text('pageId').notNull(),
  version: integer('version').notNull(),
  title: text('title').notNull(),
  sectionsSnapshot: jsonb('sectionsSnapshot').notNull(),
  isPublished: boolean('isPublished').notNull().default(false),
  publishedAt: timestamp('publishedAt', { withTimezone: true }),
  createdBy: text('createdBy').notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('PageRevision_pageId_version_idx').on(t.pageId, t.version),
  index('PageRevision_isPublished_idx').on(t.isPublished),
]);

export const themeSettingsTable = pgTable('ThemeSettings', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  primary: text('primary').notNull().default('#0F172A'),
  accent: text('accent').notNull().default('#0D9488'),
  background: text('background').notNull().default('#FFFFFF'),
  surface: text('surface').notNull().default('#F8FAFC'),
  text: text('text').notNull().default('#0F172A'),
  muted: text('muted').notNull().default('#64748B'),
  border: text('border').notNull().default('#E2E8F0'),
  headingFont: text('headingFont').notNull().default('Inter'),
  bodyFont: text('bodyFont').notNull().default('Inter'),
  radius: text('radius').notNull().default('1rem'),
  shadow: text('shadow').notNull().default('subtle'),
  containerWidth: text('containerWidth').notNull().default('1280px'),
  sectionSpacing: text('sectionSpacing').notNull().default('3rem'),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const headerSettingsTable = pgTable('HeaderSettings', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  logoUrl: text('logoUrl'),
  showSearch: boolean('showSearch').notNull().default(true),
  showWishlist: boolean('showWishlist').notNull().default(true),
  showCart: boolean('showCart').notNull().default(true),
  isSticky: boolean('isSticky').notNull().default(true),
  announcementText: text('announcementText').notNull().default('Free delivery on orders over ৳2,000 • Cash on Delivery available'),
  announcementActive: boolean('announcementActive').notNull().default(true),
  links: jsonb('links'),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const footerSettingsTable = pgTable('FooterSettings', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  columns: jsonb('columns'),
  copyrightText: text('copyrightText').notNull().default("© 2026 Raifa's Mart. All rights reserved. Curated for Bangladesh."),
  socialLinks: jsonb('socialLinks'),
  paymentBadgesActive: boolean('paymentBadgesActive').notNull().default(true),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const menusTable = pgTable('Menu', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  storeId: text('storeId'),
  name: text('name').notNull(),
  location: menuLocationEnum('location').notNull().default('HEADER'),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
});

export const menuItemsTable = pgTable('MenuItem', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  menuId: text('menuId').notNull(),
  parentId: text('parentId'),
  title: text('title').notNull(),
  url: text('url').notNull(),
  position: integer('position').notNull().default(0),
  isExternal: boolean('isExternal').notNull().default(false),
}, (t) => [
  index('MenuItem_menuId_position_idx').on(t.menuId, t.position),
]);

export const categoriesTable = pgTable('Category', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  storeId: text('storeId'),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  image: text('image'),
  parentId: text('parentId'),
  position: integer('position').notNull().default(0),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('Category_slug_idx').on(t.slug),
  index('Category_parentId_idx').on(t.parentId),
]);

export const productsTable = pgTable('Product', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  storeId: text('storeId'),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  shortDescription: text('shortDescription').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  compareAtPrice: integer('compareAtPrice'),
  buyingPrice: integer('buyingPrice'),
  sku: text('sku').notNull().unique(),
  categoryId: text('categoryId').notNull(),
  stock: integer('stock').notNull().default(0),
  badge: text('badge'),
  tags: text('tags').array().notNull().default([]),
  isFeatured: boolean('isFeatured').notNull().default(false),
  isTrending: boolean('isTrending').notNull().default(false),
  isNewArrival: boolean('isNewArrival').notNull().default(false),
  isBestSeller: boolean('isBestSeller').notNull().default(false),
  status: productStatusEnum('status').notNull().default('PUBLISHED'),
  features: jsonb('features'),
  specifications: jsonb('specifications'),
  calculatedRating: doublePrecision('calculatedRating').notNull().default(5.0),
  calculatedReviewCount: integer('calculatedReviewCount').notNull().default(0),
  productType: text('productType').notNull().default('SIMPLE'),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (t) => [
  index('Product_slug_idx').on(t.slug),
  index('Product_categoryId_idx').on(t.categoryId),
  index('Product_status_idx').on(t.status),
  index('Product_isFeatured_idx').on(t.isFeatured),
  index('Product_isTrending_idx').on(t.isTrending),
  index('Product_isNewArrival_idx').on(t.isNewArrival),
]);

export const productImagesTable = pgTable('ProductImage', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  productId: text('productId').notNull(),
  url: text('url').notNull(),
  alt: text('alt'),
  position: integer('position').notNull().default(0),
});

export const attributesTable = pgTable('Attribute', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  type: attributeTypeEnum('type').notNull().default('SELECT'),
  position: integer('position').notNull().default(0),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (t) => [
  index('Attribute_slug_idx').on(t.slug),
  index('Attribute_type_idx').on(t.type),
]);

export const attributeValuesTable = pgTable('AttributeValue', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  attributeId: text('attributeId').notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  colorHex: text('colorHex'),
  imageUrl: text('imageUrl'),
  position: integer('position').notNull().default(0),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (t) => [
  unique('AttributeValue_attributeId_slug_key').on(t.attributeId, t.slug),
  index('AttributeValue_attributeId_idx').on(t.attributeId),
]);

export const productAttributesTable = pgTable('ProductAttribute', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  productId: text('productId').notNull(),
  attributeId: text('attributeId'),
  customName: text('customName'),
  customType: attributeTypeEnum('customType'),
  position: integer('position').notNull().default(0),
  visible: boolean('visible').notNull().default(true),
  usedForVariations: boolean('usedForVariations').notNull().default(true),
}, (t) => [
  index('ProductAttribute_productId_idx').on(t.productId),
  index('ProductAttribute_attributeId_idx').on(t.attributeId),
]);

export const productAttributeValuesTable = pgTable('ProductAttributeValue', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  productAttributeId: text('productAttributeId').notNull(),
  attributeValueId: text('attributeValueId'),
  customValue: text('customValue'),
  position: integer('position').notNull().default(0),
}, (t) => [
  index('ProductAttributeValue_productAttributeId_idx').on(t.productAttributeId),
  index('ProductAttributeValue_attributeValueId_idx').on(t.attributeValueId),
]);

export const productVariationsTable = pgTable('ProductVariation', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  productId: text('productId').notNull(),
  sku: text('sku'),
  price: integer('price').notNull().default(0),
  compareAtPrice: integer('compareAtPrice'),
  buyingPrice: integer('buyingPrice'),
  stock: integer('stock').notNull().default(0),
  lowStockThreshold: integer('lowStockThreshold').notNull().default(5),
  image: text('image'),
  weight: integer('weight'),
  barcode: text('barcode'),
  status: variationStatusEnum('status').notNull().default('ACTIVE'),
  isDefault: boolean('isDefault').notNull().default(false),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (t) => [
  index('ProductVariation_productId_idx').on(t.productId),
  index('ProductVariation_sku_idx').on(t.sku),
  index('ProductVariation_status_idx').on(t.status),
]);

export const productVariationAttributesTable = pgTable('ProductVariationAttribute', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  variationId: text('variationId').notNull(),
  attributeId: text('attributeId'),
  attributeValueId: text('attributeValueId'),
  customAttributeName: text('customAttributeName'),
  customAttributeValue: text('customAttributeValue'),
}, (t) => [
  index('ProductVariationAttribute_variationId_idx').on(t.variationId),
  index('ProductVariationAttribute_attributeId_idx').on(t.attributeId),
  index('ProductVariationAttribute_attributeValueId_idx').on(t.attributeValueId),
]);

export const productVariantsTable = pgTable('ProductVariant', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  productId: text('productId').notNull(),
  name: text('name').notNull(),
  sku: text('sku').notNull().unique(),
  price: integer('price').notNull(),
  compareAtPrice: integer('compareAtPrice'),
  stock: integer('stock').notNull().default(0),
  image: text('image'),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
});

export const inventoriesTable = pgTable('Inventory', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  productId: text('productId').notNull().unique(),
  stock: integer('stock').notNull().default(0),
  reservedStock: integer('reservedStock').notNull().default(0),
  lowStockThreshold: integer('lowStockThreshold').notNull().default(8),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const customersTable = pgTable('Customer', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  storeId: text('storeId'),
  name: text('name').notNull(),
  phone: text('phone').notNull().unique(),
  email: text('email'),
  district: text('district').notNull(),
  area: text('area').notNull(),
  address: text('address').notNull(),
  totalSpent: integer('totalSpent').notNull().default(0),
  ordersCount: integer('ordersCount').notNull().default(0),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('Customer_phone_idx').on(t.phone),
  index('Customer_email_idx').on(t.email),
]);

export const ordersTable = pgTable('Order', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  storeId: text('storeId'),
  orderNumber: text('orderNumber').notNull().unique(),
  customerId: text('customerId'),
  customerName: text('customerName').notNull(),
  customerPhone: text('customerPhone').notNull(),
  address: text('address').notNull(),
  district: text('district').notNull(),
  area: text('area').notNull(),
  subtotal: integer('subtotal').notNull(),
  shippingCost: integer('shippingCost').notNull(),
  discount: integer('discount').notNull().default(0),
  total: integer('total').notNull(),
  paymentMethod: text('paymentMethod').notNull(),
  paymentStatus: paymentStatusEnum('paymentStatus').notNull().default('PENDING'),
  orderStatus: orderStatusEnum('orderStatus').notNull().default('PENDING'),
  notes: text('notes'),
  courierProvider: text('courierProvider'),
  courierConsignmentId: text('courierConsignmentId'),
  courierTrackingCode: text('courierTrackingCode'),
  courierStatus: text('courierStatus'),
  courierBookingDate: timestamp('courierBookingDate', { withTimezone: true }),
  transactionId: text('transactionId'),
  senderPhone: text('senderPhone'),
  paymentGatewayResponse: jsonb('paymentGatewayResponse'),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (t) => [
  index('Order_orderNumber_idx').on(t.orderNumber),
  index('Order_customerId_idx').on(t.customerId),
  index('Order_orderStatus_idx').on(t.orderStatus),
  index('Order_paymentStatus_idx').on(t.paymentStatus),
  index('Order_createdAt_idx').on(t.createdAt),
]);

export const orderItemsTable = pgTable('OrderItem', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  orderId: text('orderId').notNull(),
  productId: text('productId'),
  variantId: text('variantId'),
  title: text('title').notNull(),
  price: integer('price').notNull(),
  quantity: integer('quantity').notNull(),
  image: text('image').notNull(),
});

export const orderStatusHistoriesTable = pgTable('OrderStatusHistory', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  orderId: text('orderId').notNull(),
  status: text('status').notNull(),
  note: text('note'),
  changedBy: text('changedBy').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('OrderStatusHistory_orderId_createdAt_idx').on(t.orderId, t.createdAt),
]);

export const paymentTransactionsTable = pgTable('PaymentTransaction', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  orderId: text('orderId').notNull(),
  provider: paymentProviderEnum('provider').notNull().default('COD'),
  transactionId: text('transactionId'),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('BDT'),
  status: paymentStatusEnum('status').notNull().default('PENDING'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('PaymentTransaction_orderId_idx').on(t.orderId),
  index('PaymentTransaction_transactionId_idx').on(t.transactionId),
]);

export const reviewsTable = pgTable('Review', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  storeId: text('storeId'),
  productId: text('productId').notNull(),
  customerName: text('customerName').notNull(),
  customerLocation: text('customerLocation'),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  photos: text('photos').array().notNull().default([]),
  verifiedPurchase: boolean('verifiedPurchase').notNull().default(true),
  status: reviewStatusEnum('status').notNull().default('APPROVED'),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('Review_productId_status_idx').on(t.productId, t.status),
]);

export const mediaItemsTable = pgTable('MediaItem', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  storeId: text('storeId'),
  filename: text('filename').notNull(),
  url: text('url').notNull(),
  mimeType: text('mimeType').notNull(),
  size: integer('size').notNull(),
  width: integer('width'),
  height: integer('height'),
  altText: text('altText'),
  storageKey: text('storageKey'),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('MediaItem_filename_idx').on(t.filename),
]);

export const couponsTable = pgTable('Coupon', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  storeId: text('storeId'),
  code: text('code').notNull().unique(),
  discountType: discountTypeEnum('discountType').notNull().default('PERCENTAGE'),
  discountValue: integer('discountValue').notNull(),
  minOrderValue: integer('minOrderValue').notNull().default(0),
  maxUses: integer('maxUses'),
  usedCount: integer('usedCount').notNull().default(0),
  expiresAt: timestamp('expiresAt', { withTimezone: true }),
  active: boolean('active').notNull().default(true),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (t) => [
  index('Coupon_code_idx').on(t.code),
]);

export const promotionsTable = pgTable('Promotion', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  title: text('title').notNull(),
  bannerUrl: text('bannerUrl').notNull(),
  targetUrl: text('targetUrl').notNull(),
  startDate: timestamp('startDate', { withTimezone: true }),
  endDate: timestamp('endDate', { withTimezone: true }),
  active: boolean('active').notNull().default(true),
});

export const siteSettingsTable = pgTable('SiteSettings', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  storeName: text('storeName').notNull().default("Raifa's Mart"),
  tagline: text('tagline').notNull().default("Discover What's Trending. Smart Finds. Better Prices."),
  phone: text('phone').notNull().default('+880 1712-345678'),
  whatsapp: text('whatsapp').notNull().default('+8801712345678'),
  email: text('email').notNull().default('support@raifasmart.com'),
  address: text('address').notNull().default('Gulshan-1, Dhaka-1212, Bangladesh'),
  currencySymbol: text('currencySymbol').notNull().default('৳'),
  timezone: text('timezone').notNull().default('Asia/Dhaka'),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const shippingSettingsTable = pgTable('ShippingSettings', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  insideDhakaFee: integer('insideDhakaFee').notNull().default(70),
  outsideDhakaFee: integer('outsideDhakaFee').notNull().default(130),
  freeShippingThreshold: integer('freeShippingThreshold').notNull().default(2000),
  estimatedInsideDhaka: text('estimatedInsideDhaka').notNull().default('1–2 Days'),
  estimatedOutsideDhaka: text('estimatedOutsideDhaka').notNull().default('2–4 Days'),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const paymentSettingsTable = pgTable('PaymentSettings', {
  id: text('id').primaryKey().default('default_payment_settings'),
  codEnabled: boolean('codEnabled').notNull().default(true),
  bkashEnabled: boolean('bkashEnabled').notNull().default(true),
  bkashType: text('bkashType').notNull().default('MANUAL_NUMBER'),
  bkashMerchantNumber: text('bkashMerchantNumber').notNull().default('01712345678'),
  bkashAppKey: text('bkashAppKey'),
  bkashAppSecret: text('bkashAppSecret'),
  bkashUsername: text('bkashUsername'),
  bkashPassword: text('bkashPassword'),
  nagadEnabled: boolean('nagadEnabled').notNull().default(true),
  nagadType: text('nagadType').notNull().default('MANUAL_NUMBER'),
  nagadMerchantNumber: text('nagadMerchantNumber').notNull().default('01712345678'),
  nagadMerchantId: text('nagadMerchantId'),
  nagadPublicKey: text('nagadPublicKey'),
  nagadPrivateKey: text('nagadPrivateKey'),
  requireAdvanceShipping: boolean('requireAdvanceShipping').notNull().default(false),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const featureFlagsTable = pgTable('FeatureFlag', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  description: text('description'),
});

export const seoSettingsTable = pgTable('SeoSettings', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  defaultTitle: text('defaultTitle').notNull().default("Raifa's Mart — Discover What's Trending"),
  titleTemplate: text('titleTemplate').notNull().default("%s | Raifa's Mart"),
  defaultDescription: text('defaultDescription').notNull().default("Discover what's trending. Smart finds, useful gadgets, and lifestyle essentials curated from China for Bangladesh."),
  defaultOgImage: text('defaultOgImage'),
  googleVerification: text('googleVerification'),
  metaPixelId: text('metaPixelId'),
  tiktokPixelId: text('tiktokPixelId'),
  ga4MeasurementId: text('ga4MeasurementId'),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const courierSettingsTable = pgTable('CourierSettings', {
  id: text('id').primaryKey().default('default_courier_settings'),
  steadfastApiKey: text('steadfastApiKey'),
  steadfastSecretKey: text('steadfastSecretKey'),
  steadfastEnabled: boolean('steadfastEnabled').notNull().default(true),
  pathaoClientId: text('pathaoClientId'),
  pathaoClientSecret: text('pathaoClientSecret'),
  pathaoUsername: text('pathaoUsername'),
  pathaoPassword: text('pathaoPassword'),
  pathaoStoreId: text('pathaoStoreId'),
  pathaoEnabled: boolean('pathaoEnabled').notNull().default(false),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const smsSettingsTable = pgTable('SmsSettings', {
  id: text('id').primaryKey().default('default_sms_settings'),
  provider: text('provider').notNull().default('GREENWEB'),
  apiKey: text('apiKey'),
  senderId: text('senderId'),
  enabled: boolean('enabled').notNull().default(true),
  orderPlacedEnabled: boolean('orderPlacedEnabled').notNull().default(true),
  orderPlacedTemplate: text('orderPlacedTemplate').notNull().default("Dear {customer_name}, your order #{order_number} for BDT {total} is confirmed at Raifa's Mart! Helpline: 01712-345678"),
  orderShippedEnabled: boolean('orderShippedEnabled').notNull().default(true),
  orderShippedTemplate: text('orderShippedTemplate').notNull().default('Dear {customer_name}, your parcel #{order_number} is dispatched via {courier_name}. Tracking ID: {tracking_code}.'),
  orderDeliveredEnabled: boolean('orderDeliveredEnabled').notNull().default(true),
  orderDeliveredTemplate: text('orderDeliveredTemplate').notNull().default("Dear {customer_name}, your order #{order_number} has been delivered. Thank you for shopping with Raifa's Mart!"),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const smsLogsTable = pgTable('SmsLog', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  recipientPhone: text('recipientPhone').notNull(),
  message: text('message').notNull(),
  provider: text('provider').notNull(),
  status: text('status').notNull().default('SENT'),
  responseRaw: text('responseRaw'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('SmsLog_recipientPhone_idx').on(t.recipientPhone),
  index('SmsLog_createdAt_idx').on(t.createdAt),
]);

export const abandonedLeadsTable = pgTable('AbandonedLead', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  storeId: text('storeId'),
  customerName: text('customerName'),
  customerPhone: text('customerPhone').notNull(),
  address: text('address'),
  district: text('district'),
  cartItems: jsonb('cartItems'),
  total: doublePrecision('total'),
  isRecovered: boolean('isRecovered').notNull().default(false),
  notes: text('notes'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (t) => [
  index('AbandonedLead_customerPhone_idx').on(t.customerPhone),
  index('AbandonedLead_createdAt_idx').on(t.createdAt),
]);

// ── Relations ──────────────────────────────────────────────────────────────

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  store: one(storesTable, { fields: [usersTable.id], references: [storesTable.ownerId], relationName: 'StoreOwner' }),
  storeMemberships: many(storeMembersTable),
  auditLogs: many(auditLogsTable),
}));

export const storesRelations = relations(storesTable, ({ one, many }) => ({
  owner: one(usersTable, { fields: [storesTable.ownerId], references: [usersTable.id], relationName: 'StoreOwner' }),
  members: many(storeMembersTable),
  subscription: one(subscriptionsTable, { fields: [storesTable.id], references: [subscriptionsTable.storeId] }),
  invoices: many(subscriptionInvoicesTable),
  domains: many(storeDomainsTable),
  products: many(productsTable),
  categories: many(categoriesTable),
  orders: many(ordersTable),
  customers: many(customersTable),
  reviews: many(reviewsTable),
  mediaItems: many(mediaItemsTable),
  coupons: many(couponsTable),
  pages: many(pagesTable),
  menus: many(menusTable),
  auditLogs: many(auditLogsTable),
  abandonedLeads: many(abandonedLeadsTable),
}));

export const storeDomainsRelations = relations(storeDomainsTable, ({ one }) => ({
  store: one(storesTable, { fields: [storeDomainsTable.storeId], references: [storesTable.id] }),
}));

export const storeMembersRelations = relations(storeMembersTable, ({ one }) => ({
  store: one(storesTable, { fields: [storeMembersTable.storeId], references: [storesTable.id] }),
  user: one(usersTable, { fields: [storeMembersTable.userId], references: [usersTable.id] }),
}));

export const subscriptionPlansRelations = relations(subscriptionPlansTable, ({ many }) => ({
  subscriptions: many(subscriptionsTable),
}));

export const subscriptionsRelations = relations(subscriptionsTable, ({ one, many }) => ({
  store: one(storesTable, { fields: [subscriptionsTable.storeId], references: [storesTable.id] }),
  plan: one(subscriptionPlansTable, { fields: [subscriptionsTable.planId], references: [subscriptionPlansTable.id] }),
  invoices: many(subscriptionInvoicesTable),
}));

export const subscriptionInvoicesRelations = relations(subscriptionInvoicesTable, ({ one }) => ({
  subscription: one(subscriptionsTable, { fields: [subscriptionInvoicesTable.subscriptionId], references: [subscriptionsTable.id] }),
  store: one(storesTable, { fields: [subscriptionInvoicesTable.storeId], references: [storesTable.id] }),
}));

export const auditLogsRelations = relations(auditLogsTable, ({ one }) => ({
  store: one(storesTable, { fields: [auditLogsTable.storeId], references: [storesTable.id] }),
  user: one(usersTable, { fields: [auditLogsTable.userId], references: [usersTable.id] }),
}));

export const pagesRelations = relations(pagesTable, ({ one, many }) => ({
  store: one(storesTable, { fields: [pagesTable.storeId], references: [storesTable.id] }),
  revisions: many(pageRevisionsTable),
}));

export const pageRevisionsRelations = relations(pageRevisionsTable, ({ one }) => ({
  page: one(pagesTable, { fields: [pageRevisionsTable.pageId], references: [pagesTable.id] }),
}));

export const menusRelations = relations(menusTable, ({ one, many }) => ({
  store: one(storesTable, { fields: [menusTable.storeId], references: [storesTable.id] }),
  items: many(menuItemsTable),
}));

export const menuItemsRelations = relations(menuItemsTable, ({ one, many }) => ({
  menu: one(menusTable, { fields: [menuItemsTable.menuId], references: [menusTable.id] }),
  parent: one(menuItemsTable, { fields: [menuItemsTable.parentId], references: [menuItemsTable.id], relationName: 'MenuHierarchy' }),
  children: many(menuItemsTable, { relationName: 'MenuHierarchy' }),
}));

export const categoriesRelations = relations(categoriesTable, ({ one, many }) => ({
  store: one(storesTable, { fields: [categoriesTable.storeId], references: [storesTable.id] }),
  parent: one(categoriesTable, { fields: [categoriesTable.parentId], references: [categoriesTable.id], relationName: 'CategoryHierarchy' }),
  children: many(categoriesTable, { relationName: 'CategoryHierarchy' }),
  products: many(productsTable),
}));

export const productsRelations = relations(productsTable, ({ one, many }) => ({
  store: one(storesTable, { fields: [productsTable.storeId], references: [storesTable.id] }),
  category: one(categoriesTable, { fields: [productsTable.categoryId], references: [categoriesTable.id] }),
  images: many(productImagesTable),
  variants: many(productVariantsTable),
  productAttributes: many(productAttributesTable),
  productVariations: many(productVariationsTable),
  reviews: many(reviewsTable),
  inventory: one(inventoriesTable, { fields: [productsTable.id], references: [inventoriesTable.productId] }),
}));

export const productImagesRelations = relations(productImagesTable, ({ one }) => ({
  product: one(productsTable, { fields: [productImagesTable.productId], references: [productsTable.id] }),
}));

export const attributesRelations = relations(attributesTable, ({ many }) => ({
  values: many(attributeValuesTable),
  productAttributes: many(productAttributesTable),
  variationAttributes: many(productVariationAttributesTable),
}));

export const attributeValuesRelations = relations(attributeValuesTable, ({ one, many }) => ({
  attribute: one(attributesTable, { fields: [attributeValuesTable.attributeId], references: [attributesTable.id] }),
  productAttributeValues: many(productAttributeValuesTable),
  variationAttributes: many(productVariationAttributesTable),
}));

export const productAttributesRelations = relations(productAttributesTable, ({ one, many }) => ({
  product: one(productsTable, { fields: [productAttributesTable.productId], references: [productsTable.id] }),
  attribute: one(attributesTable, { fields: [productAttributesTable.attributeId], references: [attributesTable.id] }),
  values: many(productAttributeValuesTable),
}));

export const productAttributeValuesRelations = relations(productAttributeValuesTable, ({ one }) => ({
  productAttribute: one(productAttributesTable, { fields: [productAttributeValuesTable.productAttributeId], references: [productAttributesTable.id] }),
  attributeValue: one(attributeValuesTable, { fields: [productAttributeValuesTable.attributeValueId], references: [attributeValuesTable.id] }),
}));

export const productVariationsRelations = relations(productVariationsTable, ({ one, many }) => ({
  product: one(productsTable, { fields: [productVariationsTable.productId], references: [productsTable.id] }),
  attributes: many(productVariationAttributesTable),
}));

export const productVariationAttributesRelations = relations(productVariationAttributesTable, ({ one }) => ({
  variation: one(productVariationsTable, { fields: [productVariationAttributesTable.variationId], references: [productVariationsTable.id] }),
  attribute: one(attributesTable, { fields: [productVariationAttributesTable.attributeId], references: [attributesTable.id] }),
  attributeValue: one(attributeValuesTable, { fields: [productVariationAttributesTable.attributeValueId], references: [attributeValuesTable.id] }),
}));

export const productVariantsRelations = relations(productVariantsTable, ({ one }) => ({
  product: one(productsTable, { fields: [productVariantsTable.productId], references: [productsTable.id] }),
}));

export const inventoriesRelations = relations(inventoriesTable, ({ one }) => ({
  product: one(productsTable, { fields: [inventoriesTable.productId], references: [productsTable.id] }),
}));

export const customersRelations = relations(customersTable, ({ one, many }) => ({
  store: one(storesTable, { fields: [customersTable.storeId], references: [storesTable.id] }),
  orders: many(ordersTable),
}));

export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  store: one(storesTable, { fields: [ordersTable.storeId], references: [storesTable.id] }),
  customer: one(customersTable, { fields: [ordersTable.customerId], references: [customersTable.id] }),
  items: many(orderItemsTable),
  statusHistory: many(orderStatusHistoriesTable),
  transactions: many(paymentTransactionsTable),
}));

export const orderItemsRelations = relations(orderItemsTable, ({ one }) => ({
  order: one(ordersTable, { fields: [orderItemsTable.orderId], references: [ordersTable.id] }),
}));

export const orderStatusHistoriesRelations = relations(orderStatusHistoriesTable, ({ one }) => ({
  order: one(ordersTable, { fields: [orderStatusHistoriesTable.orderId], references: [ordersTable.id] }),
}));

export const paymentTransactionsRelations = relations(paymentTransactionsTable, ({ one }) => ({
  order: one(ordersTable, { fields: [paymentTransactionsTable.orderId], references: [ordersTable.id] }),
}));

export const reviewsRelations = relations(reviewsTable, ({ one }) => ({
  store: one(storesTable, { fields: [reviewsTable.storeId], references: [storesTable.id] }),
  product: one(productsTable, { fields: [reviewsTable.productId], references: [productsTable.id] }),
}));

export const mediaItemsRelations = relations(mediaItemsTable, ({ one }) => ({
  store: one(storesTable, { fields: [mediaItemsTable.storeId], references: [storesTable.id] }),
}));

export const couponsRelations = relations(couponsTable, ({ one }) => ({
  store: one(storesTable, { fields: [couponsTable.storeId], references: [storesTable.id] }),
}));

export const abandonedLeadsRelations = relations(abandonedLeadsTable, ({ one }) => ({
  store: one(storesTable, { fields: [abandonedLeadsTable.storeId], references: [storesTable.id] }),
}));
