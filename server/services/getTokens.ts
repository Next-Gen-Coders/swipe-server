import { getAllTokens } from "../db/queries/tokens";
import type { TokenSelectSchema } from "../db/schema";

export const getToken = async (): Promise<{
  data: TokenSelectSchema[] | null;
  message: string;
  error: any;
}> => {
  try {
    const tokens = await getAllTokens();

    return {
      data: tokens,
      message: "Tokens fetched successfully",
      error: null,
    };
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return {
      data: null,
      message: "Failed to fetch tokens",
      error: error,
    };
  }
};

export default getToken;
