import { TransactionSelectSchema } from "../db/schema/transaction";
import { getUserTransactions as getUserTransactionQuery } from "../db/queries/transactions";
import { getUserByUid as getUserByIdQuery } from "../db/queries/users";

export const getUserTransactions = async (
  userId: string
): Promise<{
  data: TransactionSelectSchema[] | null;
  message: string;
  error: any;
}> => {
  try {
    if (!userId) {
      return {
        data: null,
        message: "User ID is required",
        error: "User ID is required",
      };
    }

    const user = await getUserByIdQuery(userId);

    if (!user) {
      return {
        data: null,
        message: "User not found",
        error: "User not found",
      };
    }

    const transactions = await getUserTransactionQuery(userId) || [];


    return {
      data: transactions,
      message: "Transactions fetched successfully",
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      message: "Error fetching transactions",
      error: error,
    };
  }
};

export default getUserTransactions;
