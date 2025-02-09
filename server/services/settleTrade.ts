import { TransactionSelectSchema } from "../db/schema/transaction";

export const settleTrade = async (transactionId: string): Promise<{
  data: TransactionSelectSchema | null;
  message: string;
  error: string | null;
}> => {

  // bring the transaction by its id
  // check if the transaction is active
  // if the transaction is not active and is not settled, then return an error
  // fetch the coin price from the coin api and add it in the exitPrice field
  // if the transaction is settled, then return the transaction

  return {
    data: null,
    message: "Transaction settled",
    error: null,
  };
};

export default settleTrade;
