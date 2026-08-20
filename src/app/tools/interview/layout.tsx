import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '面试题库与无领导小组 - JOBHOT',
  description: '大学生校招面试准备题库，覆盖经历深挖、产品运营、技术研发、数据算法、HR面和无领导小组讨论。',
};

export default function InterviewLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
