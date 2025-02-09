const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");
import dotenv from "dotenv";

dotenv.config();

const DATA_DIR = "./data";
const DATA_FILE = "meme_coins.json";
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

// Add logging utility
const log = {
  info: (msg, data) =>
    console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`, data ? data : ""),
  error: (msg, err) =>
    console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`, err ? err : ""),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
};

const api = axios.create({
  headers: {
    "x-cg-demo-api-key": COINGECKO_API_KEY,
  },
  baseURL: "https://api.coingecko.com/api/v3",
});

const getTokenImage = async (coin) => {
  // Sources array with different image APIs
  const sources = [
    // 1. CoinGecko
    async () => {
      const response = await api.get(`/coins/${coin.id}`);
      return response.data.image?.large;
    },
    // 2. Trust Wallet Assets
    async () => {
      return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${coin.base_contract}/logo.png`;
    },
    // 3. CryptoLogos
    async () => {
      return `https://cryptologos.cc/logos/${
        coin.id
      }-${coin.symbol.toLowerCase()}-logo.png`;
    },
    // 4. CoinMarketCap (requires API key)
    async () => {
      return `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`;
    },
  ];

  // Try each source until we get a valid image
  for (const getImage of sources) {
    try {
      const imageUrl = await getImage();
      // Verify if image exists
      const imageExists = await fetch(imageUrl, { method: "HEAD" })
        .then((res) => res.ok)
        .catch(() => false);

      if (imageExists) return imageUrl;
    } catch (error) {
      continue;
    }
  }

  // Default fallback image
  return null;
};

async function getCoinsWithImages() {
  try {
    const filePath = path.join(DATA_DIR, DATA_FILE);
    const rawData = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(rawData);

    for (const coin of data.coins) {
      try {
        const imageUrl = await getTokenImage(coin);
        coin.image = {
          thumb: imageUrl,
          small: imageUrl,
          large: imageUrl,
        };
        log.success(`Updated image for ${coin.name}`);
      } catch (error) {
        log.error(`Failed to get image for ${coin.name}`, error);
      }
      // Rate limiting delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    log.success("Completed updating coin images");
  } catch (error) {
    log.error("Failed to update coin images:", error);
  }
}

// Execute the update
log.info("Starting image fetch process...");
getCoinsWithImages()
  .then(() => log.success("Process completed successfully"))
  .catch((err) => log.error("Process failed:", err));
