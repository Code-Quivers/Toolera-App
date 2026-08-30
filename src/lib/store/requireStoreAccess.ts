import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getCurrentStore } from "@/lib/store/getCurrentStore";

export async function requireStoreAccess(requestedUserId?: string) {
  const user = await getCurrentUser(requestedUserId);
  if (!user) {
    throw new Error("UNAUTHORIZED: Please sign in to access store.");
  }

  const store = await getCurrentStore(user.id);
  if (!store) {
    return { user, store: null, redirectUrl: "/onboarding/store" };
  }

  return { user, store, redirectUrl: null };
}
