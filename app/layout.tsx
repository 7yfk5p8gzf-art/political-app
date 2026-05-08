import "./globals.css";
import Providers from "@/app/providers";
import type { Metadata } from "next";

const siteUrl = "https://political-app-starter.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: "Political Compare",
  description:
    "Régi és új politikai állítások összehasonlítása AI elemzéssel, forrásokkal és közösségi szavazással.",

  openGraph: {
    title: "Political Compare",
    description:
      "Régi és új politikai állítások összehasonlítása AI elemzéssel, forrásokkal és közösségi szavazással.",
    url: siteUrl,
    siteName: "Political Compare",
    type: "website",

    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Political Compare",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Political Compare",
    description:
      "Régi és új politikai állítások összehasonlítása AI elemzéssel, forrásokkal és közösségi szavazással.",

    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}