import { db } from "../index";
import {
  walletsTable,
  WalletInsertSchema,
  WalletUpdateSchema,
} from "../schema/wallet";
import { eq, and, desc } from "drizzle-orm";

// Basic CRUD Operations
export async function createWallet(wallet: WalletInsertSchema) {
  const [newWallet] = await db.insert(walletsTable).values(wallet).returning();
  return newWallet;
}

export async function getWalletById(id: number) {
  const [wallet] = await db
    .select()
    .from(walletsTable)
    .where(eq(walletsTable.id, id));
  return wallet;
}

export async function getWalletByUserId(userId: string) {
  const [wallet] = await db
    .select()
    .from(walletsTable)
    .where(eq(walletsTable.userId, userId));
  return wallet;
}

export async function getUserWallets(userId: string) {
  return db
    .select()
    .from(walletsTable)
    .where(eq(walletsTable.userId, userId))
    .orderBy(desc(walletsTable.created_at));
}

export async function updateWallet(
  id: number,
  data: Partial<WalletUpdateSchema>
) {
  const [wallet] = await db
    .update(walletsTable)
    .set({
      ...data,
      updated_at: new Date(),
    })
    .where(eq(walletsTable.id, id))
    .returning();
  return wallet;
}

export async function deleteWallet(id: number) {
  const [wallet] = await db
    .delete(walletsTable)
    .where(eq(walletsTable.id, id))
    .returning();
  return wallet;
}

// Advanced Queries
export async function getWalletByAddress(address: string) {
  const [wallet] = await db
    .select()
    .from(walletsTable)
    .where(eq(walletsTable.address, address));
  return wallet;
}

export async function getWalletsByNetworkId(networkId: string, userId: string) {
  return db
    .select()
    .from(walletsTable)
    .where(
      and(
        eq(walletsTable.network_id, networkId),
        eq(walletsTable.userId, userId)
      )
    );
}

export async function getRecentWallets(limit: number = 10) {
  return db
    .select()
    .from(walletsTable)
    .orderBy(desc(walletsTable.created_at))
    .limit(limit);
}
