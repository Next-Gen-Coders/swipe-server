import { updateUser as updateUserQuery } from "../db/queries/users";
import { UserSelectSchema, UserUpdateSchema } from "../db/schema/user";

export const updateUser = async (
  userDetails: UserUpdateSchema
): Promise<{
  data: UserSelectSchema | null;
  message: string;
  error: any;
}> => {
  if (!userDetails.uid) {
    return {
      data: null,
      message: "Missing required fields",
      error: "Missing required fields",
    };
  }

  try {

    const [user] = await updateUserQuery(userDetails.uid, userDetails);
    
    return {
      data: user,
      message: "User updated successfully",
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      message: "Failed to update user",
      error: error,
    };
  }
};

export default updateUser;
