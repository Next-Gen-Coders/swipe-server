import { UserSelectSchema } from "../db/schema/user";
import { getUserByUid as getUserByUidQuery } from "../db/queries/users";

export const getUserById = async (
  id: string
): Promise<{
  data: UserSelectSchema | null;
  message: string;
  error: any;
}> => {
  if (!id) {
    return {
      data: null,
      message: "User ID is required",
      error: "User ID is required",
    };
  }

  try {
    const [user] = await getUserByUidQuery(id.toString());
    return {
      data: user,
      message: "User fetched successfully",
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      message: "Failed to fetch user",
      error: error,
    };
  }
};

export default getUserById;
