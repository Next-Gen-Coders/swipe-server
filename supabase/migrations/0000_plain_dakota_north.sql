CREATE TABLE "users" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"crypto_exp" integer NOT NULL,
	"risk_tolerance" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_id" text NOT NULL,
	"wallet_data" text NOT NULL,
	"network_id" text NOT NULL,
	"address" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_uid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("uid") ON DELETE no action ON UPDATE no action;