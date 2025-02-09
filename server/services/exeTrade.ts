import { TransactionType } from "../utils/enums";

type executeTradeProps = {
  type: TransactionType;
  amount: number;
  tokenAddress: string;
};

type executeTradeResponse = {
  txHash?: string;
  tokenAmount?: number;
  message: string;
  error: any;
};

const tradeUSDCToToken = async (amount: number, tokenAddress: string) => {
  //   trade USDC to given token address
  const txHash = "txHash";
  const tokenAmount = 0;
  return { txHash, tokenAmount };
};

const tradeTokenToUSDC = async (amount: string, tokenAddress: string) => {
  //   trade token back to USDC
  const txHash = "txHash";
  const tokenAmount = 0;
  return { txHash, tokenAmount };
};

export const executeTrade = async ({
  type,
  amount,
  tokenAddress,
}: executeTradeProps): Promise<executeTradeResponse> => {
  if (type === TransactionType.BUY) {
    try {
      //   const transaction = await getTransactionById(transactionId);
      //  trade USDC to given token address
      const { txHash, tokenAmount } = await tradeUSDCToToken(
        amount,
        tokenAddress
      );
      //   update transaction with txHash and tokenAmount
      return {
        txHash,
        tokenAmount,
        message: "Trade executed successfully",
        error: null,
      };
    } catch (error) {
      console.error(error);
      return {
        txHash: undefined,
        tokenAmount: undefined,
        message: "Error executing trade",
        error: error,
      };
    }
  } else if (type === TransactionType.SELL) {
    try {
      //   const transaction = await getTransactionById(transactionId);
      //   trade token back to USDC
      //   amount will be present on the transaction
      const { txHash, tokenAmount } = await tradeTokenToUSDC(
        amount.toString(),
        tokenAddress
      );
      //   update transaction with txHash and tokenAmount
      return {
        txHash,
        tokenAmount,
        message: "Trade executed successfully",
        error: null,
      };
    } catch (error) {
      console.error(error);
      return {
        txHash: undefined,
        tokenAmount: undefined,
        message: "Error executing trade",
        error: error,
      };
    }
  }

  // Add default return
  return {
    txHash: undefined,
    tokenAmount: undefined,
    message: "Invalid transaction type",
    error: "Invalid transaction type",
  };
};
