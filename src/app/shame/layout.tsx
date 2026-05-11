import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '校招避雷 - JOBHOT',
  description: '校招污点公司名单，记录毁约、鸽offer、压薪资等不良行为，帮助求职者避雷。数据来源 CampusShame 开源项目。',
};

export default function ShameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
