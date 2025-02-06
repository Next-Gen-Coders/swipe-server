import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const tokensTable = pgTable("tokens", {
  id: serial("id").primaryKey(),
  token: text("token").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tokenInsertSchema = createInsertSchema(tokensTable);
export const tokenSelectSchema = createSelectSchema(tokensTable);
export const tokenUpdateSchema = createUpdateSchema(tokensTable);

export type TokenInsertSchema = z.infer<typeof tokenInsertSchema>;
export type TokenSelectSchema = z.infer<typeof tokenSelectSchema>;
export type TokenUpdateSchema = z.infer<typeof tokenUpdateSchema>;
