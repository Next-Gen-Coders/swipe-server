import { pgTable, text, uuid, timestamp, serial } from "drizzle-orm/pg-core";
import { usersTable } from "./user"; // assuming this exists
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const walletsTable = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.uid),
  wallet_id: text("wallet_id").notNull(),
  wallet_data: text("wallet_data").notNull(),
  network_id: text("network_id").notNull(),
  address: text("address").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Create relation between user and wallet
export const walletRelations = relations(walletsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [walletsTable.userId],
    references: [usersTable.uid],
  }),
}));

export const walletInsertSchema = createInsertSchema(walletsTable);
export const walletSelectSchema = createSelectSchema(walletsTable);
export const walletUpdateSchema = createUpdateSchema(walletsTable); 


export type WalletInsertSchema = z.infer<typeof walletInsertSchema>;
export type WalletSelectSchema = z.infer<typeof walletSelectSchema>;
export type WalletUpdateSchema = z.infer<typeof walletUpdateSchema>;
