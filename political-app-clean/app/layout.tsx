import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "../contexts/LanguageContext";
import { AuthProvider } from "../contexts/AuthContext";

import PublicHeader from "@/components/layout/PublicHeader";

export const metadata: Metadata = {
  metadataBase: new URL("https://yourdomain.com"),

  title: {
    default: "Political Comparison Platform",
    template: "%s | Political Comparison Platform",
  },

  description:
    "Compare political statements, discover contradictions, explore AI-powered analysis and source-based political timelines.",

  keywords: [
    "politics",
    "contradictions",
    "political statements",
    "AI analysis",
    "fact comparison",
    "politicians",
    "debate",
  ],

  openGraph: {
    title: "Political Comparison Platform",
    description:
      "Compare political statements and discover contradictions with AI-powered analysis.",
    url: "https://yourdomain.com",
    siteName: "Political Comparison Platform",
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Political Comparison Platform",
    description:
      "Compare political statements and discover contradictions with AI-powered analysis.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-white">
  <AuthProvider>
  <LanguageProvider>
    <PublicHeader />

    {children}
  </LanguageProvider>
</AuthProvider>
</body>
    </html>
  );
}