import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '学员中心 - JOBHOT',
  description: '已开放项目的学员课程与作业中心。',
  robots: { index: false, follow: false },
};

export default function CareerCampLayout({ children }: { children: React.ReactNode }) {
  return children;
}
