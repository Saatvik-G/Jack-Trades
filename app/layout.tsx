import type { Metadata } from 'next';
import { Cormorant_Garamond, Space_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://jack-trades.vercel.app'),
  title: 'Jack&Trades — The Polymath Engine',
  description: 'Discover non-obvious, structural connections across Science, Math, Psychology, Art, Philosophy, and 16+ disciplines.',
  openGraph: {
    title: 'Jack&Trades — The Polymath Engine',
    description: 'Reveal deep, structural connections between any concept and 16+ disciplines instantly.',
    url: 'https://jack-trades.vercel.app',
    siteName: 'Jack&Trades',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Jack&Trades Preview Image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jack&Trades — The Polymath Engine',
    description: 'Reveal deep, structural connections between any concept and 16+ disciplines instantly.',
    images: ['/og-image.jpg'],
  },
};

import { Providers } from '@/components/Providers';
import { AmbientBackground } from '@/components/AmbientBackground';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${spaceGrotesk.variable}`}>
      <body className="flex flex-col min-h-screen bg-[#FAF9F6] text-slate-900 font-sans antialiased selection:bg-indigo-650 selection:text-white relative">
        <AmbientBackground />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
