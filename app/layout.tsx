import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="flex flex-col min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
