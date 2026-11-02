import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'StyleShift — Precision AI Text Style Rewriter',
  description:
    'Transform your writing into any tone with instant side-by-side style rewrites, semantic meaning preservation scores, and word-level diffs powered by Google Gemini.',
  keywords: [
    'AI text rewriter',
    'style transfer',
    'Gemini AI',
    'writing assistant',
    'semantic score',
    'diff viewer',
    'voice clone',
  ],
  authors: [{ name: 'StyleShift Team' }],
  creator: 'StyleShift',
  metadataBase: new URL('https://styleshift.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://styleshift.vercel.app',
    siteName: 'StyleShift',
    title: 'StyleShift — Precision AI Text Style Rewriter',
    description:
      'Transform your writing into multiple styles simultaneously with live semantic similarity scores and word diffs.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StyleShift — Precision AI Text Style Rewriter',
    description:
      'Side-by-side multi-style rewriting with semantic meaning scores and word diffs powered by Gemini.',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#090d16',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200`}>
        {children}
      </body>
    </html>
  );
}
