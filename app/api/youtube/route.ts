import { NextResponse } from "next/server";

type YouTubeVideo = {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  url: string;
};

type YouTubePlaylistItem = {
  snippet?: {
    title?: string;
    publishedAt?: string;
    resourceId?: {
      videoId?: string;
    };
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
};

const CHANNEL_HANDLE = "RTOBeats";
const CHANNEL_URL = `https://www.youtube.com/@${CHANNEL_HANDLE}`;
const API_BASE = "https://www.googleapis.com/youtube/v3";

const fallbackVideos: YouTubeVideo[] = [
  {
    id: "fallback-1",
    title: "Open @RTOBeats on YouTube",
    thumbnail: "https://yt3.googleusercontent.com/7YXZsu7FAOyFEh8UNRvhw8WO6IRKElOtvqWBaqzIVmsipaVoV1rzhS-3Kw7B9GcZXSRlW5q-pg=s900-c-k-c0x00ffffff-no-rj",
    publishedAt: new Date().toISOString(),
    url: CHANNEL_URL,
  },
];

const CHANNEL_VIDEOS_URL = `${CHANNEL_URL}/videos`;

function unescapeJsonValue(value: string) {
  return value.replace(/\\u0026/g, "&").replace(/\\\//g, "/");
}

async function fetchWithApiKey(apiKey: string): Promise<YouTubeVideo[]> {
  const channelRes = await fetch(
    `${API_BASE}/channels?part=contentDetails,snippet&forHandle=${CHANNEL_HANDLE}&key=${apiKey}`
  );

  if (!channelRes.ok) {
    throw new Error(`channels API failed: ${channelRes.status}`);
  }

  const channelData = await channelRes.json();
  const channel = channelData.items?.[0];
  const uploadsPlaylistId = channel?.contentDetails?.relatedPlaylists?.uploads;

  if (!uploadsPlaylistId) {
    return [];
  }

  const playlistRes = await fetch(
    `${API_BASE}/playlistItems?part=snippet&maxResults=6&playlistId=${uploadsPlaylistId}&key=${apiKey}`
  );

  if (!playlistRes.ok) {
    throw new Error(`playlistItems API failed: ${playlistRes.status}`);
  }

  const playlistData = await playlistRes.json();
  const items = playlistData.items ?? [];

  return items
    .map((item: YouTubePlaylistItem) => {
      const videoId = item?.snippet?.resourceId?.videoId;
      if (!videoId) return null;

      const title = item?.snippet?.title ?? "Untitled video";
      const thumbnail =
        item?.snippet?.thumbnails?.high?.url ??
        item?.snippet?.thumbnails?.medium?.url ??
        item?.snippet?.thumbnails?.default?.url ??
        "";
      const publishedAt = item?.snippet?.publishedAt ?? new Date().toISOString();

      return {
        id: videoId,
        title,
        thumbnail,
        publishedAt,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      };
    })
    .filter(Boolean) as YouTubeVideo[];
}

async function fetchFromRss(): Promise<YouTubeVideo[]> {
  const channelPageRes = await fetch(CHANNEL_VIDEOS_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!channelPageRes.ok) {
    return [];
  }

  const channelPage = await channelPageRes.text();
  const rssUrlFromMetadata = channelPage.match(/"rssUrl":"([^"]+)"/)?.[1];
  const externalId = channelPage.match(/"externalId":"(UC[^"]+)"/)?.[1];
  const channelId = channelPage.match(/"channelId":"(UC[^"]+)"/)?.[1] ?? externalId;

  const rssUrl = rssUrlFromMetadata
    ? unescapeJsonValue(rssUrlFromMetadata)
    : channelId
      ? `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
      : "";

  if (!rssUrl) {
    return [];
  }

  const response = await fetch(rssUrl);

  if (!response.ok) {
    return [];
  }

  const xml = await response.text();
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];

  return entries.slice(0, 6).map((entry) => {
    const id = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] ?? "";
    const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "Untitled video";
    const publishedAt = entry.match(/<published>(.*?)<\/published>/)?.[1] ?? new Date().toISOString();
    const thumbnail = entry.match(/<media:thumbnail url="(.*?)"/)?.[1] ?? "";

    return {
      id: id || title,
      title,
      thumbnail,
      publishedAt,
      url: id ? `https://www.youtube.com/watch?v=${id}` : CHANNEL_URL,
    };
  });
}

export async function GET() {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;

    let videos: YouTubeVideo[] = [];

    if (apiKey) {
      videos = await fetchWithApiKey(apiKey);
    }

    if (!videos.length) {
      videos = await fetchFromRss();
    }

    if (!videos.length) {
      videos = fallbackVideos;
    }

    return NextResponse.json({
      channel: {
        handle: `@${CHANNEL_HANDLE}`,
        url: CHANNEL_URL,
      },
      videos,
    });
  } catch (error) {
    console.error("Failed to fetch YouTube videos:", error);

    return NextResponse.json(
      {
        channel: {
          handle: `@${CHANNEL_HANDLE}`,
          url: CHANNEL_URL,
        },
        videos: fallbackVideos,
      },
      { status: 200 }
    );
  }
}
