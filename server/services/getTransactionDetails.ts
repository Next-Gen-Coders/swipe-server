import { TransactionSelectSchema } from "../db/schema/transaction";
import { getTransactionById as getTransactionByIdQuery } from "../db/queries/transactions";

export const getTransactionDetails = async (
  transactionId: string
): Promise<{
  data: TransactionSelectSchema | null;
  message: string;
  error: any;
}> => {
  try {
    if (!transactionId) {
      return {
        data: null,
        message: "Transaction ID is required",
        error: "Transaction ID is required",
      };
    }

    const transaction = await getTransactionByIdQuery(transactionId);

    if (!transaction) {
      return {
        data: null,
        message: "Transaction not found",
        error: "Transaction not found",
      };
    }

    return {
      data: transaction,
      message: "Transaction fetched successfully",
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

export default getTransactionDetails;
