import { env } from "@/lib/env";

type QueryParams = Record<string, string | number | boolean>;

async function fetchFromSanity<T>(query: string, params?: QueryParams): Promise<T> {
  const searchParams = new URLSearchParams({ query });

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      searchParams.set(`$${key}`, JSON.stringify(value));
    }
  }

  const url = `https://${env.sanityProjectId}.api.sanity.io/v${env.sanityApiVersion}/data/query/${env.sanityDataset}?${searchParams.toString()}`;
  const response = await fetch(url, {
    next: { revalidate: 120 },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error("Sanity query failed");
  }

  const json = await response.json();
  return json.result as T;
}

export const sanityClient = {
  fetch: fetchFromSanity,
};
