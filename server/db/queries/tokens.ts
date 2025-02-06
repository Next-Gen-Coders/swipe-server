import { db } from "../index";
import { tokensTable, TokenInsertSchema, TokenUpdateSchema } from "../schema";
import { eq } from "drizzle-orm";

export async function getAllTokens() {
  return await db.select().from(tokensTable);
}

export async function getTokenById(id: number) {
  return await db.select().from(tokensTable).where(eq(tokensTable.id, id));
}

export async function createToken(token: TokenInsertSchema) {
  return await db.insert(tokensTable).values(token);
}

export async function updateToken(id: number, token: TokenUpdateSchema) {
  return await db
    .update(tokensTable)
    .set(token)
    .where(eq(tokensTable.id, id));
}

export async function deleteToken(id: number) {
  return await db.delete(tokensTable).where(eq(tokensTable.id, id));
}
