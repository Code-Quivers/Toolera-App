import {
  pgSchema,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────────────────────
// Schema namespace
// ─────────────────────────────────────────────────────────────────────────────

const tooleraSchema = pgSchema("toolera");

// ─────────────────────────────────────────────────────────────────────────────
// toolera.admin_users
// ─────────────────────────────────────────────────────────────────────────────

export const AdminRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
} as const;
export type AdminRoleType = (typeof AdminRole)[keyof typeof AdminRole];

export const AdminStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;
export type AdminStatusType = (typeof AdminStatus)[keyof typeof AdminStatus];

export const tooleraAdminUsers = tooleraSchema.table(
  "admin_users",
  {
    adminId: uuid("admin_id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull().default("ADMIN").$type<AdminRoleType>(),
    status: text("status").notNull().default("ACTIVE").$type<AdminStatusType>(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: uniqueIndex("toolera_admin_users_email_idx").on(t.email),
    roleIdx: index("toolera_admin_users_role_idx").on(t.role),
    statusIdx: index("toolera_admin_users_status_idx").on(t.status),
  }),
);

export type TooleraAdminUser = InferSelectModel<typeof tooleraAdminUsers>;

// ─────────────────────────────────────────────────────────────────────────────
// toolera.tools
// ─────────────────────────────────────────────────────────────────────────────

export const ToolStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;
export type ToolStatusType = (typeof ToolStatus)[keyof typeof ToolStatus];

export const ToolType = {
  SOFTWARE: "SOFTWARE",
  SERVICE: "SERVICE",
  PHYSICAL: "PHYSICAL",
  SUBSCRIPTION: "SUBSCRIPTION",
} as const;
export type ToolTypeType = (typeof ToolType)[keyof typeof ToolType];

export const tooleraTools = tooleraSchema.table(
  "tools",
  {
    toolId: uuid("tool_id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    shortDescription: text("short_description"),
    type: text("type").notNull().default("SOFTWARE").$type<ToolTypeType>(),
    category: text("category"),
    basePrice: integer("base_price").notNull().default(0),
    currency: text("currency").notNull().default("BDT"),
    images: text("images").array().notNull().default([]),
    features: text("features").array().notNull().default([]),
    metadata: jsonb("metadata").default({}),
    status: text("status").notNull().default("DRAFT").$type<ToolStatusType>(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex("toolera_tools_slug_idx").on(t.slug),
    typeIdx: index("toolera_tools_type_idx").on(t.type),
    categoryIdx: index("toolera_tools_category_idx").on(t.category),
    statusIdx: index("toolera_tools_status_idx").on(t.status),
  }),
);

export type TooleraTool = InferSelectModel<typeof tooleraTools>;

// ─────────────────────────────────────────────────────────────────────────────
// toolera.tool_variants
// ─────────────────────────────────────────────────────────────────────────────

export const ToolVariantStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;
export type ToolVariantStatusType = (typeof ToolVariantStatus)[keyof typeof ToolVariantStatus];

export const tooleraToolVariants = tooleraSchema.table(
  "tool_variants",
  {
    variantId: uuid("variant_id").primaryKey().defaultRandom(),
    toolId: uuid("tool_id")
      .notNull()
      .references(() => tooleraTools.toolId, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sku: text("sku").notNull(),
    price: integer("price").notNull(),
    billingCycle: text("billing_cycle"),
    features: text("features").array().notNull().default([]),
    metadata: jsonb("metadata").default({}),
    status: text("status").notNull().default("ACTIVE").$type<ToolVariantStatusType>(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    toolIdx: index("toolera_tool_variants_tool_idx").on(t.toolId),
    skuIdx: index("toolera_tool_variants_sku_idx").on(t.sku),
    statusIdx: index("toolera_tool_variants_status_idx").on(t.status),
  }),
);

export type TooleraToolVariant = InferSelectModel<typeof tooleraToolVariants>;

// ─────────────────────────────────────────────────────────────────────────────
// toolera.sellers (denormalized copy from core-server)
// ─────────────────────────────────────────────────────────────────────────────

export const SellerStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
  DELETED: "DELETED",
} as const;
export type SellerStatusType = (typeof SellerStatus)[keyof typeof SellerStatus];

export const tooleraSellers = tooleraSchema.table(
  "sellers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sellerGoogleId: text("seller_google_id").notNull().unique(),
    email: text("email").notNull(),
    name: text("name"),
    avatarUrl: text("avatar_url"),
    storeName: text("store_name"),
    storeSlug: text("store_slug"),
    phone: text("phone"),
    city: text("city"),
    status: text("status").notNull().default("ACTIVE").$type<SellerStatusType>(),
    subscriptionPlan: text("subscription_plan"),
    subscriptionEndDate: timestamp("subscription_end_date", { withTimezone: true }),
    totalOrders: integer("total_orders").notNull().default(0),
    totalRevenue: integer("total_revenue").notNull().default(0),
    syncedAt: timestamp("synced_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    googleIdIdx: uniqueIndex("toolera_sellers_google_id_idx").on(t.sellerGoogleId),
    emailIdx: index("toolera_sellers_email_idx").on(t.email),
    statusIdx: index("toolera_sellers_status_idx").on(t.status),
    storeSlugIdx: index("toolera_sellers_store_slug_idx").on(t.storeSlug),
  }),
);

export type TooleraSeller = InferSelectModel<typeof tooleraSellers>;

// ─────────────────────────────────────────────────────────────────────────────
// toolera.seller_subscriptions
// ─────────────────────────────────────────────────────────────────────────────

export const SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  CANCELED: "CANCELED",
} as const;
export type SubscriptionStatusType = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const tooleraSellerSubscriptions = tooleraSchema.table(
  "seller_subscriptions",
  {
    subscriptionId: uuid("subscription_id").primaryKey().defaultRandom(),
    sellerGoogleId: text("seller_google_id").notNull(),
    planName: text("plan_name").notNull(),
    billingCycle: text("billing_cycle").notNull(),
    price: integer("price").notNull(),
    status: text("status").notNull().default("ACTIVE").$type<SubscriptionStatusType>(),
    startDate: timestamp("start_date", { withTimezone: true }).defaultNow().notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    autoRenew: boolean("auto_renew").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    sellerIdx: index("toolera_seller_subscriptions_seller_idx").on(t.sellerGoogleId),
    statusIdx: index("toolera_seller_subscriptions_status_idx").on(t.status),
    endDateIdx: index("toolera_seller_subscriptions_end_date_idx").on(t.endDate),
  }),
);

