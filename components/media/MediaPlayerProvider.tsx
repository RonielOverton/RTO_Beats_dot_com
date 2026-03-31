"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { SanityPlayableMediaItem } from "@/sanity/lib";

interface MediaPlayerContextValue {
  queue: SanityPlayableMediaItem[];
  currentItem: SanityPlayableMediaItem | null;
  isPlaying: boolean;
  isExpanded: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  setQueue: (items: SanityPlayableMediaItem[], initialId?: string) => void;
  selectItem: (id: string) => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleExpanded: () => void;
}

const MediaPlayerContext = createContext<MediaPlayerContextValue | null>(null);

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function MediaPlayerProvider({ children }: { children: ReactNode }) {
  const mediaRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueueState] = useState<SanityPlayableMediaItem[]>([]);
  const [currentId, setCurrentId] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.9);

  useEffect(() => {
    const saved = window.localStorage.getItem("rto.mediaPlayer.expanded");
    if (saved === "0") {
      setIsExpanded(false);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("rto.mediaPlayer.expanded", isExpanded ? "1" : "0");
  }, [isExpanded]);

  const currentIndex = useMemo(() => {
    return queue.findIndex((item) => item._id === currentId);
  }, [currentId, queue]);

  const currentItem = useMemo(() => {
    if (currentIndex < 0) return null;
    return queue[currentIndex] ?? null;
  }, [currentIndex, queue]);

  const playById = useCallback(
    (id: string, shouldAutoPlay = true) => {
      const audio = mediaRef.current;
      if (!audio) return;
      const found = queue.find((item) => item._id === id);
      if (!found) return;

      setCurrentId(id);

      // Album items have no audio file — just select them without touching the audio element
      if (!found.mediaFile?.url) {
        audio.pause();
        audio.src = "";
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        return;
      }

      const sameTrack = currentId === id && audio.src === found.mediaFile.url;

      if (!sameTrack) {
        audio.src = found.mediaFile.url;
        audio.load();
        setCurrentTime(0);
        setDuration(0);
      }

      if (shouldAutoPlay) {
        void audio.play();
        setIsPlaying(true);
      }
    },
    [currentId, queue],
  );

  const setQueue = useCallback((items: SanityPlayableMediaItem[], initialId?: string) => {
    setQueueState(items);
    if (items.length === 0) {
      setCurrentId("");
      setIsPlaying(false);
      return;
    }

    const idStillExists = items.some((item) => item._id === currentId);
    if (!idStillExists) {
      setCurrentId(initialId ?? items[0]._id);
    } else if (initialId && initialId !== currentId) {
      setCurrentId(initialId);
    }
  }, [currentId]);

  useEffect(() => {
    const audio = mediaRef.current;
    if (!audio || !currentItem) return;

    // Album items have no audio — clear the audio element
    if (!currentItem.mediaFile?.url) {
      if (!audio.paused) audio.pause();
      return;
    }

    const srcChanged = audio.src !== currentItem.mediaFile.url;
    if (srcChanged) {
      audio.src = currentItem.mediaFile.url;
      audio.load();
      setCurrentTime(0);
      setDuration(0);
      if (isPlaying) {
        void audio.play();
      }
    }
  }, [currentItem, isPlaying]);

  useEffect(() => {
    const audio = mediaRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  const selectItem = useCallback(
    (id: string) => {
      playById(id, true);
    },
    [playById],
  );

  const togglePlay = useCallback(() => {
    const audio = mediaRef.current;
    if (!audio) return;

    if (!currentItem && queue.length > 0) {
      void playById(queue[0]._id, true);
      return;
    }

    if (audio.paused) {
      void audio.play();
      setIsPlaying(true);
      return;
    }

    audio.pause();
    setIsPlaying(false);
  }, [currentItem, playById, queue]);

  const seekTo = useCallback((time: number) => {
    const audio = mediaRef.current;
    if (!audio) return;

    const safeTime = clamp(time, 0, Number.isFinite(audio.duration) ? audio.duration : time);
    audio.currentTime = safeTime;
    setCurrentTime(safeTime);
  }, []);

  const setVolume = useCallback((nextVolume: number) => {
    setVolumeState(clamp(nextVolume, 0, 1));
  }, []);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % queue.length;
    void playById(queue[nextIndex]._id, true);
  }, [currentIndex, playById, queue]);

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return;
    const prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
    void playById(queue[prevIndex]._id, true);
  }, [currentIndex, playById, queue]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const value = useMemo<MediaPlayerContextValue>(
    () => ({
      queue,
      currentItem,
      isPlaying,
      isExpanded,
      currentTime,
      duration,
      volume,
      setQueue,
      selectItem,
      togglePlay,
      seekTo,
      setVolume,
      playNext,
      playPrevious,
      toggleExpanded,
    }),
    [queue, currentItem, isPlaying, isExpanded, currentTime, duration, volume, setQueue, selectItem, togglePlay, seekTo, setVolume, playNext, playPrevious, toggleExpanded],
  );

  return (
    <MediaPlayerContext.Provider value={value}>
      {children}
      <audio
        ref={mediaRef}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={(event) => {
          const media = event.currentTarget;
          setDuration(Number.isFinite(media.duration) ? media.duration : 0);
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
        }}
        onEnded={playNext}
        className="hidden"
      />
    </MediaPlayerContext.Provider>
  );
}

export function useMediaPlayer() {
  const context = useContext(MediaPlayerContext);
  if (!context) {
    throw new Error("useMediaPlayer must be used within MediaPlayerProvider");
  }
  return context;
}
