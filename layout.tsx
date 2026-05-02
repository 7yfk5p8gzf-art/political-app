import './globals.css';
import Providers from '@/app/providers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Political Compare',
  description: 'Politikai összehasonlító oldal',

  openGraph: {
    title: 'Political Compare',
    description: 'Politikai összehasonlító oldal',
    images: ['/og-image.jpg'],
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
