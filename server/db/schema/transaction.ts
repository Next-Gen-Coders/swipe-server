import {
  pgTable,
  text,
  timestamp,
  integer,
  uuid,
  numeric,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./user";
import { walletsTable } from "./wallet";
import { SettlementType, TransactionStatus } from "../../utils/enums";

export const transactionsTable = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.uid),
  walletId: integer("wallet_id")
    .notNull()
    .references(() => walletsTable.id),
  txHash: text("tx_hash").notNull(),
  tokenIdentifier: text("token_identifier").notNull(),
  tokenAddress: text("token_address").notNull(),
  tokenAmount: numeric("token_amount").notNull(),
  purchasedAmountInUSDC: numeric("purchased_amount_in_usdc").notNull(),
  settledAmountInUSDC: numeric("settled_amount_in_usdc"),
  entryPoint: numeric("entry_point").notNull(),
  exitPoint: numeric("exit_point"),
  stopLoss: numeric("stop_loss").notNull(),
  takeProfit: numeric("take_profit").notNull(),
  txStatus: text("tx_status", {
    enum: [TransactionStatus.ACTIVE, TransactionStatus.SETTLED],
  })
    .notNull()
    .default(TransactionStatus.ACTIVE),
  settlementType: text("settlement_type", {
    enum: [
      SettlementType.USER,
      SettlementType.STOP_LOSS,
      SettlementType.TAKE_PROFIT,
      SettlementType.PENDING,
    ],
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Create relations
export const transactionRelations = relations(transactionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [transactionsTable.userId],
    references: [usersTable.uid],
  }),
  wallet: one(walletsTable, {
    fields: [transactionsTable.walletId],
    references: [walletsTable.id],
  }),
}));

// Create Zod schemas for validation
export const transactionInsertSchema = createInsertSchema(transactionsTable);
export const transactionSelectSchema = createSelectSchema(transactionsTable);
export const transactionUpdateSchema = createUpdateSchema(transactionsTable);

// Export types
export type TransactionInsertSchema = z.infer<typeof transactionInsertSchema>;
export type TransactionSelectSchema = z.infer<typeof transactionSelectSchema>;
export type TransactionUpdateSchema = z.infer<typeof transactionUpdateSchema>;
