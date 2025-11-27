import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/lib/providers/query-provider';
import { PluginProvider } from '@/components/providers/PluginProvider';
import { SoundProvider } from '@/lib/providers/sound-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#6366F1',
};

export const metadata: Metadata = {
  title: {
    default: 'Xingu - 한국형 파티 게임 플랫폼',
    template: '%s | Xingu',
  },
  description: 'MT, 워크샵, 행사를 위한 재미있는 파티 게임. Kahoot 스타일의 한국형 게임 플랫폼.',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    title: 'Xingu - 한국형 파티 게임 플랫폼',
    description: 'MT, 워크샵, 행사를 위한 재미있는 파티 게임',
    siteName: 'Xingu',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Xingu - 한국형 파티 게임 플랫폼',
    description: 'MT, 워크샵, 행사를 위한 재미있는 파티 게임',
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
    <html lang="ko" className={inter.variable}>
      <body className={inter.className}>
        <PluginProvider>
          <SoundProvider>
            <QueryProvider>{children}</QueryProvider>
          </SoundProvider>
        </PluginProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'white',
              border: '1px solid #e5e7eb',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            },
          }}
          richColors
        />
      </body>
    </html>
  );
}
