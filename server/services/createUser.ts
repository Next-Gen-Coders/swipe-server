import { db } from "../db";
import { UserSelectSchema, usersTable } from "../db/schema/user";
import { UserInsertSchema } from "../db/zodSchemaAndTypes";
import { createUser as createUserQuery } from "../db/queries/users";
import { createUserWallet } from "./createWallet";

export const createUser = async (
  userDetails: UserInsertSchema
): Promise<{
  data: UserSelectSchema | null | any;
  message: string;
  error: any;
}> => {
  if (
    !userDetails.email ||
    !userDetails.name ||
    !userDetails.cryptoExp ||
    !userDetails.riskTolerance
  ) {
    return {
      data: null,
      message: "Missing required fields",
      error: "Missing required fields",
    };
  }

  try {
    const [user] = await createUserQuery(userDetails);

    if (!user) {
      throw new Error("Failed to create user");
    }

    const createdUserWallet = await createUserWallet(user.uid);
    console.log("createdUserWallet", createdUserWallet);

    const userAddress = createdUserWallet.address;

    return {
      data: { ...user, address: userAddress },
      message: "User created successfully",
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      message: "Failed to create user",
      error: error,
    };
  }
};

export default createUser;
