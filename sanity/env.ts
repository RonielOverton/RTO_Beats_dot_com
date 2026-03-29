const fallbackApiVersion = "2026-03-29";
const sanityProjectIdPattern = /^[a-z0-9-]+$/;

export const sanityEnv = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? fallbackApiVersion,
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: process.env.NODE_ENV === "production",
};

export const missingSanityEnvVars = [
  ["NEXT_PUBLIC_SANITY_PROJECT_ID", sanityEnv.projectId],
  ["NEXT_PUBLIC_SANITY_DATASET", sanityEnv.dataset],
  ["NEXT_PUBLIC_SANITY_API_VERSION", sanityEnv.apiVersion],
].filter(([, value]) => !value).map(([key]) => key);

export const invalidSanityEnvVars = [
  !sanityEnv.projectId || sanityProjectIdPattern.test(sanityEnv.projectId)
    ? null
    : "NEXT_PUBLIC_SANITY_PROJECT_ID",
].filter(Boolean) as string[];

export const isSanityConfigured =
  missingSanityEnvVars.length === 0 && invalidSanityEnvVars.length === 0;

export function assertSanityEnv() {
  if (missingSanityEnvVars.length > 0) {
    throw new Error(
      `Missing required Sanity environment variables: ${missingSanityEnvVars.join(", ")}`
    );
  }

  if (invalidSanityEnvVars.length > 0) {
    throw new Error(
      `Invalid Sanity environment variables: ${invalidSanityEnvVars.join(", ")}. NEXT_PUBLIC_SANITY_PROJECT_ID must contain only a-z, 0-9, and dashes.`
    );
  }
}
