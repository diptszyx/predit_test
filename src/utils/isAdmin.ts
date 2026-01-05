import { ADMIN_EMAILS } from "../constants/admin";
import { User } from "../lib/types";

export const checkIsAdmin = (user?: User | null) => {
  if (!user) return false;

  return user.email ? ADMIN_EMAILS.includes(user.email) : false;
};
