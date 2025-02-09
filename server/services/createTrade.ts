import { TradeSchema } from "../db/zod/trade";
import { TransactionInsertSchema } from "../db/schema/transaction";
import { getUserByEmail } from "../db/queries/users";
import { createTransaction } from "../db/queries/transactions";
import { getWalletByUserId } from "../db/queries/wallets";
import { UserSelectSchema } from "../db/schema/user";
import { SettlementType, TransactionStatus } from "../utils/enums";

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

    // const executeTrade = await trade

    // if (!executeTrade) {
    //   return {
    //     data: null,
    //     message: "Trade executed",
    //     error: null,
    //   };
    // }

    const transaction: TransactionInsertSchema = await createTransaction({
      userId: user.uid,
      walletId: wallet.id,
      amountInUSDC: trade.tradePayload.amountInUSDC.toString(),
      txHash: "excuteTrade.tsxHash",
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
