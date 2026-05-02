import "./globals.css";
import Providers from "@/app/providers";
import type { Metadata } from "next";

const siteUrl = "https://political-app-starter.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Political Compare",
  description: "Politikai vélemények összehasonlítása egy helyen",
  openGraph: {
    title: "Political Compare",
    description: "Politikai vélemények összehasonlítása egy helyen",
    url: siteUrl,
    siteName: "Political Compare",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Political Compare",
    description: "Politikai vélemények összehasonlítása egy helyen",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}