import { getUserByEmail as getUserByEmailQuery } from "../db/queries/users";
import { UserSelectSchema } from "../db/schema/user";

export const getUserByEmail = async (
  email: string
): Promise<{
  data: UserSelectSchema | null;
  message: string;
  error: any;
}> => {
  if (!email) {
    return {
      data: null,
      message: "Email is required",
      error: "Email is required",
    };
  }

  try {
    const [user] = await getUserByEmailQuery(email);
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

export default getUserByEmail;
