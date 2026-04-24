// Lemon Squeezy placeholder checkout URLs.
// Replace these with real product checkout links once the LS store is live.
export const CHECKOUT_URLS = {
  starter: "https://checkout.lemonsqueezy.com/buy/placeholder-starter-9",
  pro: "https://checkout.lemonsqueezy.com/buy/placeholder-pro-29",
  agency: "https://checkout.lemonsqueezy.com/buy/placeholder-agency-99",
} as const;

export type PlanKey = keyof typeof CHECKOUT_URLS;

export const PLAN_LABELS: Record<PlanKey, string> = {
  starter: "Starter — $9 for 10 rescue packs",
  pro: "Pro — $29/mo for 100 rescue packs",
  agency: "Agency Beta — $99/mo for 500 rescue packs",
};
