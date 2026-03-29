#!/usr/bin/env node

import { createClient } from "@sanity/client";

const HELP_TEXT = `
Import Bandcamp albums into Sanity.

Usage:
  npm run import:bandcamp -- <bandcamp-album-url> [more-urls...]

Options:
  --update    Update existing album docs matching slug or bandcampUrl
  --dry-run   Parse and map data without creating or updating docs
  --help      Show this help

Required environment variables:
  NEXT_PUBLIC_SANITY_PROJECT_ID
  NEXT_PUBLIC_SANITY_DATASET
  NEXT_PUBLIC_SANITY_API_VERSION
  SANITY_API_WRITE_TOKEN (preferred) or SANITY_API_READ_TOKEN
`;

const args = process.argv.slice(2);
const options = {
  update: false,
  dryRun: false,
};
const urls = [];

for (const arg of args) {
  if (arg === "--help" || arg === "-h") {
    console.log(HELP_TEXT.trim());
    process.exit(0);
  }
  if (arg === "--update") {
    options.update = true;
    continue;
  }
  if (arg === "--dry-run") {
    options.dryRun = true;
    continue;
  }
  urls.push(arg);
}

if (urls.length === 0) {
  console.error("No Bandcamp album URLs provided.\n");
  console.error(HELP_TEXT.trim());
  process.exit(1);
}

const projectId = cleanEnvValue(mustEnv("NEXT_PUBLIC_SANITY_PROJECT_ID"));
const dataset = cleanEnvValue(mustEnv("NEXT_PUBLIC_SANITY_DATASET", "production"));
const apiVersion = cleanEnvValue(mustEnv("NEXT_PUBLIC_SANITY_API_VERSION", "2026-03-29"));
const writeTokenRaw = process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_API_READ_TOKEN;
const writeToken = cleanEnvValue(writeTokenRaw ?? "");
const requiresWriteToken = !options.dryRun;

if (requiresWriteToken && !writeToken) {
  console.error(
    "Missing token. Set SANITY_API_WRITE_TOKEN (preferred) or SANITY_API_READ_TOKEN with write permissions."
  );
  process.exit(1);
}

if (writeToken && !process.env.SANITY_API_WRITE_TOKEN) {
  console.warn("Warning: using SANITY_API_READ_TOKEN fallback. Ensure this token has write permissions.");
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: writeToken || undefined,
  useCdn: false,
  perspective: "published",
});

let created = 0;
let updated = 0;
let skipped = 0;
let failed = 0;

for (const rawUrl of urls) {
  const albumUrl = normalizeUrl(rawUrl);
  if (!albumUrl) {
    console.error(`Invalid URL: ${rawUrl}`);
    failed += 1;
    continue;
  }

  try {
    const html = await fetchText(albumUrl);
    const parsed = extractBandcampAlbumData(html, albumUrl);

    if (!parsed.title) {
      throw new Error("Could not detect album title from page metadata.");
    }

    const slug = toSlug(parsed.slugCandidate || parsed.title);
    if (!slug) {
      throw new Error("Could not build a valid slug from the URL/title.");
    }

    const tracks = parsed.tracklist.length > 0
      ? parsed.tracklist
      : [{ _type: "track", trackNumber: 1, title: parsed.title, duration: "0:00", featuring: [] }];

    const releaseDate = toDateYYYYMMDD(parsed.releaseDate) || new Date().toISOString().slice(0, 10);
    const shortDescription = toShortDescription(parsed.description, parsed.title);
    const fullDescription = toPortableText(parsed.description || `${parsed.title} from Bandcamp.`);
    const genre = parsed.genre.length > 0 ? parsed.genre : ["Hip Hop"];

    let existing = null;
    const canCheckExisting = Boolean(writeToken) || !options.dryRun;
    if (canCheckExisting) {
      existing = await client.fetch(
        `*[_type == "album" && (slug.current == $slug || bandcampUrl == $bandcampUrl)][0]{_id, title}`,
        { slug, bandcampUrl: albumUrl }
      );
    }

    if (options.dryRun) {
      const existingNotice = canCheckExisting ? "" : " (existing-check skipped: no token)";
      const action = existing ? (options.update ? "would update" : "would skip") : "would create";
      console.log(`[dry-run] ${action}: ${parsed.title} (${albumUrl})${existingNotice}`);
      if (existing && !options.update) skipped += 1;
      if (existing && options.update) updated += 1;
      if (!existing) created += 1;
      continue;
    }

    const coverImageRef = await uploadCoverImage(client, parsed.coverImageUrl, slug);

    const albumDocFields = {
      _type: "album",
      title: parsed.title,
      slug: { _type: "slug", current: slug },
      coverImage: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: coverImageRef,
        },
        alt: `${parsed.title} cover art`,
      },
      releaseDate,
      status: "released",
      featured: false,
      shortDescription,
      fullDescription,
      genre,
      featuredArtists: [],
      tracklist: tracks,
      streamingLinks: {
        _type: "streamingLinks",
        bandcamp: albumUrl,
      },
      bandcampUrl: albumUrl,
    };

    if (existing && !options.update) {
      console.log(`Skipped existing album: ${parsed.title} (${existing._id})`);
      skipped += 1;
      continue;
    }

    if (existing && options.update) {
      await client.patch(existing._id).set(albumDocFields).commit();
      console.log(`Updated album: ${parsed.title} (${existing._id})`);
      updated += 1;
      continue;
    }

    const createdDoc = await client.create(albumDocFields);
    console.log(`Created album: ${parsed.title} (${createdDoc._id})`);
    created += 1;
  } catch (error) {
    console.error(`Failed to import ${rawUrl}: ${toErrorMessage(error)}`);
    failed += 1;
  }
}

