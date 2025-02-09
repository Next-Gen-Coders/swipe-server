export enum SCOPE {
  USER = "USER",
}

// Create enum for transaction status
export enum TransactionStatus {
  ACTIVE = "ACTIVE",
  SETTLED = "SETTLED",
}

export enum TransactionType {
  BUY = "BUY",
  SELL = "SELL",
}

// Create enum for settlement type
export enum SettlementType {
  USER = "USER",
  STOP_LOSS = "STOP_LOSS",
  TAKE_PROFIT = "TAKE_PROFIT",
  PENDING = "PENDING",
}