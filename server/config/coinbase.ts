import { Coinbase } from "@coinbase/coinbase-sdk";

const apiKeyName = process.env.COINBASE_API_KEY_NAME || "";

const privateKey = process.env.COINBASE_PRIVATE_KEY || "";

if (!apiKeyName || !privateKey) {
  throw new Error(
    "COINBASE_API_KEY_NAME and COINBASE_PRIVATE_KEY are required"
  );
}

Coinbase.configure({
  apiKeyName: apiKeyName,
  privateKey: privateKey,
});
