import { CoinGeckoClient } from "coingecko-api-v3";

const geckoClient = new CoinGeckoClient({
  timeout: 10000,
  autoRetry: true,
});

export default geckoClient;
