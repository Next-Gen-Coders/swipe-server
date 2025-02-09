import { TransactionSelectSchema } from "../db/schema/transaction";
import {
  createTransaction,
  getTransactionById,
} from "../db/queries/transactions";
import { TransactionStatus, TransactionType } from "../utils/enums";
import { executeTrade } from "./exeTrade";

export const settleTrade = async (
  transactionId: string
): Promise<{
  data: TransactionSelectSchema | null;
  message: string;
  error: any;
}> => {

  try {
    const transaction = await getTransactionById(transactionId);
    if (!transaction) {
      return {
        data: null,
        message: "Transaction not found",
        error: "Transaction not found",
      };
    }

    if (transaction.txStatus !== TransactionStatus.ACTIVE) {
      return {
        data: null,
        message: "Transaction not active",
        error: "Transaction not active",
      };
    }

    const { txHash, tokenAmount } = await executeTrade({
      type: TransactionType.SELL,
      amount: Number(transaction.tokenAmount),
      tokenAddress: transaction.tokenAddress,
    });

    if (!txHash || !tokenAmount) {
      return {
        data: null,
        message: "Error settling trade",
        error: "Error settling trade",
      };
    }

    const newTransaction = await createTransaction({
      ...transaction,
      txStatus: TransactionStatus.SETTLED,
      settledAmountInUSDC: tokenAmount.toString(),
      txHash: txHash,
    });

    return {
      data: newTransaction,
      message: "Transaction settled",
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      message: "Error settling trade",
      error: error,
    };
  }
};

export default settleTrade;
