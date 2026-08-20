import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '企业备战库 - JOBHOT',
  description: '按企业整理校招流程、笔试重点、行为面试、商业案例与公开面经高频考察点。',
};

export default function CompanyPrepLayout({ children }: { children: React.ReactNode }) {
  return children;
}
