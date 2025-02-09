import { pgTable, text, numeric, timestamp } from "drizzle-orm/pg-core";

export const memeCoinsTable = pgTable("meme_coins", {
  id: text("id").primaryKey(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  base_contract: text("base_contract").notNull(),
  current_price: numeric("current_price").notNull(),
  market_cap: numeric("market_cap").notNull(),
  total_volume: numeric("total_volume").notNull(),
  price_change_24h: numeric("price_change_24h"),
  description: text("description"),
  image_thumb: text("image_thumb"),
  image_small: text("image_small"),
  image_large: text("image_large"),
  last_updated: timestamp("last_updated").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
