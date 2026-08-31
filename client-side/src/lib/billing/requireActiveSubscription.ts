import { getCurrentStore } from "@/lib/store/getCurrentStore";

export async function requireActiveSubscription(userId?: string) {
  const store = await getCurrentStore(userId);
  if (!store) {
    return { hasAccess: false, status: "NO_STORE", redirectUrl: "/onboarding/store" };
  }

  const sub = store.subscription;
  if (!sub) {
    return { hasAccess: false, status: "NO_SUBSCRIPTION", redirectUrl: "/onboarding/plan" };
  }

  if (sub.status === "EXPIRED") {
    return {
      hasAccess: false,
      isReadOnly: true,
      status: "EXPIRED",
      redirectUrl: "/admin/billing",
      message: "Your subscription has expired. Renew your plan to continue managing and publishing your store.",
    };
  }

  return {
    hasAccess: true,
    isReadOnly: false,
    status: sub.status,
    plan: sub.plan,
    redirectUrl: null,
  };
}
