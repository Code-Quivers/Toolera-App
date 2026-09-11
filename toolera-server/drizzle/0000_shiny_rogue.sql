CREATE TABLE "toolera"."admin_users" (
	"admin_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'ADMIN' NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "toolera"."order_items" (
	"item_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"tool_id" uuid,
	"variant_id" uuid,
	"product_name" text NOT NULL,
	"product_sku" text NOT NULL,
	"unit_price" integer NOT NULL,
	"quantity" integer NOT NULL,
	"total" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "toolera"."orders" (
	"order_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"seller_google_id" text NOT NULL,
	"customer_name" text,
	"customer_phone" text,
	"customer_email" text,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"discount_amount" integer DEFAULT 0 NOT NULL,
	"vat_amount" integer DEFAULT 0 NOT NULL,
	"grand_total" integer DEFAULT 0 NOT NULL,
	"payment_method" text,
	"payment_status" text DEFAULT 'UNPAID' NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"notes" text,
	"order_date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "toolera"."platform_settings" (
	"setting_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "platform_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "toolera"."seller_subscriptions" (
	"subscription_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_google_id" text NOT NULL,
	"plan_name" text NOT NULL,
	"billing_cycle" text NOT NULL,
	"price" integer NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"start_date" timestamp with time zone DEFAULT now() NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"auto_renew" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "toolera"."sellers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_google_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"avatar_url" text,
	"store_name" text,
	"store_slug" text,
	"phone" text,
	"city" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"subscription_plan" text,
	"subscription_end_date" timestamp with time zone,
	"total_orders" integer DEFAULT 0 NOT NULL,
	"total_revenue" integer DEFAULT 0 NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sellers_seller_google_id_unique" UNIQUE("seller_google_id")
);
--> statement-breakpoint
CREATE TABLE "toolera"."tool_variants" (
	"variant_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tool_id" uuid NOT NULL,
	"name" text NOT NULL,
	"sku" text NOT NULL,
	"price" integer NOT NULL,
	"billing_cycle" text,
	"features" text[] DEFAULT '{}' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "toolera"."tools" (
	"tool_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"short_description" text,
	"type" text DEFAULT 'SOFTWARE' NOT NULL,
	"category" text,
	"base_price" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'BDT' NOT NULL,
	"images" text[] DEFAULT '{}' NOT NULL,
	"features" text[] DEFAULT '{}' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tools_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "toolera"."order_items" ADD CONSTRAINT "order_items_order_id_orders_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "toolera"."orders"("order_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toolera"."order_items" ADD CONSTRAINT "order_items_tool_id_tools_tool_id_fk" FOREIGN KEY ("tool_id") REFERENCES "toolera"."tools"("tool_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toolera"."order_items" ADD CONSTRAINT "order_items_variant_id_tool_variants_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "toolera"."tool_variants"("variant_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toolera"."tool_variants" ADD CONSTRAINT "tool_variants_tool_id_tools_tool_id_fk" FOREIGN KEY ("tool_id") REFERENCES "toolera"."tools"("tool_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "toolera_admin_users_email_idx" ON "toolera"."admin_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "toolera_admin_users_role_idx" ON "toolera"."admin_users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "toolera_admin_users_status_idx" ON "toolera"."admin_users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "toolera_order_items_order_idx" ON "toolera"."order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "toolera_order_items_tool_idx" ON "toolera"."order_items" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "toolera_orders_seller_idx" ON "toolera"."orders" USING btree ("seller_google_id");--> statement-breakpoint
CREATE UNIQUE INDEX "toolera_orders_number_idx" ON "toolera"."orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "toolera_orders_status_idx" ON "toolera"."orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "toolera_orders_payment_status_idx" ON "toolera"."orders" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "toolera_orders_date_idx" ON "toolera"."orders" USING btree ("order_date");--> statement-breakpoint
CREATE UNIQUE INDEX "toolera_platform_settings_key_idx" ON "toolera"."platform_settings" USING btree ("key");--> statement-breakpoint
CREATE INDEX "toolera_seller_subscriptions_seller_idx" ON "toolera"."seller_subscriptions" USING btree ("seller_google_id");--> statement-breakpoint
CREATE INDEX "toolera_seller_subscriptions_status_idx" ON "toolera"."seller_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "toolera_seller_subscriptions_end_date_idx" ON "toolera"."seller_subscriptions" USING btree ("end_date");--> statement-breakpoint
CREATE UNIQUE INDEX "toolera_sellers_google_id_idx" ON "toolera"."sellers" USING btree ("seller_google_id");--> statement-breakpoint
CREATE INDEX "toolera_sellers_email_idx" ON "toolera"."sellers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "toolera_sellers_status_idx" ON "toolera"."sellers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "toolera_sellers_store_slug_idx" ON "toolera"."sellers" USING btree ("store_slug");--> statement-breakpoint
CREATE INDEX "toolera_tool_variants_tool_idx" ON "toolera"."tool_variants" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "toolera_tool_variants_sku_idx" ON "toolera"."tool_variants" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "toolera_tool_variants_status_idx" ON "toolera"."tool_variants" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "toolera_tools_slug_idx" ON "toolera"."tools" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "toolera_tools_type_idx" ON "toolera"."tools" USING btree ("type");--> statement-breakpoint
CREATE INDEX "toolera_tools_category_idx" ON "toolera"."tools" USING btree ("category");--> statement-breakpoint
CREATE INDEX "toolera_tools_status_idx" ON "toolera"."tools" USING btree ("status");