import type { Metadata } from 'next';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/gochi-hand';
import '@fontsource/instrument-serif/latin-400-italic.css';
import './globals.css';
import { THEME_BOOT_SCRIPT } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'Pairwise AI',
  description: 'Blind, pairwise model comparison. Two anonymous answers, you pick, then see who you backed.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" data-accent="grape" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