console.log("\nImport summary");
console.log(`Created: ${created}`);
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  process.exitCode = 1;
}

function mustEnv(name, fallbackValue) {
  const value = process.env[name] ?? fallbackValue;
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

function normalizeUrl(input) {
  try {
    const parsed = new URL(input);
    if (!parsed.protocol.startsWith("http")) return null;
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; RTO-Beats-Importer/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} while fetching ${url}`);
  }

  return response.text();
}

function extractBandcampAlbumData(html, albumUrl) {
  const jsonLdNodes = getJsonLdNodes(html);
  const albumNode = pickAlbumNode(jsonLdNodes);

  const urlPathSlug = slugFromAlbumUrl(albumUrl);
  const titleFromMeta = getMetaContent(html, "property", "og:title");
  const descriptionFromMeta = getMetaContent(html, "name", "description");
  const imageFromMeta = getMetaContent(html, "property", "og:image");

  const tracklist = normalizeTracklist(albumNode?.track ?? albumNode?.tracks ?? []);

  return {
    title: normalizeText(albumNode?.name || titleFromMeta || ""),
    slugCandidate: normalizeText(urlPathSlug || albumNode?.name || titleFromMeta || ""),
    description: normalizeText(albumNode?.description || descriptionFromMeta || ""),
    releaseDate: normalizeText(albumNode?.datePublished || ""),
    coverImageUrl: normalizeText(firstImageUrl(albumNode?.image) || imageFromMeta || ""),
    genre: normalizeGenre(albumNode?.genre),
    tracklist,
  };
}

function getJsonLdNodes(html) {
  const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const nodes = [];

  for (const scriptMatch of scripts) {
    const rawJson = scriptMatch[1]?.trim();
    if (!rawJson) continue;

    try {
      const parsed = JSON.parse(rawJson);
      nodes.push(parsed);
    } catch {
      continue;
    }
  }

  return nodes;
}

function pickAlbumNode(nodes) {
  for (const node of nodes) {
    const candidates = Array.isArray(node) ? node : [node];

    for (const candidate of candidates) {
      const fromGraph = Array.isArray(candidate?.["@graph"]) ? candidate["@graph"] : [candidate];
      for (const item of fromGraph) {
        if (isAlbumLikeType(item?.["@type"])) {
          return item;
        }
      }
    }
  }

  return null;
}

function isAlbumLikeType(typeValue) {
  if (!typeValue) return false;
  const values = Array.isArray(typeValue) ? typeValue : [typeValue];
  return values.some((value) => {
    const normalized = String(value).toLowerCase();
    return normalized.includes("musicalbum") || normalized === "album";
  });
}

function getMetaContent(html, attrName, attrValue) {
  const escaped = escapeRegex(attrValue);
  const regex = new RegExp(
    `<meta[^>]*${attrName}=["']${escaped}["'][^>]*content=["']([^"']*)["'][^>]*>`,
    "i"
  );
  const reverseRegex = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*${attrName}=["']${escaped}["'][^>]*>`,
    "i"
  );

  const direct = html.match(regex);
  if (direct?.[1]) return direct[1];

  const reverse = html.match(reverseRegex);
  if (reverse?.[1]) return reverse[1];

  return "";
}

function normalizeTracklist(trackData) {
  const list = Array.isArray(trackData)
    ? trackData
    : Array.isArray(trackData?.itemListElement)
      ? trackData.itemListElement
      : [];

  const tracks = [];

  for (let index = 0; index < list.length; index += 1) {
    const rawTrack = list[index]?.item ?? list[index];
    const title = normalizeText(rawTrack?.name || rawTrack?.title || "");
    if (!title) continue;

    tracks.push({
      _type: "track",
      trackNumber: Number.isFinite(rawTrack?.position) ? Number(rawTrack.position) : index + 1,
      title,
      duration: toDurationMMSS(rawTrack?.duration),
      featuring: [],
    });
  }

  return tracks;
}

function normalizeGenre(rawGenre) {
  if (!rawGenre) return [];

  const asArray = Array.isArray(rawGenre) ? rawGenre : [rawGenre];
  const split = asArray.flatMap((entry) => String(entry).split(/[,/|]/g));
  return [...new Set(split.map((entry) => normalizeText(entry)).filter(Boolean))];
}

function toDurationMMSS(input) {
  if (!input) return "0:00";

  const raw = String(input).trim();

  if (/^\d{1,2}:[0-5]\d$/.test(raw)) {
    return raw;
  }

  const isoMatch = raw.match(/^PT(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (isoMatch) {
    const minutes = Number(isoMatch[1] ?? 0);
    const seconds = Number(isoMatch[2] ?? 0);
    if (Number.isFinite(minutes) && Number.isFinite(seconds)) {
      return `${minutes}:${String(seconds).padStart(2, "0")}`;
    }
  }

  const secondsMatch = raw.match(/^\d+$/);
  if (secondsMatch) {
    const totalSeconds = Number(raw);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  return "0:00";
}

function toShortDescription(description, title) {
  const normalized = normalizeText(description);
  if (normalized.length >= 40) {
    return normalized.slice(0, 220);
  }

  const fallback = `${title} released on Bandcamp. Full details, stream links, and tracklist are available on the album page.`;
  return fallback.slice(0, 220);
}

function toPortableText(text) {
  const normalized = normalizeText(text) || "No album description provided.";
  return [
    {
      _type: "block",
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          text: normalized,
          marks: [],
        },
      ],
    },
  ];
}

function toDateYYYYMMDD(input) {
  const raw = normalizeText(input);
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

async function uploadCoverImage(clientInstance, imageUrl, slug) {
  if (!imageUrl) {
    throw new Error("No cover image URL detected on Bandcamp page.");
  }

  const response = await fetch(imageUrl, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; RTO-Beats-Importer/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`Cover image fetch failed with HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "image/jpeg";
  const extension = contentTypeToExtension(contentType);
  const bytes = Buffer.from(await response.arrayBuffer());

  const uploaded = await clientInstance.assets.upload("image", bytes, {
    filename: `${slug}${extension}`,
    contentType,
  });

  return uploaded._id;
}

function contentTypeToExtension(contentType) {
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("gif")) return ".gif";
  return ".jpg";
}

function slugFromAlbumUrl(url) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const albumIndex = parts.findIndex((part) => part.toLowerCase() === "album");
    if (albumIndex >= 0 && parts[albumIndex + 1]) {
      return parts[albumIndex + 1];
    }
    return parts.at(-1) ?? "";
  } catch {
    return "";
  }
}

function toSlug(input) {
  return normalizeText(input)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 96);
}

function firstImageUrl(imageField) {
  if (!imageField) return "";
  if (typeof imageField === "string") return imageField;
  if (Array.isArray(imageField) && imageField[0]) return firstImageUrl(imageField[0]);
  if (typeof imageField === "object") {
    return imageField.url || imageField.contentUrl || imageField["@id"] || "";
  }
  return "";
}

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toErrorMessage(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function cleanEnvValue(value) {
  const normalized = String(value ?? "").trim();
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    return normalized.slice(1, -1).trim();
  }
  return normalized;
}