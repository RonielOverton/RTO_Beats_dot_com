"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface YoutubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
}

const fallback: YoutubeVideo[] = [
  {
    id: "fallback-1",
    title: "RTO Beats YouTube Channel",
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    url: "https://www.youtube.com/@RTOBeats",
  },
  {
    id: "fallback-2",
    title: "Latest uploads from @RTOBeats",
    thumbnail: "https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg",
    url: "https://www.youtube.com/@RTOBeats/videos",
  },
  {
    id: "fallback-3",
    title: "Watch more beats and content",
    thumbnail: "https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
    url: "https://www.youtube.com/@RTOBeats",
  },
];

export function YoutubeSection() {
  const [videos, setVideos] = useState<YoutubeVideo[]>(fallback);

  useEffect(() => {
    fetch("/api/youtube")
      .then((res) => res.json())
      .then((data) => {
        if (data.videos?.length) {
          setVideos(data.videos.slice(0, 3));
        }
      })
      .catch(() => {
        // retain fallback silently
      });
  }, []);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] px-8 py-12">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">YouTube</p>
            <h2 className="mt-4 text-4xl font-semibold text-zinc-50">Latest from @RTOBeats</h2>
          </div>
          <a
            href="https://www.youtube.com/@RTOBeats"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.25em] text-zinc-300 transition hover:border-white/40"
          >
            Visit channel
          </a>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {videos.map((video) => (
            <a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-white/10 bg-black p-4 transition hover:border-amber-200/30"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-4 line-clamp-2 text-sm font-semibold text-zinc-100">{video.title}</h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
