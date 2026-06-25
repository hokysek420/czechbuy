import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CzechBuy - Prémiová móda v České republice',
  description: 'Moderní online obchod inspirovaný Zalando. Kvalitní oblečení a doplňky za nejlepší ceny.',
  openGraph: {
    title: 'CzechBuy - Prémiová móda v České republice',
    description: 'Moderní online obchod inspirovaný Zalando. Kvalitní oblečení a doplňky za nejlepší ceny.',
    url: 'https://czechbuy.cz',
    siteName: 'CzechBuy',
    locale: 'cs_CZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CzechBuy - Prémiová móda v České republice',
    description: 'Moderní online obchod inspirovaný Zalando. Kvalitní oblečení a doplňky za nejlepší ceny.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
