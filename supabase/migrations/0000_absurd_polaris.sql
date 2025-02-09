CREATE TABLE "meme_coins" (
	"id" text PRIMARY KEY NOT NULL,
	"symbol" text NOT NULL,
	"name" text NOT NULL,
	"base_contract" text NOT NULL,
	"current_price" numeric NOT NULL,
	"market_cap" numeric NOT NULL,
	"total_volume" numeric NOT NULL,
	"price_change_24h" numeric,
	"description" text,
	"image_thumb" text,
	"image_small" text,
	"image_large" text,
	"last_updated" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_id" integer NOT NULL,
	"tx_hash" text NOT NULL,
	"token_identifier" text NOT NULL,
	"token_address" text NOT NULL,
	"token_amount" numeric NOT NULL,
	"purchased_amount_in_usdc" numeric NOT NULL,
	"settled_amount_in_usdc" numeric,
	"entry_point" numeric NOT NULL,
	"exit_point" numeric,
	"stop_loss" numeric NOT NULL,
	"take_profit" numeric NOT NULL,
	"tx_status" text DEFAULT 'ACTIVE' NOT NULL,
	"settlement_type" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_uid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_uid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("uid") ON DELETE no action ON UPDATE no action;