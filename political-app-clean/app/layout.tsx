import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "../contexts/LanguageContext";
import { AuthProvider } from "../contexts/AuthContext";

import PublicHeader from "@/components/layout/PublicHeader";

export const metadata: Metadata = {
  title: "Political Comparison Platform",
  description: "Compare political statements and contradictions.",
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