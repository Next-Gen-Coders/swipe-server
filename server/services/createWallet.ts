import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import { db } from "../db";
import { walletsTable } from "../db/schema/wallet";
import { WalletInsertSchema } from "../db/schema/wallet";

export async function createUserWallet(userId: any) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Create wallet with specific network
    const wallet = await Wallet.create({
      networkId: Coinbase.networks.BaseSepolia,
    });

    console.log("wallet", wallet.getId());
    const addresses = await wallet.listAddresses();
    console.log("addresses", addresses[0].getId());


    const walletData = wallet.export();

    const [newWallet] = await db
      .insert(walletsTable)
      .values({
        userId: userId,
        address: addresses[0].getId(),
        wallet_id: wallet.getId()!,
        wallet_data: JSON.stringify(walletData),
        network_id: Coinbase.networks.BaseSepolia,
      })
      .returning();

    return newWallet;
  } catch (error) {
    console.error("Error creating wallet:", error);
    throw error;
  }
}

export async function createWallet(data: WalletInsertSchema) {
  try {
    await db.insert(walletsTable).values({
      ...data,
    });
  } catch (error) {
    console.error("Error creating wallet:", error);
    throw error;
  }
}
