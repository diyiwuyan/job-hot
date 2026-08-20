import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '岗位专项备战｜JOBHOT',
  description: '按校招岗位整理官方 JD、笔试重点、公开面经与企业招聘流程。',
};

export default function RolePrepLayout({ children }: { children: React.ReactNode }) {
  return children;
}
