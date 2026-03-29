import type { Metadata } from "next";
import { BioSection } from "@/components/site/BioSection";
import { CtaSection } from "@/components/site/CtaSection";
import { FeaturedAlbumsSection } from "@/components/site/FeaturedAlbumsSection";
import { HeroSection } from "@/components/site/HeroSection";
import { YoutubeSection } from "@/components/site/YoutubeSection";

export const metadata: Metadata = {
  title: "RTO Beats | Cinematic Hip Hop Producer and Store",
  description:
    "Artist portfolio and online store for albums, beats, plugins, merch, and digital downloads.",
};

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <BioSection />
      <FeaturedAlbumsSection />
      <YoutubeSection />
      <CtaSection />
    </main>
  );
}
