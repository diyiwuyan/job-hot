import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '求职导航 - JOBHOT',
  description: '精选数百个常用求职网站，覆盖官方招聘平台、央企、银行、中央文化企业、选调生事业单位及求职工具资源，按分类一键直达。',
};

export default function NavLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
