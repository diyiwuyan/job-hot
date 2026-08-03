import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { MobileBar } from '@/components/MobileBar';
import { ThemeScript } from '@/components/ThemeScript';
import { SidebarProvider } from '@/components/SidebarContext';
import { AppShell } from '@/components/AppShell';
import { AuthProvider } from '@/components/AuthContext';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'JOBHOT × 职路同行社 - 大学生求职信息与职业发展支持',
    template: '%s',
  },
  description: 'JOBHOT 提供大学生校招实习信息与求职工具，职路同行社提供职业发展内容、测评解读、求职策略与行动支持。',
  keywords: ['校招', '实习', '求职', '大学生', '招聘', 'JOBHOT', '职路同行社', '职业发展', '求职工具'],
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
                <footer className="site-footer">
                  <div className="site-footer-partnership">
                    <a href="/about/#zhilu"><strong>JOBHOT × 职路同行社</strong></a>
                    <span>求职信息与工具 × 职业发展与行动支持</span>
                  </div>
                  <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">津ICP备2024024694号</a>
                </footer>
              </main>
            </AppShell>
            <AnalyticsTracker />
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
