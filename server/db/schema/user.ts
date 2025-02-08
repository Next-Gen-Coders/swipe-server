import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const usersTable = pgTable("users", {
  uid: serial("uid").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  cryptoExp: integer("crypto_exp").notNull(), // Years of experience
  riskTolerance: text("risk_tolerance", {
    enum: ["low", "medium", "high"],
  }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Create Zod schemas for validation
export const userInsertSchema = createInsertSchema(usersTable);
export const userSelectSchema = createSelectSchema(usersTable);
export const userUpdateSchema = createUpdateSchema(usersTable);

// Export types
export type UserInsertSchema = z.infer<typeof userInsertSchema>;
export type UserSelectSchema = z.infer<typeof userSelectSchema>;
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;