export type TooleraSellerSubscription = InferSelectModel<typeof tooleraSellerSubscriptions>;

// ─────────────────────────────────────────────────────────────────────────────
// toolera.orders
// ─────────────────────────────────────────────────────────────────────────────

export const OrderStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;
export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentStatus = {
  PAID: "PAID",
  PARTIAL: "PARTIAL",
  UNPAID: "UNPAID",
  REFUNDED: "REFUNDED",
} as const;
export type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const tooleraOrders = tooleraSchema.table(
  "orders",
  {
    orderId: uuid("order_id").primaryKey().defaultRandom(),
    orderNumber: text("order_number").notNull().unique(),
    sellerGoogleId: text("seller_google_id").notNull(),
    customerName: text("customer_name"),
    customerPhone: text("customer_phone"),
    customerEmail: text("customer_email"),
    subtotal: integer("subtotal").notNull().default(0),
    discountAmount: integer("discount_amount").notNull().default(0),
    vatAmount: integer("vat_amount").notNull().default(0),
    grandTotal: integer("grand_total").notNull().default(0),
    paymentMethod: text("payment_method"),
    paymentStatus: text("payment_status").notNull().default("UNPAID").$type<PaymentStatusType>(),
    status: text("status").notNull().default("PENDING").$type<OrderStatusType>(),
    notes: text("notes"),
    orderDate: timestamp("order_date", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    sellerIdx: index("toolera_orders_seller_idx").on(t.sellerGoogleId),
    orderNumberIdx: uniqueIndex("toolera_orders_number_idx").on(t.orderNumber),
    statusIdx: index("toolera_orders_status_idx").on(t.status),
    paymentStatusIdx: index("toolera_orders_payment_status_idx").on(t.paymentStatus),
    dateIdx: index("toolera_orders_date_idx").on(t.orderDate),
  }),
);

export type TooleraOrder = InferSelectModel<typeof tooleraOrders>;

// ─────────────────────────────────────────────────────────────────────────────
// toolera.order_items
// ─────────────────────────────────────────────────────────────────────────────

export const tooleraOrderItems = tooleraSchema.table(
  "order_items",
  {
    itemId: uuid("item_id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => tooleraOrders.orderId, { onDelete: "cascade" }),
    toolId: uuid("tool_id").references(() => tooleraTools.toolId, { onDelete: "set null" }),
    variantId: uuid("variant_id").references(() => tooleraToolVariants.variantId, { onDelete: "set null" }),
    productName: text("product_name").notNull(),
    productSku: text("product_sku").notNull(),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    total: integer("total").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    orderIdx: index("toolera_order_items_order_idx").on(t.orderId),
    toolIdx: index("toolera_order_items_tool_idx").on(t.toolId),
  }),
);

