import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './career-atlas.css';

export const metadata: Metadata = {
  title: '职业坐标 - JOBHOT',
  description: '通过任务兴趣、能力证据、工作偏好、行业线索与真实经历完成一轮职业探索，并查看岗位要求、成长路线与薪资结构。',
};

export default function CareerAtlasLayout({ children }: { children: ReactNode }) {
  return <div className="career-atlas-root">{children}</div>;
}
