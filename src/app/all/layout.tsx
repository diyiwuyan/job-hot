import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '全部求职动态 - JOBHOT',
  description: '大学生校招、实习招聘信息全量信息流，支持按行业分类筛选和关键词搜索。',
};

export default function AllLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
