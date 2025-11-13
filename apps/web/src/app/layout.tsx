import type { Metadata } from 'next';
import { QueryProvider } from '@/lib/providers/query-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Xingu - Korean Party Game Platform',
  description: 'Fun party games for MT, workshops, and events',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