export type TooleraOrderItem = InferSelectModel<typeof tooleraOrderItems>;

// ─────────────────────────────────────────────────────────────────────────────
// toolera.platform_settings
// ─────────────────────────────────────────────────────────────────────────────

export const tooleraPlatformSettings = tooleraSchema.table(
  "platform_settings",
  {
    settingId: uuid("setting_id").primaryKey().defaultRandom(),
    key: text("key").notNull().unique(),
    value: jsonb("value").notNull(),
    description: text("description"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    keyIdx: uniqueIndex("toolera_platform_settings_key_idx").on(t.key),
  }),
);

export type TooleraPlatformSetting = InferSelectModel<typeof tooleraPlatformSettings>;

// ─────────────────────────────────────────────────────────────────────────────
// toolera.platforms (master list of supported platforms)
// ─────────────────────────────────────────────────────────────────────────────

export const tooleraPlatforms = tooleraSchema.table(
  "platforms",
  {
    platformNameId: uuid("platform_name_id").primaryKey().defaultRandom(),
    platformName: text("platform_name").notNull().unique(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    platformNameIdx: uniqueIndex("toolera_platforms_platform_name_idx").on(t.platformName),
  }),
);

export type TooleraPlatform = InferSelectModel<typeof tooleraPlatforms>;

// ─────────────────────────────────────────────────────────────────────────────
// toolera.packages (subscription plans per platform)
// ─────────────────────────────────────────────────────────────────────────────

export const PackageStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;
export type PackageStatusType = (typeof PackageStatus)[keyof typeof PackageStatus];

export const BillingCycle = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;
export type BillingCycleType = (typeof BillingCycle)[keyof typeof BillingCycle];

export const tooleraPackages = tooleraSchema.table(
  "packages",
  {
    packageId: uuid("package_id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    platformNameId: uuid("platform_name_id")
      .notNull()
      .references(() => tooleraPlatforms.platformNameId, { onDelete: "cascade" }),
    description: text("description"),
    price: integer("price").notNull(),
    currency: text("currency").notNull().default("BDT"),
    billingCycle: text("billing_cycle").notNull().default("monthly").$type<BillingCycleType>(),
    features: text("features").array().notNull().default([]),
    trialDays: integer("trial_days").notNull().default(0),
    isHighlighted: boolean("is_highlighted").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex("toolera_packages_slug_idx").on(t.slug),
    platformIdx: index("toolera_packages_platform_idx").on(t.platformNameId),
    statusIdx: index("toolera_packages_active_idx").on(t.isActive),
    platformActiveIdx: index("toolera_packages_platform_active_idx").on(t.platformNameId, t.isActive),
  }),
);

export type TooleraPackage = InferSelectModel<typeof tooleraPackages>;

// ─────────────────────────────────────────────────────────────────────────────
// toolera.seller_package_subscriptions (seller subscriptions to packages)
// ─────────────────────────────────────────────────────────────────────────────

export const SellerPackageStatus = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  CANCELED: "CANCELED",
} as const;
export type SellerPackageStatusType = (typeof SellerPackageStatus)[keyof typeof SellerPackageStatus];

export const tooleraSellerPackageSubscriptions = tooleraSchema.table(
  "seller_package_subscriptions",
  {
    subscriptionId: uuid("subscription_id").primaryKey().defaultRandom(),
    sellerGoogleId: text("seller_google_id").notNull(),
    packageId: uuid("package_id")
      .notNull()
      .references(() => tooleraPackages.packageId, { onDelete: "restrict" }),
    status: text("status").notNull().default("ACTIVE").$type<SellerPackageStatusType>(),
    startDate: timestamp("start_date", { withTimezone: true }).defaultNow().notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    autoRenew: boolean("auto_renew").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    sellerIdx: index("toolera_sps_seller_idx").on(t.sellerGoogleId),
    packageIdx: index("toolera_sps_package_idx").on(t.packageId),
    statusIdx: index("toolera_sps_status_idx").on(t.status),
    endDateIdx: index("toolera_sps_end_date_idx").on(t.endDate),
  }),
);

export type TooleraSellerPackageSubscription = InferSelectModel<typeof tooleraSellerPackageSubscriptions>;

// ─────────────────────────────────────────────────────────────────────────────
// toolera.categories (product categories for seller stores)
// ─────────────────────────────────────────────────────────────────────────────

