import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '职业价值观测评 - JOBHOT｜职路同行社出品',
  description: '30道原创题，梳理成长、自主、稳定、影响、关系与生活边界六项职业价值观，并把结果转成看岗位时能使用的问题。',
};

export default function ValuesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
