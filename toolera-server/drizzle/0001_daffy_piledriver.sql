CREATE TABLE "toolera"."categories" (
	"category_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"icon" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "toolera"."packages" (
	"package_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"platform_name_id" uuid NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"currency" text DEFAULT 'BDT' NOT NULL,
	"billing_cycle" text DEFAULT 'monthly' NOT NULL,
	"features" text[] DEFAULT '{}' NOT NULL,
	"trial_days" integer DEFAULT 0 NOT NULL,
	"is_highlighted" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "packages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "toolera"."platforms" (
	"platform_name_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform_name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "platforms_platform_name_unique" UNIQUE("platform_name")
);
--> statement-breakpoint
CREATE TABLE "toolera"."seller_package_subscriptions" (
	"subscription_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_google_id" text NOT NULL,
	"package_id" uuid NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"start_date" timestamp with time zone DEFAULT now() NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"auto_renew" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "toolera"."support_ticket_replies" (
	"reply_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"author_id" uuid,
	"author_type" text DEFAULT 'admin' NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "toolera"."support_tickets" (
	"ticket_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_number" text NOT NULL,
	"seller_google_id" text,
	"seller_email" text,
	"seller_name" text,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"priority" text DEFAULT 'MEDIUM' NOT NULL,
	"assigned_to" uuid,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "support_tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
ALTER TABLE "toolera"."packages" ADD CONSTRAINT "packages_platform_name_id_platforms_platform_name_id_fk" FOREIGN KEY ("platform_name_id") REFERENCES "toolera"."platforms"("platform_name_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toolera"."seller_package_subscriptions" ADD CONSTRAINT "seller_package_subscriptions_package_id_packages_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "toolera"."packages"("package_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toolera"."support_ticket_replies" ADD CONSTRAINT "support_ticket_replies_ticket_id_support_tickets_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "toolera"."support_tickets"("ticket_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toolera"."support_ticket_replies" ADD CONSTRAINT "support_ticket_replies_author_id_admin_users_admin_id_fk" FOREIGN KEY ("author_id") REFERENCES "toolera"."admin_users"("admin_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toolera"."support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_admin_users_admin_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "toolera"."admin_users"("admin_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "toolera_categories_name_idx" ON "toolera"."categories" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "toolera_categories_slug_idx" ON "toolera"."categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "toolera_categories_active_idx" ON "toolera"."categories" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "toolera_packages_slug_idx" ON "toolera"."packages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "toolera_packages_platform_idx" ON "toolera"."packages" USING btree ("platform_name_id");--> statement-breakpoint
CREATE INDEX "toolera_packages_active_idx" ON "toolera"."packages" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "toolera_packages_platform_active_idx" ON "toolera"."packages" USING btree ("platform_name_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "toolera_platforms_platform_name_idx" ON "toolera"."platforms" USING btree ("platform_name");--> statement-breakpoint
CREATE INDEX "toolera_sps_seller_idx" ON "toolera"."seller_package_subscriptions" USING btree ("seller_google_id");--> statement-breakpoint
CREATE INDEX "toolera_sps_package_idx" ON "toolera"."seller_package_subscriptions" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "toolera_sps_status_idx" ON "toolera"."seller_package_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "toolera_sps_end_date_idx" ON "toolera"."seller_package_subscriptions" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "toolera_ticket_replies_ticket_idx" ON "toolera"."support_ticket_replies" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "toolera_ticket_replies_author_idx" ON "toolera"."support_ticket_replies" USING btree ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "toolera_support_tickets_number_idx" ON "toolera"."support_tickets" USING btree ("ticket_number");--> statement-breakpoint
CREATE INDEX "toolera_support_tickets_seller_idx" ON "toolera"."support_tickets" USING btree ("seller_google_id");--> statement-breakpoint
CREATE INDEX "toolera_support_tickets_status_idx" ON "toolera"."support_tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "toolera_support_tickets_priority_idx" ON "toolera"."support_tickets" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "toolera_support_tickets_assigned_idx" ON "toolera"."support_tickets" USING btree ("assigned_to");