import "server-only";
import { createClient } from "@sanity/client";
import { assertSanityEnv, isSanityConfigured, sanityEnv } from "@/sanity/env";

export const sanityClient = isSanityConfigured
  ? createClient({
      projectId: sanityEnv.projectId,
      dataset: sanityEnv.dataset,
      apiVersion: sanityEnv.apiVersion,
      useCdn: sanityEnv.useCdn,
      token: sanityEnv.token,
      perspective: "published",
    })
  : null;

export async function sanityFetch<QueryResponse>({
  query,
  params = {},
  tags = [],
}: {
  query: string;
  params?: Record<string, string | number | boolean | string[] | undefined>;
  tags?: string[];
}): Promise<QueryResponse> {
  const client = sanityClient;

  if (!client || !isSanityConfigured) {
    assertSanityEnv();
    throw new Error("Sanity client is not configured");
  }

  return client.fetch<QueryResponse>(query, params, {
    next: {
      tags,
    },
  });
}
