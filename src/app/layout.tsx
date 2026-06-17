import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { MobileBar } from '@/components/MobileBar';
import { ThemeScript } from '@/components/ThemeScript';
import { SidebarProvider } from '@/components/SidebarContext';
import { AppShell } from '@/components/AppShell';
import { AuthProvider } from '@/components/AuthContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const metadata: Metadata = {
  title: {
    default: 'JOBHOT - 大学生求职热点',
    template: '%s',
  },
  description: 'JOBHOT 汇集大学生求职热点信息，提供精选校招实习动态、求职日报、避雷名单、工具推荐等内容，助力大学生高效求职。',
  keywords: ['校招', '实习', '求职', '大学生', '招聘', 'JOBHOT', '校招避雷', '求职工具'],
  alternates: {
    types: {
      'application/rss+xml': `${basePath}/feed.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" data-theme="dark" data-theme-mode="dark">
      <head>
        <ThemeScript />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`} arco-theme="dark">
        <AuthProvider>
          <SidebarProvider>
            <AppShell>
              <Sidebar />
              <main className="app-main">
                <MobileBar />
                {children}
              </main>
            </AppShell>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
