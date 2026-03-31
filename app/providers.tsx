"use client";

import { CartProvider } from "@/components/cart/CartProvider";
import { MediaPlayerProvider } from "@/components/media/MediaPlayerProvider";
import { PersistentMiniPlayer } from "@/components/media/PersistentMiniPlayer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <MediaPlayerProvider>
        {children}
        <PersistentMiniPlayer />
      </MediaPlayerProvider>
    </CartProvider>
  );
}
