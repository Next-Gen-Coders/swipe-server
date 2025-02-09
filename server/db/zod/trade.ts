import { z } from "zod";

export const tradeSchema = z.object({
  email: z.string(),
  tradePayload: z.object({
    id: z.string(),
    name: z.string(),
    symbol: z.string(),
    position_type: z.enum(["long", "short"]),
    entry_price: z.number(),
    stop_loss: z.number(),
    take_profit: z.number(),
    reasoning: z.string(),
    base_contract: z.string().nullable(),
    current_price: z.number(),
    price_change_24h: z.number(),
    amountInUSDC: z.number(),
    image: z
      .object({
        thumb: z.string(),
        small: z.string(),
        large: z.string(),
      })
      .nullable(),
  }),
});

export type TradeSchema = z.infer<typeof tradeSchema>;
