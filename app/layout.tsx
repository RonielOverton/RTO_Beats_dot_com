import type { Metadata } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";
import { Providers } from "@/app/providers";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import "./globals.css";

const headingFont = Bebas_Neue({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin"],
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rtobeats.com"),
  title: {
    default: "RTO Beats",
    template: "%s | RTO Beats",
  },
  description: "Cinematic hip hop producer portfolio and digital store.",
  openGraph: {
    title: "RTO Beats",
    description: "Albums, projects, beats, plugins, merch, and digital downloads.",
    type: "website",
    url: "https://rtobeats.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable} antialiased`}>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
