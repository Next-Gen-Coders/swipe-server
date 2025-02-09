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
2. only give long  positions
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
  console.log("getSwipeCards called");

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

    return {
      data: {
        coins: [
          {
            id: "ski-mask-cat",
            name: "SKI MASK CAT",
            symbol: "skicat",
            position_type: "long",
            entry_price: 0.00330197,
            stop_loss: 0.0004953,
            take_profit: 0.004952,
            reasoning: "Positive 24h change and potential for further upside",
            base_contract: "0xa6f774051dfb6b54869227fda2df9cb46f296c09",
            current_price: 0.00330197,
            price_change_24h: 21.98184,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/52355/large/logo200x.png?1733168346",
              small:
                "https://coin-images.coingecko.com/coins/images/52355/large/logo200x.png?1733168346",
              large:
                "https://coin-images.coingecko.com/coins/images/52355/large/logo200x.png?1733168346",
            },
          },
          {
            id: "coinye-west",
            name: "Coinye West",
            symbol: "coinye",
            position_type: "long",
            entry_price: 0.00229431,
            stop_loss: 0.0003441,
            take_profit: 0.003441,
            reasoning: "Significant 24h change and strong market cap",
            base_contract: "0x0028e1e60167b48a938b785aa5292917e7eaca8b",
            current_price: 0.00229431,
            price_change_24h: 71.95986,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/36403/large/Coinye_West.png?1711369153",
              small:
                "https://coin-images.coingecko.com/coins/images/36403/large/Coinye_West.png?1711369153",
              large:
                "https://coin-images.coingecko.com/coins/images/36403/large/Coinye_West.png?1711369153",
            },
          },
          {
            id: "floppa-cat",
            name: "Floppa Cat",
            symbol: "floppa",
            position_type: "long",
            entry_price: 0.00340639,
            stop_loss: 0.0005109,
            take_profit: 0.005109,
            reasoning:
              "Notable 24h change and potential for continued positive movement",
            base_contract: "0x776aaef8d8760129a0398cf8674ee28cefc0eab9",
            current_price: 0.00340639,
            price_change_24h: 15.50228,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/3696 9/large/floppa.jpg?1722771377",
              small:
                "https://coin-images.coingecko.com/coins/images/36969/large/floppa.jpg?1722771377",
              large:
                "https://coin-images.coingecko.com/coins/images/36969/large/floppa.jpg?1722771377",
            },
          },
          {
            id: "tn100x",
            name: "TN100x",
            symbol: "tn100x",
            position_type: "long",
            entry_price: 0.00043727,
            stop_loss: 0.0000656,
            take_profit: 0.000656,
            reasoning: "Strong 24h change with potential for further growth",
            base_contract: "0x5b5dee44552546ecea05edea01dcd7be7aa6144a",
            current_price: 0.00043727,
            price_change_24h: 16.58432,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/35729/large/patch-transparent-blue.png?1729878068",
              small:
                "https://coin-images.coingecko.com/coins/images/35729/large/patch-transparent-blue.png?1729878068",
              large:
                "https://coin-images.coingecko.com/coins/images/35729/large/patch-transparent-blue.png?1729878068",
            },
          },
          {
            id: "normilio",
            name: "Normilio",
            symbol: "normilio",
            position_type: "long",
            entry_price: 0.00191448,
            stop_loss: 0.0002872,
            take_profit: 0.002872,
            reasoning:
              "Positive 24h change and potential for sustained positive movement",
            base_contract: "0xcde90558fc317c69580deeaf3efc509428df9080",
            current_price: 0.00191448,
            price_change_24h: 8.24382,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/36915/large/vm2byD93.jpg?1733436102",
              small:
                "https://coin-images.coingecko.com/coins/images/36915/large/vm2byD93.jpg?1733436102",
              large:
                "https://coin-images.coingecko.com/coins/images/36915/large/vm2byD93.jpg?1733436102",
            },
          },
          {
            id: "skull-of-pepe-token",
            name: "Skull of Pepe Token",
            symbol: "skop",
            position_type: "long",
            entry_price: 0.01305805,
            stop_loss: 0.0019587,
            take_profit: 0.019587,
            reasoning: "Reasonable 24h change and potential for further upside",
            base_contract: "0x6d3b8c76c5396642960243febf736c6be8b60562",
            current_price: 0.01305805,
            price_change_24h: -4.37737,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/38342/large/skop.jpeg?1717141011",
              small:
                "https://coin-images.coingecko.com/coins/images/38342/large/skop.jpeg?1717141011",
              large:
                "https://coin-images.coingecko.com/coins/images/38342/large/skop.jpeg?1717141011",
            },
          },
          {
            id: "poncho",
            name: "Poncho",
            symbol: "poncho",
            position_type: "long",
            entry_price: 0.07352,
            stop_loss: 0.01103,
            take_profit: 0.1103,
            reasoning: "Notable 24h change and solid market cap",
            base_contract: "0xc2fe011c3885277c7f0e7ffd45ff90cadc8ecd12",
            current_price: 0.07352,
            price_change_24h: 7.98741,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/36160/large/ponchologo.PNG?1710744293",
              small:
                "https://coin-images.coingecko.com/coins/images/36160/large/ponchologo.PNG?1710744293",
              large:
                "https://coin-images.coingecko.com/coins/images/36160/large/ponchologo.PNG?1710744293",
            },
          },
          {
            id: "briun-armstrung",
            name: "Briun Armstrung",
            symbol: "briun",
            position_type: "long",
            entry_price: 0.00093831,
            stop_loss: 0.0001407,
            take_profit: 0.001407,
            reasoning: "Positive 24h change and potential for sustained growth",
            base_contract: "0x8c81b4c816d66d36c4bf348bdec01dbcbc70e987",
            current_price: 0.00093831,
            price_change_24h: 7.3419,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/36183/large/200x200.png?1710758416",
              small:
                "https://coin-images.coingecko.com/coins/images/36183/large/200x200.png?1710758416",
              large:
                "https://coin-images.coingecko.com/coins/images/36183/large/200x200.png?1710758416",
            },
          },
          {
            id: "kogin-by-virtuals",
            name: "Kogin by Virtuals",
            symbol: "kogin",
            position_type: "long",
            entry_price: 0.00020836,
            stop_loss: 0.0000312,
            take_profit: 0.000312,
            reasoning: "Strong 24h change with potential for further upside",
            base_contract: "0x2941d526e22406c5d6f273e281899cfc042a7332",
            current_price: 0.00020836,
            price_change_24h: 10.07731,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/52787/large/OIG4.png?1734291387",
              small:
                "https://coin-images.coingecko.com/coins/images/52787/large/OIG4.png?1734291387",
              large:
                "https://coin-images.coingecko.com/coins/images/52787/large/OIG4.png?1734291387",
            },
          },
          {
            id: "agent-doge-by-virtuals",
            name: "AGENT DOGE by Virtuals",
            symbol: "aidoge",
            position_type: "long",
            entry_price: 0.0001668,
            stop_loss: 0.000025,
            take_profit: 0.00025,
            reasoning:
              "Notable 24h change and potential for sustained positive movement",
            base_contract: "0xb34457736aa191ff423f84f5d669f68b231e6c4e",
            current_price: 0.0001668,
            price_change_24h: 11.20058,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/52187/large/Screenshot_2024-11-23_at_4.09.40%E2%80%AFPM.png?1732723139",
              small:
                "https://coin-images.coingecko.com/coins/images/52187/large/Screenshot_2024-11-23_at_4.09.40%E2%80%AFPM.png?1732723139",
              large:
                "https://coin-images.coingecko.com/coins/images/52187/large/Screenshot_2024-11-23_at_4.09.40%E2%80%AFPM.png?1732723139",
            },
          },
          {
            id: "le-bleu-elefant",
            name: "Le Bleu Elefant",
            symbol: "bleu",
            position_type: "long",
            entry_price: 0.0002602,
            stop_loss: 0.000039,
            take_profit: 0.00039,
            reasoning: "Positive 24h change and solid market cap",
            base_contract: "0xbf4db8b7a679f89ef38125d5f84dd1446af2ea3b",
            current_price: 0.0002602,
            price_change_24h: 1.89467,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/37811/large/b.png?1715597915",
              small:
                "https://coin-images.coingecko.com/coins/images/37811/large/b.png?1715597915",
              large:
                "https://coin-images.coingecko.com/coins/images/37811/large/b.png?1715597915",
            },
          },
          {
            id: "mfercoin",
            name: "mfercoin",
            symbol: "mfer",
            position_type: "long",
            entry_price: 0.01159615,
            stop_loss: 0.0017394,
            take_profit: 0.017394,
            reasoning: "Reasonable 24h change and potential for further upside",
            base_contract: "0xe3086852a4b125803c815a158249ae468a3254ca",
            current_price: 0.01159615,
            price_change_24h: -0.82291,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/36550/large/mfercoin-logo.png?1711876821",
              small:
                "https://coin-images.coingecko.com/coins/images/36550/large/mfercoin-logo.png?1711876821",
              large:
                "https://coin-images.coingecko.com/coins/images/36550/large/mfercoin-logo.png?1711876821",
            },
          },
          {
            id: "prefrontal-cortex-convo-agent-by-virtuals",
            name: "Prefrontal Cortex Convo Agent by Virtuals",
            symbol: "convo",
            position_type: "long",
            entry_price: 0.0094375,
            stop_loss: 0.0014156,
            take_profit: 0.014156,
            reasoning: "Positive 24h change and potential for sustained growth",
            base_contract: "0xab964f7b7b6391bd6c4e8512ef00d01f255d9c0d",
            current_price: 0.0094375,
            price_change_24h: 13.24804,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/51064/large/Convo_Agent_89ef084f87.jpg?1729926154",
              small:
                "https://coin-images.coingecko.com/coins/images/51064/large/Convo_Agent_89ef084f87.jpg?1729926154",
              large:
                "https://coin-images.coingecko.com/coins/images/51064/large/Convo_Agent_89ef084f87.jpg?1729926154",
            },
          },
          {
            id: "gluteus-maximus-by-virtuals",
            name: "Gluteus Maximus by Virtuals",
            symbol: "gluteu",
            position_type: "long",
            entry_price: 0.00357979,
            stop_loss: 0.000536,
            take_profit: 0.00536,
            reasoning:
              "Reasonable 24h change and potential for sustained positive movement",
            base_contract: "0x06a63c498ef95ad1fa4fff841955e512b4b2198a",
            current_price: 0.00357979,
            price_change_24h: 11.13297,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/52177/large/gluteu.jpg?1732685854",
              small:
                "https://coin-images.coingecko.com/coins/images/52177/large/gluteu.jpg?1732685854",
              large:
                "https://coin-images.coingecko.com/coins/images/52177/large/gluteu.jpg?1732685854",
            },
          },
          {
            id: "help",
            name: "Help",
            symbol: "help",
            position_type: "long",
            entry_price: 21.74,
            stop_loss: 3.261,
            take_profit: 32.61,
            reasoning: "Notable 24h change and strong market cap",
            base_contract: "0x1c9f5e5b5c172955660c11ec0df65b68ecb5fb69",
            current_price: 21.74,
            price_change_24h: 2.48939,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/51165/large/help.png?1731654094",
              small:
                "https://coin-images.coingecko.com/coins/images/51165/large/help.png?1731654094",
              large:
                "https://coin-images.coingecko.com/coins/images/51165/large/help.png?1731654094",
            },
          },
          {
            id: "blockchainpeople",
            name: "BlockChainPeople",
            symbol: "bcp",
            position_type: "long",
            entry_price: 0.00508636,
            stop_loss: 0.0007629,
            take_profit: 0.007629,
            reasoning:
              "Positive 24h change and potential for continued positive movement",
            base_contract: "0x87c211144b1d9bdaa5a791b8099ea4123dc31d21",
            current_price: 0.00508636,
            price_change_24h: 4.42075,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/38085/large/200x200.png?1716477512",
              small:
                "https://coin-images.coingecko.com/coins/images/38085/large/200x200.png?1716477512",
              large:
                "https://coin-images.coingecko.com/coins/images/38085/large/200x200.png?1716477512",
            },
          },
          {
            id: "russell",
            name: "RUSSELL",
            symbol: "russell",
            position_type: "long",
            entry_price: 0.00336372,
            stop_loss: 0.0005046,
            take_profit: 0.005046,
            reasoning: "Positive 24h change and potential for further upside",
            base_contract: "0x0c5142bc58f9a61ab8c3d2085dd2f4e550c5ce0b",
            current_price: 0.00336372,
            price_change_24h: 6.31151,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/50690/large/russelllogo.png?1730010143",
              small:
                "https://coin-images.coingecko.com/coins/images/50690/large/russelllogo.png?1730010143",
              large:
                "https://coin-images.coingecko.com/coins/images/50690/large/russelllogo.png?1730010143",
            },
          },
          {
            id: "normie-2",
            name: "NORMIE",
            symbol: "normie",
            position_type: "long",
            entry_price: 0.00334442,
            stop_loss: 0.0005017,
            take_profit: 0.005017,
            reasoning:
              "Reasonable 24h change and potential for sustained growth",
            base_contract: "0x47b464edb8dc9bc67b5cd4c9310bb87b773845bd",
            current_price: 0.00334442,
            price_change_24h: -1.01721,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/35880/large/NORMIEsite.png?1709983341",
              small:
                "https://coin-images.coingecko.com/coins/images/35880/large/NORMIEsite.png?1709983341",
              large:
                "https://coin-images.coingecko.com/coins/images/35880/large/NORMIEsite.png?1709983341",
            },
          },
          {
            id: "ai-inu",
            name: "AI INU",
            symbol: "aiinu",
            position_type: "long",
            entry_price: 0.0063755,
            stop_loss: 0.0009563,
            take_profit: 0.009563,
            reasoning: "Notable 24h change and solid market cap",
            base_contract: "0x8853f0c059c27527d33d02378e5e4f6d5afb574a",
            current_price: 0.0063755,
            price_change_24h: 1.68029,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/36902/large/aiinu.png?1712699681",
              small:
                "https://coin-images.coingecko.com/coins/images/36902/large/aiinu.png?1712699681",
              large:
                "https://coin-images.coingecko.com/coins/images/36902/large/aiinu.png?1712699681",
            },
          },
          {
            id: "barry-the-badger",
            name: "Barry the badger",
            symbol: "barry",
            position_type: "long",
            entry_price: 0.00095597,
            stop_loss: 0.0001434,
            take_profit: 0.001434,
            reasoning:
              "Positive 24h change and potential for continued positive movement",
            base_contract: "0xf09034487c84954d49ae04bf6817148ffc2edb83",
            current_price: 0.00095597,
            price_change_24h: 4.94701,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/53144/large/IMG_4596.jpeg?1735377862",
              small:
                "https://coin-images.coingecko.com/coins/images/53144/large/IMG_4596.jpeg?1735377862",
              large:
                "https://coin-images.coingecko.com/coins/images/53144/large/IMG_4596.jpeg?1735377862",
            },
          },
          {
            id: "wassie",
            name: "WASSIE",
            symbol: "wassie",
            position_type: "long",
            entry_price: 0.00000226,
            stop_loss: 3.39e-7,
            take_profit: 0.00000339,
            reasoning:
              "Reasonable 24h change and potential for sustained growth",
            base_contract: "0xa067436db77ab18b1a315095e4b816791609897c",
            current_price: 0.00000226,
            price_change_24h: 1.18294,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/30144/large/logo-coingecko.png?1696529065",
              small:
                "https://coin-images.coingecko.com/coins/images/30144/large/logo-coingecko.png?1696529065",
              large:
                "https://coin-images.coingecko.com/coins/images/30144/large/logo-coingecko.png?1696529065",
            },
          },
          {
            id: "condo",
            name: "CONDO",
            symbol: "condo",
            position_type: "long",
            entry_price: 0.00012669,
            stop_loss: 0.000019,
            take_profit: 0.00019,
            reasoning: "Positive 24h change and potential for further upside",
            base_contract: "0x30d19fb77c3ee5cfa97f73d72c6a1e509fa06aef",
            current_price: 0.00012669,
            price_change_24h: 2.41623,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/37174/large/1000012387.jpg?1724589415",
              small:
                "https://coin-images.coingecko.com/coins/images/37174/large/1000012387.jpg?1724589415",
              large:
                "https://coin-images.coingecko.com/coins/images/37174/large/1000012387.jpg?1724589415",
            },
          },
          {
            id: "roost",
            name: "Roost",
            symbol: "roost",
            position_type: "long",
            entry_price: 0.00100173,
            stop_loss: 0.0001503,
            take_profit: 0.001503,
            reasoning:
              "Notable 24h change and potential for continued positive movement",
            base_contract: "0xed899bfdb28c8ad65307fa40f4acab113ae2e14c",
            current_price: 0.00100173,
            price_change_24h: -3.04683,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/36458/large/roost.jpeg?1711493580",
              small:
                "https://coin-images.coingecko.com/coins/images/36458/large/roost.jpeg?1711493580",
              large:
                "https://coin-images.coingecko.com/coins/images/36458/large/roost.jpeg?1711493580",
            },
          },
          {
            id: "brett-2-0",
            name: "Brett 2.0",
            symbol: "brett2.0",
            position_type: "long",
            entry_price: 0.0001509,
            stop_loss: 0.0000226,
            take_profit: 0.000226,
            reasoning: "Positive 24h change and potential for sustained growth",
            base_contract: "0x885129e35d247b01c4485ef6b48564d0ebc8c362",
            current_price: 0.0001509,
            price_change_24h: -18.99201,
            image: {
              thumb:
                "https://coin-images.coingecko.com/coins/images/37121/large/brett200-modified.png?1713366621",
              small:
                "https://coin-images.coingecko.com/coins/images/37121/large/brett200-modified.png?1713366621",
              large:
                "https://coin-images.coingecko.com/coins/images/37121/large/brett200-modified.png?1713366621",
            },
          },
        ],
        user_preferences: {
          risk_tolerance: "high",
          crypto_experience: 7,
        },
      },
      message: "Swipe cards fetched successfully",
      error: null,
    };

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
