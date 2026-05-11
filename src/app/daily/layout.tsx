import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '求职日报 - JOBHOT',
  description: '每日精选校招和实习动态，按日期聚合展示最新招聘信息，快速掌握求职热点。',
};

export default function DailyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
