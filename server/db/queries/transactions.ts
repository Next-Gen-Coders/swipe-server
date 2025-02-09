import { eq, and, desc } from "drizzle-orm";
import { db } from "../index";
import { transactionsTable } from "../schema/transaction";
import type {
  TransactionInsertSchema,
  TransactionUpdateSchema,
} from "../schema/transaction";
import { TransactionStatus } from "../../utils/enums";

export async function createTransaction(data: TransactionInsertSchema) {
  const [transaction] = await db
    .insert(transactionsTable)
    .values(data)
    .returning();
  return transaction;
}

export async function getTransactionById(id: string) {
  const [transaction] = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.id, id));
  return transaction;
}

export async function getUserTransactions(userId: string) {
  return db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.userId, userId))
    .orderBy(desc(transactionsTable.createdAt));
}

export async function getActiveTransactions(userId: string) {
  return db
    .select()
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.userId, userId),
        eq(transactionsTable.txStatus, TransactionStatus.ACTIVE)
      )
    );
}

export async function updateTransaction(
  id: string,
  data: Partial<TransactionUpdateSchema>
) {
  const [transaction] = await db
    .update(transactionsTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(transactionsTable.id, id))
    .returning();
  return transaction;
}

export async function deleteTransaction(id: string) {
  const [transaction] = await db
    .delete(transactionsTable)
    .where(eq(transactionsTable.id, id))
    .returning();
  return transaction;
}
