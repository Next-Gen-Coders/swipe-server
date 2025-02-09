import { TradeSchema } from "../db/zod/trade";
import { TransactionInsertSchema } from "../db/schema/transaction";
import { getUserByEmail } from "../db/queries/users";
import { createTransaction } from "../db/queries/transactions";
import { getWalletByUserId } from "../db/queries/wallets";
import { UserSelectSchema } from "../db/schema/user";
import {
  SettlementType,
  TransactionStatus,
  TransactionType,
} from "../utils/enums";
import { executeTrade } from "./exeTrade";
export const createTrade = async (
  trade: TradeSchema
): Promise<{
  data: TransactionInsertSchema | null;
  message: string;
  error: any;
}> => {
  try {
    const [user]: UserSelectSchema[] = await getUserByEmail(trade.email);
    if (!user) {
      return {
        data: null,
        message: "User not found",
        error: "User not found",
      };
    }

    const wallet = await getWalletByUserId(user.uid);

    if (!wallet) {
      return {
        data: null,
        message: "Wallet not found",
        error: "Wallet not found",
      };
    }

    const { txHash, tokenAmount } = await executeTrade({
      type: TransactionType.BUY,
      amount: trade.tradePayload.purchasedAmountInUSDC,
      tokenAddress: trade.tradePayload.base_contract!,
    });

    if (!txHash || !tokenAmount) {
      return {
        data: null,
        message: "Error executing trade",
        error: "Error executing trade",
      };
    }

    const transaction: TransactionInsertSchema = await createTransaction({
      userId: user.uid,
      walletId: wallet.id,
      purchasedAmountInUSDC:
        trade.tradePayload.purchasedAmountInUSDC.toString(),
      settledAmountInUSDC: null,
      txHash: txHash,
      tokenAddress: trade.tradePayload.base_contract!,
      tokenAmount: tokenAmount.toString(),
      tokenIdentifier: trade.tradePayload.id,
      entryPoint: trade.tradePayload.entry_price.toString(),
      stopLoss: trade.tradePayload.stop_loss.toString(),
      takeProfit: trade.tradePayload.take_profit.toString(),
      settlementType: SettlementType.PENDING,
      txStatus: TransactionStatus.ACTIVE,
    });

    return {
      data: transaction,
      message: "Trade created",
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      message: "Error creating trade",
      error: error,
    };
  }
};

export default createTrade;