export const tooleraCategories = tooleraSchema.table(
  "categories",
  {
    categoryId: uuid("category_id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    icon: text("icon"),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    nameIdx: uniqueIndex("toolera_categories_name_idx").on(t.name),
    slugIdx: uniqueIndex("toolera_categories_slug_idx").on(t.slug),
    activeIdx: index("toolera_categories_active_idx").on(t.isActive),
  }),
);

export type TooleraCategory = InferSelectModel<typeof tooleraCategories>;

// ─────────────────────────────────────────────────────────────────────────────
// toolera.support_tickets
// ─────────────────────────────────────────────────────────────────────────────

export const TicketStatus = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;
export type TicketStatusType = (typeof TicketStatus)[keyof typeof TicketStatus];

export const TicketPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;
export type TicketPriorityType = (typeof TicketPriority)[keyof typeof TicketPriority];

export const tooleraSupportTickets = tooleraSchema.table(
  "support_tickets",
  {
    ticketId: uuid("ticket_id").primaryKey().defaultRandom(),
    ticketNumber: text("ticket_number").notNull().unique(),
    sellerGoogleId: text("seller_google_id"),
    sellerEmail: text("seller_email"),
    sellerName: text("seller_name"),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    status: text("status").notNull().default("OPEN").$type<TicketStatusType>(),
    priority: text("priority").notNull().default("MEDIUM").$type<TicketPriorityType>(),
    assignedTo: uuid("assigned_to").references(() => tooleraAdminUsers.adminId, { onDelete: "set null" }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    ticketNumberIdx: uniqueIndex("toolera_support_tickets_number_idx").on(t.ticketNumber),
    sellerIdx: index("toolera_support_tickets_seller_idx").on(t.sellerGoogleId),
    statusIdx: index("toolera_support_tickets_status_idx").on(t.status),
    priorityIdx: index("toolera_support_tickets_priority_idx").on(t.priority),
    assignedIdx: index("toolera_support_tickets_assigned_idx").on(t.assignedTo),
  }),
);

export type TooleraSupportTicket = InferSelectModel<typeof tooleraSupportTickets>;

// ─────────────────────────────────────────────────────────────────────────────
// toolera.support_ticket_replies
// ─────────────────────────────────────────────────────────────────────────────

export const tooleraSupportTicketReplies = tooleraSchema.table(
  "support_ticket_replies",
  {
    replyId: uuid("reply_id").primaryKey().defaultRandom(),
    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => tooleraSupportTickets.ticketId, { onDelete: "cascade" }),
    authorId: uuid("author_id").references(() => tooleraAdminUsers.adminId, { onDelete: "set null" }),
    authorType: text("author_type").notNull().default("admin"), // "admin" | "seller"
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    ticketIdx: index("toolera_ticket_replies_ticket_idx").on(t.ticketId),
    authorIdx: index("toolera_ticket_replies_author_idx").on(t.authorId),
  }),
);

export type TooleraSupportTicketReply = InferSelectModel<typeof tooleraSupportTicketReplies>;

// ─────────────────────────────────────────────────────────────────────────────
// toolera.product_logs  — centralized usage logs from all Toolera products
// ─────────────────────────────────────────────────────────────────────────────

export const tooleraProductLogs = tooleraSchema.table(
  "product_logs",
  {
    logId: uuid("log_id").primaryKey().defaultRandom(),
    product: text("product").notNull(),       // e.g. "PDF_TOOL", "STORE_TOOL"
    toolName: text("tool_name"),              // e.g. "compress", "merge", "split"
    action: text("action").notNull().default("TOOL_USE"), // e.g. "TOOL_USE", "FILE_UPLOAD"
    userId: text("user_id"),                  // external user ID (product-specific)
    userEmail: text("user_email"),
    userPlan: text("user_plan"),              // "FREE" | "PRO" | "PREMIUM" etc.
    ip: text("ip"),
    success: boolean("success").notNull().default(true),
    durationMs: integer("duration_ms"),
    fileSizeBytes: integer("file_size_bytes"),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    productIdx: index("toolera_product_logs_product_idx").on(t.product),
    toolNameIdx: index("toolera_product_logs_tool_idx").on(t.toolName),
    userPlanIdx: index("toolera_product_logs_plan_idx").on(t.userPlan),
    successIdx: index("toolera_product_logs_success_idx").on(t.success),
    createdAtIdx: index("toolera_product_logs_created_idx").on(t.createdAt),
    userIdIdx: index("toolera_product_logs_user_idx").on(t.userId),
  }),
);

export type TooleraProductLog = InferSelectModel<typeof tooleraProductLogs>;
