import { db } from "../server/db";
import { memeCoinsTable } from "../server/db/schema/memeCoin";
import fs from "fs/promises";
import path from "path";

async function uploadMemeCoins() {
  try {
    // Read the JSON file
    const filePath = path.join(process.cwd(), "data", "meme_coins.json");
    const rawData = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(rawData);

    console.log(`Processing ${data.coins.length} meme coins...`);

    // Prepare the data for insertion
    const coinsData = data.coins.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      base_contract: coin.base_contract,
      current_price: coin.current_price,
      market_cap: coin.market_cap || 0,
      total_volume: coin.total_volume || 0,
      price_change_24h: coin.price_change_24h || null,
      description: coin.description || null,
      image_thumb: coin.image?.thumb || null,
      image_small: coin.image?.small || null,
      image_large: coin.image?.large || null,
      last_updated: coin.last_updated
        ? new Date(coin.last_updated)
        : new Date(),
    }));

    // Insert data in batches of 50
    const batchSize = 50;
    for (let i = 0; i < coinsData.length; i += batchSize) {
      const batch = coinsData.slice(i, i + batchSize);
      await db.insert(memeCoinsTable).values(batch);
      console.log(`Inserted batch ${i / batchSize + 1}...`);
    }

    console.log("Data upload completed successfully!");
  } catch (error) {
    console.error("Error uploading meme coins:", error);
    throw error;
  }
}

// Run the upload
uploadMemeCoins()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
