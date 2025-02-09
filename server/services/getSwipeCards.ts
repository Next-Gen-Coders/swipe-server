import { getUserByEmail } from "../db/queries/users";
import OpenAI from "openai";
import { db } from "../db"; // Make sure this path is correct
import { memeCoinsTable } from "../db/schema/memeCoin"; // Make sure this path is correct

interface MemeCoinsData {
  coins: {
    id: string;
    symbol: string;
    name: string;
    base_contract: string | null;
    current_price: number;
    market_cap: number;
    total_volume: number;
    price_change_24h: number;
    description?: string;
    image?: {
      thumb: string;
      small: string;
      large: string;
    } | null;
  }[];
}

interface GPTCoinRecommendation {
  id: string;
  name: string;
  symbol: string;
  position_type: "long" | "short";
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  reasoning: string;
  base_contract: string | null;
  current_price: number;
  price_change_24h: number;
  image: {
    thumb: string;
    small: string;
    large: string;
  } | null;
}

async function getGPTRecommendations(
  userData: {
    risk_tolerance: string;
    crypto_experience: number;
  },
  coins: any[]
): Promise<GPTCoinRecommendation[]> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const simplifiedCoins = coins.map((coin) => ({
    id: coin.id,
    symbol: coin.symbol,
    price: coin.current_price,
    market_cap: coin.market_cap,
    change_24h: coin.price_change_24h,
  }));

  const prompt = `As a crypto trading expert, analyze these coins and provide EXACTLY 25 trading recommendations based on:
- Risk tolerance: ${userData.risk_tolerance}
- Trading experience: ${userData.crypto_experience} years

Requirements:
1. You MUST provide exactly 25 recommendations
2. Include a mix of long and short positions
3. Adjust risk parameters based on user's risk tolerance:
   - Low risk: Stop loss 2-5%, Take profit 5-15%
   - Medium risk: Stop loss 5-10%, Take profit 15-30%
   - High risk: Stop loss 10-15%, Take profit 30-50%

Current market data: ${JSON.stringify(simplifiedCoins)}

Return ONLY a valid JSON array with exactly 25 items using this structure:
recommendations: [
  "id": "coin-id",
  "name": "Coin Name",
  "symbol": "SYMBOL",
  "position_type": "long/short",
  "entry_price": number,
  "stop_loss": number,
  "take_profit": number,
  "reasoning": "brief explanation"
}]`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [
      {
        role: "system",
        content:
          "You are a crypto trading expert. You MUST return exactly 25 recommendations in valid JSON format.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" }, // Ensure JSON response
  });

  const gptResponse = JSON.parse(response.choices[0].message?.content || "{}");
  const recommendations = gptResponse.recommendations || [];

  console.log(recommendations);

  // Validate recommendation count
  if (recommendations.length < 15) {
    console.warn(
      `GPT returned only ${recommendations.length} recommendations, retrying...`
    );
    // Retry once if we don't get enough recommendations
    return getGPTRecommendations(userData, coins);
  }

  return recommendations;
}

// Add this helper function to sort and filter coins based on risk tolerance
function getFilteredCoins(
  coins: MemeCoinsData["coins"],
  riskTolerance: string
): any[] {
  // Filter out coins with null or 0 market cap
  const validCoins = coins.filter(
    (coin) =>
      coin.market_cap &&
      coin.market_cap > 0 &&
      coin.current_price &&
      coin.price_change_24h !== null
  );

  // Sort coins by market cap
  const sortedCoins = validCoins.sort((a, b) => b.market_cap - a.market_cap);

  // Get appropriate coins based on risk tolerance
  switch (riskTolerance.toLowerCase()) {
    case "high":
      // For high risk: Get bottom 50 coins by market cap with valid data
      return sortedCoins.slice(Math.max(sortedCoins.length - 50, 0));

    case "medium":
      // For medium risk: Get coins from middle range
      const midPoint = Math.floor(sortedCoins.length / 2);
      return sortedCoins.slice(
        Math.max(midPoint - 25, 0),
        Math.min(midPoint + 25, sortedCoins.length)
      );

    case "low":
      // For low risk: Get top 50 coins by market cap
      return sortedCoins.slice(0, 50);

    default:
      return sortedCoins.slice(0, 50);
  }
}

// Add this function to enrich GPT recommendations with additional data
function enrichRecommendations(
  recommendations: GPTCoinRecommendation[],
  allCoins: MemeCoinsData["coins"]
): GPTCoinRecommendation[] {
  return recommendations.map((recommendation) => {
    // Find matching coin from meme_coins.json
    const coinData = allCoins.find(
      (coin) =>
        coin.id.toLowerCase() === recommendation.id.toLowerCase() ||
        coin.symbol.toLowerCase() === recommendation.symbol.toLowerCase()
    );

    if (coinData) {
      return {
        ...recommendation,
        base_contract: coinData.base_contract,
        current_price: coinData.current_price,
        price_change_24h: coinData.price_change_24h,
        image: coinData.image || null,
        // Ensure we use the official name and symbol from our data
        name: coinData.name,
        symbol: coinData.symbol,
      };
    }

    // If no matching coin found, return original recommendation with null values
    return {
      ...recommendation,
      base_contract: null,
      current_price: 0,
      price_change_24h: 0,
      image: null,
    };
  });
}

const getSwipeCards = async (email: string) => {
  try {
    // 1. Get user data
    const [user] = await getUserByEmail(email);
    if (!user) {
      return {
        data: null,
        message: "User not found",
        error: "User not found",
      };
    }

    // 2. Get meme coins data from database
    const coins = await db.select().from(memeCoinsTable).execute();

    // Transform database results to match MemeCoinsData interface
    const transformedCoins = coins.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      base_contract: coin.base_contract,
      current_price: Number(coin.current_price), // Convert from numeric to number
      market_cap: Number(coin.market_cap),
      total_volume: Number(coin.total_volume),
      price_change_24h: coin.price_change_24h
        ? Number(coin.price_change_24h)
        : 0,
      description: coin.description || undefined,
      image: coin.image_thumb
        ? {
            thumb: coin.image_thumb,
            small: coin.image_small || coin.image_thumb,
            large: coin.image_large || coin.image_thumb,
          }
        : null,
    }));

    // 3. Get filtered coins based on risk tolerance
    const filteredCoins = getFilteredCoins(
      transformedCoins,
      user.riskTolerance
    );

    // 4. Map only required fields for GPT analysis
    const preparedCoins = filteredCoins.map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      market_cap: coin.market_cap,
      price_change_24h: coin.price_change_24h,
      current_price: coin.current_price,
      description: coin.description || "",
    }));

    // 5. Get GPT recommendations
    const gptRecommendations = await getGPTRecommendations(
      {
        risk_tolerance: user.riskTolerance,
        crypto_experience: user.cryptoExp,
      },
      preparedCoins
    );

    // Enrich recommendations with additional data
    const enrichedRecommendations = enrichRecommendations(
      gptRecommendations,
      transformedCoins
    );

    return {
      data: {
        coins: enrichedRecommendations,
        user_preferences: {
          risk_tolerance: user.riskTolerance,
          crypto_experience: user.cryptoExp,
        },
      },
      message: "Swipe cards fetched successfully",
      error: null,
    };
  } catch (error) {
    console.error("Error in getSwipeCards:", error);
    return {
      data: null,
      message: "Failed to fetch swipe cards",
      error: error,
    };
  }
};

export default getSwipeCards;
