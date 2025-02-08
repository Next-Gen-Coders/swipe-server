import { db } from "../db";
import { UserSelectSchema, usersTable } from "../db/schema/user";
import { UserInsertSchema } from "../db/zodSchemaAndTypes";
import { createUser as createUserQuery } from "../db/queries/users";
export const createUser = async (
  userDetails: UserInsertSchema
): Promise<{
  data: UserSelectSchema | null;
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

    return {
      data: user,
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
