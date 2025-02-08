import { db } from "../index";
import { usersTable, UserInsertSchema, UserUpdateSchema } from "../schema/user";
import { eq, gt, lt, and, desc } from "drizzle-orm";

// Get all users
export async function getAllUsers() {
  return await db.select().from(usersTable);
}

// Get user by uid
export async function getUserByUid(uid: string) {
  return await db.select().from(usersTable).where(eq(usersTable.uid, uid));
}

// Get user by email
export async function getUserByEmail(email: string) {
  return await db.select().from(usersTable).where(eq(usersTable.email, email));
}

// Create new user
export async function createUser(user: UserInsertSchema) {
  return await db.insert(usersTable).values(user).returning();
}

// Update user
export async function updateUser(uid: string, user: UserUpdateSchema) {
  return await db
    .update(usersTable)
    .set(user)
    .where(eq(usersTable.uid, uid))
    .returning();
}

// Delete user
export async function deleteUser(uid: string) {
  return await db.delete(usersTable).where(eq(usersTable.uid, uid)).returning();
}

// Advanced Queries

// Get users by experience level
export async function getUsersByExperience(minYears: number) {
  return await db
    .select()
    .from(usersTable)
    .where(gt(usersTable.cryptoExp, minYears))
    .orderBy(desc(usersTable.cryptoExp));
}

// Get users by risk tolerance
export async function getUsersByRiskTolerance(
  riskLevel: "low" | "medium" | "high"
) {
  return await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.riskTolerance, riskLevel));
}

// Get experienced users with high risk tolerance
export async function getExperiencedHighRiskUsers(minYears: number) {
  return await db
    .select()
    .from(usersTable)
    .where(
      and(
        gt(usersTable.cryptoExp, minYears),
        eq(usersTable.riskTolerance, "high")
      )
    );
}

// Get recently joined users
export async function getRecentUsers(daysAgo: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

  return await db
    .select()
    .from(usersTable)
    .where(gt(usersTable.createdAt, cutoffDate))
    .orderBy(desc(usersTable.createdAt));
}
