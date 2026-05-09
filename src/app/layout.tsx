import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { MobileBar } from '@/components/MobileBar';
import { ThemeScript } from '@/components/ThemeScript';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'JOBHOT - 大学生求职热点',
  description: 'JOBHOT 汇集大学生求职热点信息，提供精选求职动态、求职日报、工具推荐等内容，助力大学生求职之路。',
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
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`} arco-theme="dark">
        <div className="app-shell">
          <Sidebar />
          <main className="app-main">
            <MobileBar />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
