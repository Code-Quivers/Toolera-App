CREATE TYPE "public"."AttributeType" AS ENUM('COLOR', 'BUTTON', 'SELECT', 'IMAGE', 'TEXT');--> statement-breakpoint
CREATE TYPE "public"."BillingCycle" AS ENUM('MONTHLY', 'YEARLY');--> statement-breakpoint
CREATE TYPE "public"."DiscountType" AS ENUM('PERCENTAGE', 'FIXED');--> statement-breakpoint
CREATE TYPE "public"."MenuLocation" AS ENUM('HEADER', 'FOOTER', 'MOBILE');--> statement-breakpoint
CREATE TYPE "public"."OrderStatus" AS ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED');--> statement-breakpoint
CREATE TYPE "public"."PageStatus" AS ENUM('DRAFT', 'PUBLISHED');--> statement-breakpoint
CREATE TYPE "public"."PaymentProvider" AS ENUM('COD', 'BKASH', 'NAGAD', 'CARD');--> statement-breakpoint
CREATE TYPE "public"."PaymentStatus" AS ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."ProductStatus" AS ENUM('DRAFT', 'PUBLISHED');--> statement-breakpoint
CREATE TYPE "public"."ReviewStatus" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."Role" AS ENUM('OWNER', 'ADMIN', 'EDITOR', 'MANAGER', 'STAFF');--> statement-breakpoint
CREATE TYPE "public"."StoreMemberRole" AS ENUM('OWNER', 'ADMIN', 'MANAGER', 'STAFF');--> statement-breakpoint
CREATE TYPE "public"."StoreStatus" AS ENUM('SETUP', 'CLOSED', 'ACTIVE', 'TRIAL', 'SUSPENDED', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."SubscriptionStatus" AS ENUM('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELLED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."VariationStatus" AS ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED');--> statement-breakpoint
CREATE TABLE "AbandonedLead" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text,
	"customerName" text,
	"customerPhone" text NOT NULL,
	"address" text,
	"district" text,
	"cartItems" jsonb,
	"total" double precision,
	"isRecovered" boolean DEFAULT false NOT NULL,
	"notes" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "AttributeValue" (
	"id" text PRIMARY KEY NOT NULL,
	"attributeId" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"colorHex" text,
	"imageUrl" text,
	"position" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "AttributeValue_attributeId_slug_key" UNIQUE("attributeId","slug")
);
--> statement-breakpoint
CREATE TABLE "Attribute" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" "AttributeType" DEFAULT 'SELECT' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Attribute_name_unique" UNIQUE("name"),
	CONSTRAINT "Attribute_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "AuditLog" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text,
	"userId" text,
	"userName" text NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entityId" text,
	"metadata" jsonb,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Category" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image" text,
	"parentId" text,
	"position" integer DEFAULT 0 NOT NULL,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "Coupon" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text,
	"code" text NOT NULL,
	"discountType" "DiscountType" DEFAULT 'PERCENTAGE' NOT NULL,
	"discountValue" integer NOT NULL,
	"minOrderValue" integer DEFAULT 0 NOT NULL,
	"maxUses" integer,
	"usedCount" integer DEFAULT 0 NOT NULL,
	"expiresAt" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "Coupon_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "CourierSettings" (
	"id" text PRIMARY KEY DEFAULT 'default_courier_settings' NOT NULL,
	"steadfastApiKey" text,
	"steadfastSecretKey" text,
	"steadfastEnabled" boolean DEFAULT true NOT NULL,
	"pathaoClientId" text,
	"pathaoClientSecret" text,
	"pathaoUsername" text,
	"pathaoPassword" text,
	"pathaoStoreId" text,
	"pathaoEnabled" boolean DEFAULT false NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Customer" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"district" text NOT NULL,
	"area" text NOT NULL,
	"address" text NOT NULL,
	"totalSpent" integer DEFAULT 0 NOT NULL,
	"ordersCount" integer DEFAULT 0 NOT NULL,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Customer_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "FeatureFlag" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"description" text,
	CONSTRAINT "FeatureFlag_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "FooterSettings" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text NOT NULL,
	"columns" jsonb,
	"copyrightText" text DEFAULT '© 2026 Toolera. All rights reserved. Curated for Bangladesh.' NOT NULL,
	"socialLinks" jsonb,
	"paymentBadgesActive" boolean DEFAULT true NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "FooterSettings_storeId_unique" UNIQUE("storeId")
);
--> statement-breakpoint
CREATE TABLE "HeaderSettings" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text NOT NULL,
	"logoUrl" text,
	"showSearch" boolean DEFAULT true NOT NULL,
	"showWishlist" boolean DEFAULT true NOT NULL,
	"showCart" boolean DEFAULT true NOT NULL,
	"isSticky" boolean DEFAULT true NOT NULL,
	"announcementText" text DEFAULT 'Free delivery on orders over ৳2,000 • Cash on Delivery available' NOT NULL,
	"announcementActive" boolean DEFAULT true NOT NULL,
	"links" jsonb,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "HeaderSettings_storeId_unique" UNIQUE("storeId")
);
--> statement-breakpoint
CREATE TABLE "Inventory" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"reservedStock" integer DEFAULT 0 NOT NULL,
	"lowStockThreshold" integer DEFAULT 8 NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Inventory_productId_unique" UNIQUE("productId")
);
--> statement-breakpoint
CREATE TABLE "MediaItem" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text,
	"filename" text NOT NULL,
	"url" text NOT NULL,
	"mimeType" text NOT NULL,
	"size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"altText" text,
	"storageKey" text,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "MenuItem" (
	"id" text PRIMARY KEY NOT NULL,
	"menuId" text NOT NULL,
	"parentId" text,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"type" text DEFAULT 'CUSTOM',
	"position" integer DEFAULT 0 NOT NULL,
	"isExternal" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Menu" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text,
	"name" text NOT NULL,
	"location" "MenuLocation" DEFAULT 'HEADER' NOT NULL,
	"settings" jsonb,
	"deletedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "OrderItem" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"productId" text,
	"variantId" text,
	"title" text NOT NULL,
	"price" integer NOT NULL,
	"quantity" integer NOT NULL,
	"image" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "OrderStatusHistory" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"status" text NOT NULL,
	"note" text,
	"changedBy" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Order" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text,
	"orderNumber" text NOT NULL,
	"customerId" text,
	"customerName" text NOT NULL,
	"customerPhone" text NOT NULL,
	"address" text NOT NULL,
	"district" text NOT NULL,
	"area" text NOT NULL,
	"subtotal" integer NOT NULL,
	"shippingCost" integer NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"paymentMethod" text NOT NULL,
	"paymentStatus" "PaymentStatus" DEFAULT 'PENDING' NOT NULL,
	"orderStatus" "OrderStatus" DEFAULT 'PENDING' NOT NULL,
	"notes" text,
	"courierProvider" text,
	"courierConsignmentId" text,
	"courierTrackingCode" text,
	"courierStatus" text,
	"courierBookingDate" timestamp with time zone,
	"transactionId" text,
	"senderPhone" text,
	"paymentGatewayResponse" jsonb,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Order_orderNumber_unique" UNIQUE("orderNumber")
);
--> statement-breakpoint
CREATE TABLE "PageRevision" (
	"id" text PRIMARY KEY NOT NULL,
	"pageId" text NOT NULL,
	"version" integer NOT NULL,
	"title" text NOT NULL,
	"sectionsSnapshot" jsonb NOT NULL,
	"isPublished" boolean DEFAULT false NOT NULL,
	"publishedAt" timestamp with time zone,
	"createdBy" text NOT NULL,
	"notes" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Page" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"status" "PageStatus" DEFAULT 'PUBLISHED' NOT NULL,
	"isHomepage" boolean DEFAULT false NOT NULL,
	"currentRevisionId" text,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Page_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "PaymentSettings" (
	"id" text PRIMARY KEY DEFAULT 'default_payment_settings' NOT NULL,
	"codEnabled" boolean DEFAULT true NOT NULL,
	"bkashEnabled" boolean DEFAULT true NOT NULL,
	"bkashType" text DEFAULT 'MANUAL_NUMBER' NOT NULL,
	"bkashMerchantNumber" text DEFAULT '01712345678' NOT NULL,
	"bkashAppKey" text,
	"bkashAppSecret" text,
	"bkashUsername" text,
	"bkashPassword" text,
	"nagadEnabled" boolean DEFAULT true NOT NULL,
	"nagadType" text DEFAULT 'MANUAL_NUMBER' NOT NULL,
	"nagadMerchantNumber" text DEFAULT '01712345678' NOT NULL,
	"nagadMerchantId" text,
	"nagadPublicKey" text,
	"nagadPrivateKey" text,
	"requireAdvanceShipping" boolean DEFAULT false NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PaymentTransaction" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"provider" "PaymentProvider" DEFAULT 'COD' NOT NULL,
	"transactionId" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'BDT' NOT NULL,
	"status" "PaymentStatus" DEFAULT 'PENDING' NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProductAttributeValue" (
	"id" text PRIMARY KEY NOT NULL,
	"productAttributeId" text NOT NULL,
	"attributeValueId" text,
	"customValue" text,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProductAttribute" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"attributeId" text,
	"customName" text,
	"customType" "AttributeType",
	"position" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"usedForVariations" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProductImage" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProductVariant" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"name" text NOT NULL,
	"sku" text NOT NULL,
	"price" integer NOT NULL,
	"compareAtPrice" integer,
	"stock" integer DEFAULT 0 NOT NULL,
	"image" text,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "ProductVariant_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "ProductVariationAttribute" (
	"id" text PRIMARY KEY NOT NULL,
	"variationId" text NOT NULL,
	"attributeId" text,
	"attributeValueId" text,
	"customAttributeName" text,
	"customAttributeValue" text
);
--> statement-breakpoint
CREATE TABLE "ProductVariation" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"sku" text,
	"price" integer DEFAULT 0 NOT NULL,
	"compareAtPrice" integer,
	"buyingPrice" integer,
	"stock" integer DEFAULT 0 NOT NULL,
	"lowStockThreshold" integer DEFAULT 5 NOT NULL,
	"image" text,
	"weight" integer,
	"barcode" text,
	"status" "VariationStatus" DEFAULT 'ACTIVE' NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Product" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"shortDescription" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"compareAtPrice" integer,
	"buyingPrice" integer,
	"sku" text NOT NULL,
	"categoryId" text NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"badge" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"isFeatured" boolean DEFAULT false NOT NULL,
	"isTrending" boolean DEFAULT false NOT NULL,
	"isNewArrival" boolean DEFAULT false NOT NULL,
	"isBestSeller" boolean DEFAULT false NOT NULL,
	"status" "ProductStatus" DEFAULT 'PUBLISHED' NOT NULL,
	"features" jsonb,
	"specifications" jsonb,
	"calculatedRating" double precision DEFAULT 5 NOT NULL,
	"calculatedReviewCount" integer DEFAULT 0 NOT NULL,
	"productType" text DEFAULT 'SIMPLE' NOT NULL,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Product_slug_unique" UNIQUE("slug"),
	CONSTRAINT "Product_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "Promotion" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"bannerUrl" text NOT NULL,
	"targetUrl" text NOT NULL,
	"startDate" timestamp with time zone,
	"endDate" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Review" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text,
	"productId" text NOT NULL,
	"customerName" text NOT NULL,
	"customerLocation" text,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"photos" text[] DEFAULT '{}' NOT NULL,
	"verifiedPurchase" boolean DEFAULT true NOT NULL,
	"status" "ReviewStatus" DEFAULT 'APPROVED' NOT NULL,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SeoSettings" (
	"id" text PRIMARY KEY NOT NULL,
	"defaultTitle" text DEFAULT 'Toolera — Discover What''s Trending' NOT NULL,
	"titleTemplate" text DEFAULT '%s | Toolera' NOT NULL,
	"defaultDescription" text DEFAULT 'Discover what''s trending. Smart finds, useful gadgets, and lifestyle essentials curated from China for Bangladesh.' NOT NULL,
	"defaultOgImage" text,
	"googleVerification" text,
	"metaPixelId" text,
	"tiktokPixelId" text,
	"ga4MeasurementId" text,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ShippingSettings" (
	"id" text PRIMARY KEY NOT NULL,
	"insideDhakaFee" integer DEFAULT 70 NOT NULL,
	"outsideDhakaFee" integer DEFAULT 130 NOT NULL,
	"freeShippingThreshold" integer DEFAULT 2000 NOT NULL,
	"estimatedInsideDhaka" text DEFAULT '1–2 Days' NOT NULL,
	"estimatedOutsideDhaka" text DEFAULT '2–4 Days' NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SiteSettings" (
	"id" text PRIMARY KEY NOT NULL,
	"storeName" text DEFAULT 'Toolera' NOT NULL,
	"tagline" text DEFAULT 'Discover What''s Trending. Smart Finds. Better Prices.' NOT NULL,
	"phone" text DEFAULT '+880 1712-345678' NOT NULL,
	"whatsapp" text DEFAULT '+8801712345678' NOT NULL,
	"email" text DEFAULT 'support@toolera.store' NOT NULL,
	"address" text DEFAULT 'Gulshan-1, Dhaka-1212, Bangladesh' NOT NULL,
	"currencySymbol" text DEFAULT '৳' NOT NULL,
	"timezone" text DEFAULT 'Asia/Dhaka' NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SmsLog" (
	"id" text PRIMARY KEY NOT NULL,
	"recipientPhone" text NOT NULL,
	"message" text NOT NULL,
	"provider" text NOT NULL,
	"status" text DEFAULT 'SENT' NOT NULL,
	"responseRaw" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SmsSettings" (
	"id" text PRIMARY KEY DEFAULT 'default_sms_settings' NOT NULL,
	"provider" text DEFAULT 'GREENWEB' NOT NULL,
	"apiKey" text,
	"senderId" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"orderPlacedEnabled" boolean DEFAULT true NOT NULL,
	"orderPlacedTemplate" text DEFAULT 'Dear {customer_name}, your order #{order_number} for BDT {total} is confirmed at Toolera! Helpline: 01712-345678' NOT NULL,
	"orderShippedEnabled" boolean DEFAULT true NOT NULL,
	"orderShippedTemplate" text DEFAULT 'Dear {customer_name}, your parcel #{order_number} is dispatched via {courier_name}. Tracking ID: {tracking_code}.' NOT NULL,
	"orderDeliveredEnabled" boolean DEFAULT true NOT NULL,
	"orderDeliveredTemplate" text DEFAULT 'Dear {customer_name}, your order #{order_number} has been delivered. Thank you for shopping with Toolera!' NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "StoreDomain" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text NOT NULL,
	"domain" text NOT NULL,
	"isPrimary" boolean DEFAULT false NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "StoreDomain_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "StoreMember" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text NOT NULL,
	"userId" text NOT NULL,
	"role" "StoreMemberRole" DEFAULT 'STAFF' NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"joinedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "StoreMember_storeId_userId_key" UNIQUE("storeId","userId")
);
--> statement-breakpoint
CREATE TABLE "Store" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"customDomain" text,
	"description" text,
	"tagline" text,
	"logoUrl" text,
	"faviconUrl" text,
	"email" text,
	"phone" text,
	"whatsapp" text,
	"address" text,
	"district" text,
	"country" text DEFAULT 'Bangladesh' NOT NULL,
	"currency" text DEFAULT 'BDT' NOT NULL,
	"currencySymbol" text DEFAULT '৳' NOT NULL,
	"timezone" text DEFAULT 'Asia/Dhaka' NOT NULL,
	"status" "StoreStatus" DEFAULT 'SETUP' NOT NULL,
	"ownerId" text NOT NULL,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Store_slug_unique" UNIQUE("slug"),
	CONSTRAINT "Store_customDomain_unique" UNIQUE("customDomain"),
	CONSTRAINT "Store_ownerId_unique" UNIQUE("ownerId")
);
--> statement-breakpoint
CREATE TABLE "SubscriptionInvoice" (
	"id" text PRIMARY KEY NOT NULL,
	"subscriptionId" text NOT NULL,
	"storeId" text NOT NULL,
	"invoiceNumber" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'BDT' NOT NULL,
	"status" "PaymentStatus" DEFAULT 'PAID' NOT NULL,
	"paymentMethod" text DEFAULT 'BKASH' NOT NULL,
	"transactionId" text,
	"periodStart" timestamp with time zone NOT NULL,
	"periodEnd" timestamp with time zone NOT NULL,
	"notes" text,
	"pdfUrl" text,
	"paidAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "SubscriptionInvoice_invoiceNumber_unique" UNIQUE("invoiceNumber")
);
--> statement-breakpoint
CREATE TABLE "SubscriptionPlan" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"priceMonthly" integer DEFAULT 0 NOT NULL,
	"priceYearly" integer DEFAULT 0 NOT NULL,
	"badge" text,
	"features" jsonb NOT NULL,
	"maxProducts" integer DEFAULT 50 NOT NULL,
	"maxOrdersPerMonth" integer DEFAULT 100 NOT NULL,
	"maxStaffMembers" integer DEFAULT 2 NOT NULL,
	"maxStorageMb" integer DEFAULT 500 NOT NULL,
	"allowCustomDomain" boolean DEFAULT false NOT NULL,
	"allowCourierIntegration" boolean DEFAULT false NOT NULL,
	"allowSmsGateway" boolean DEFAULT false NOT NULL,
	"allowAnalytics" boolean DEFAULT false NOT NULL,
	"prioritySupport" boolean DEFAULT false NOT NULL,
	"trialDays" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "SubscriptionPlan_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "Subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text NOT NULL,
	"planId" text NOT NULL,
	"planSlug" text DEFAULT 'pro' NOT NULL,
	"status" "SubscriptionStatus" DEFAULT 'ACTIVE' NOT NULL,
	"billingCycle" "BillingCycle" DEFAULT 'MONTHLY' NOT NULL,
	"currentPeriodStart" timestamp with time zone DEFAULT now() NOT NULL,
	"currentPeriodEnd" timestamp with time zone NOT NULL,
	"trialEndsAt" timestamp with time zone,
	"cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
	"paymentMethod" text DEFAULT 'BKASH' NOT NULL,
	"lastPaymentTrxId" text,
	"lastPaymentAmount" integer DEFAULT 0 NOT NULL,
	"lastPaymentDate" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Subscription_storeId_unique" UNIQUE("storeId")
);
--> statement-breakpoint
CREATE TABLE "ThemeSettings" (
	"id" text PRIMARY KEY NOT NULL,
	"storeId" text NOT NULL,
	"homepageLayout" text DEFAULT 'ORIGINAL_RAIFAS_MART' NOT NULL,
	"primary" text DEFAULT '#008B47' NOT NULL,
	"accent" text DEFAULT '#F9A01B' NOT NULL,
	"primaryButtonText" text DEFAULT '#FFFFFF' NOT NULL,
	"accentButtonText" text DEFAULT '#0F172A' NOT NULL,
	"background" text DEFAULT '#F8FAFC' NOT NULL,
	"surface" text DEFAULT '#FFFFFF' NOT NULL,
	"text" text DEFAULT '#0F172A' NOT NULL,
	"muted" text DEFAULT '#64748B' NOT NULL,
	"border" text DEFAULT '#E2E8F0' NOT NULL,
	"headingFont" text DEFAULT 'Inter, sans-serif' NOT NULL,
	"bodyFont" text DEFAULT 'Inter, sans-serif' NOT NULL,
	"radius" text DEFAULT '1rem' NOT NULL,
	"shadow" text DEFAULT '0 1px 3px 0 rgb(0 0 0 / 0.1)' NOT NULL,
	"containerWidth" text DEFAULT '1280px' NOT NULL,
	"sectionSpacing" text DEFAULT '4rem' NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ThemeSettings_storeId_unique" UNIQUE("storeId")
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"passwordHash" text NOT NULL,
	"name" text NOT NULL,
	"avatar" text,
	"role" "Role" DEFAULT 'OWNER' NOT NULL,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "AbandonedLead_customerPhone_idx" ON "AbandonedLead" USING btree ("customerPhone");--> statement-breakpoint
CREATE INDEX "AbandonedLead_createdAt_idx" ON "AbandonedLead" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "AttributeValue_attributeId_idx" ON "AttributeValue" USING btree ("attributeId");--> statement-breakpoint
CREATE INDEX "Attribute_slug_idx" ON "Attribute" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "Attribute_type_idx" ON "Attribute" USING btree ("type");--> statement-breakpoint
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog" USING btree ("entity","entityId");--> statement-breakpoint
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "Category_slug_idx" ON "Category" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "Category_parentId_idx" ON "Category" USING btree ("parentId");--> statement-breakpoint
CREATE INDEX "Coupon_code_idx" ON "Coupon" USING btree ("code");--> statement-breakpoint
CREATE INDEX "Customer_phone_idx" ON "Customer" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "Customer_email_idx" ON "Customer" USING btree ("email");--> statement-breakpoint
CREATE INDEX "FooterSettings_storeId_idx" ON "FooterSettings" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "HeaderSettings_storeId_idx" ON "HeaderSettings" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "MediaItem_filename_idx" ON "MediaItem" USING btree ("filename");--> statement-breakpoint
CREATE INDEX "MenuItem_menuId_position_idx" ON "MenuItem" USING btree ("menuId","position");--> statement-breakpoint
CREATE INDEX "OrderStatusHistory_orderId_createdAt_idx" ON "OrderStatusHistory" USING btree ("orderId","createdAt");--> statement-breakpoint
CREATE INDEX "Order_orderNumber_idx" ON "Order" USING btree ("orderNumber");--> statement-breakpoint
CREATE INDEX "Order_customerId_idx" ON "Order" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "Order_orderStatus_idx" ON "Order" USING btree ("orderStatus");--> statement-breakpoint
CREATE INDEX "Order_paymentStatus_idx" ON "Order" USING btree ("paymentStatus");--> statement-breakpoint
CREATE INDEX "Order_createdAt_idx" ON "Order" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "PageRevision_pageId_version_idx" ON "PageRevision" USING btree ("pageId","version");--> statement-breakpoint
CREATE INDEX "PageRevision_isPublished_idx" ON "PageRevision" USING btree ("isPublished");--> statement-breakpoint
CREATE INDEX "Page_slug_idx" ON "Page" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "Page_status_idx" ON "Page" USING btree ("status");--> statement-breakpoint
CREATE INDEX "PaymentTransaction_orderId_idx" ON "PaymentTransaction" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "PaymentTransaction_transactionId_idx" ON "PaymentTransaction" USING btree ("transactionId");--> statement-breakpoint
CREATE INDEX "ProductAttributeValue_productAttributeId_idx" ON "ProductAttributeValue" USING btree ("productAttributeId");--> statement-breakpoint
CREATE INDEX "ProductAttributeValue_attributeValueId_idx" ON "ProductAttributeValue" USING btree ("attributeValueId");--> statement-breakpoint
CREATE INDEX "ProductAttribute_productId_idx" ON "ProductAttribute" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "ProductAttribute_attributeId_idx" ON "ProductAttribute" USING btree ("attributeId");--> statement-breakpoint
CREATE INDEX "ProductVariationAttribute_variationId_idx" ON "ProductVariationAttribute" USING btree ("variationId");--> statement-breakpoint
CREATE INDEX "ProductVariationAttribute_attributeId_idx" ON "ProductVariationAttribute" USING btree ("attributeId");--> statement-breakpoint
CREATE INDEX "ProductVariationAttribute_attributeValueId_idx" ON "ProductVariationAttribute" USING btree ("attributeValueId");--> statement-breakpoint
CREATE INDEX "ProductVariation_productId_idx" ON "ProductVariation" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "ProductVariation_sku_idx" ON "ProductVariation" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "ProductVariation_status_idx" ON "ProductVariation" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Product_slug_idx" ON "Product" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "Product_categoryId_idx" ON "Product" USING btree ("categoryId");--> statement-breakpoint
CREATE INDEX "Product_status_idx" ON "Product" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Product_isFeatured_idx" ON "Product" USING btree ("isFeatured");--> statement-breakpoint
CREATE INDEX "Product_isTrending_idx" ON "Product" USING btree ("isTrending");--> statement-breakpoint
CREATE INDEX "Product_isNewArrival_idx" ON "Product" USING btree ("isNewArrival");--> statement-breakpoint
CREATE INDEX "Review_productId_status_idx" ON "Review" USING btree ("productId","status");--> statement-breakpoint
CREATE INDEX "SmsLog_recipientPhone_idx" ON "SmsLog" USING btree ("recipientPhone");--> statement-breakpoint
CREATE INDEX "SmsLog_createdAt_idx" ON "SmsLog" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "StoreDomain_storeId_idx" ON "StoreDomain" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "StoreDomain_domain_idx" ON "StoreDomain" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "StoreMember_storeId_idx" ON "StoreMember" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "StoreMember_userId_idx" ON "StoreMember" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "Store_slug_idx" ON "Store" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "Store_customDomain_idx" ON "Store" USING btree ("customDomain");--> statement-breakpoint
CREATE INDEX "Store_ownerId_idx" ON "Store" USING btree ("ownerId");--> statement-breakpoint
CREATE INDEX "Store_status_idx" ON "Store" USING btree ("status");--> statement-breakpoint
CREATE INDEX "SubscriptionInvoice_subscriptionId_idx" ON "SubscriptionInvoice" USING btree ("subscriptionId");--> statement-breakpoint
CREATE INDEX "SubscriptionInvoice_storeId_idx" ON "SubscriptionInvoice" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "SubscriptionInvoice_invoiceNumber_idx" ON "SubscriptionInvoice" USING btree ("invoiceNumber");--> statement-breakpoint
CREATE INDEX "SubscriptionPlan_slug_idx" ON "SubscriptionPlan" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "SubscriptionPlan_isActive_idx" ON "SubscriptionPlan" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "Subscription_storeId_idx" ON "Subscription" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "Subscription_planId_idx" ON "Subscription" USING btree ("planId");--> statement-breakpoint
CREATE INDEX "Subscription_status_idx" ON "Subscription" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ThemeSettings_storeId_idx" ON "ThemeSettings" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "User_email_idx" ON "User" USING btree ("email");