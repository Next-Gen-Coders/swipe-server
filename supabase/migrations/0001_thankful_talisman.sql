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
