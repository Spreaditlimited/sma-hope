export const amazonMarketplaces = {
  GB: { country: "United Kingdom", name: "Amazon UK", host: "www.amazon.co.uk" },
  CA: { country: "Canada", name: "Amazon Canada", host: "www.amazon.ca" },
  US: { country: "United States", name: "Amazon US", host: "www.amazon.com" },
} as const;

export type AmazonMarket = keyof typeof amazonMarketplaces;

function supportedMarket(value: string | null | undefined): AmazonMarket | undefined {
  switch (value?.toUpperCase()) {
    case "GB": return "GB";
    case "CA": return "CA";
    case "US": return "US";
    default: return undefined;
  }
}

export function resolveAmazonMarket(country: string | null, requested?: string): AmazonMarket {
  return supportedMarket(requested) ?? supportedMarket(country) ?? "US";
}

export function amazonEditionUrl(asin: string, market: AmazonMarket): string {
  if (!/^[A-Z0-9]{10}$/.test(asin)) throw new Error("Invalid Amazon edition identifier");
  return `https://${amazonMarketplaces[market].host}/dp/${asin}`;
}
