import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './career-atlas.css';

export const metadata: Metadata = {
  title: '职业坐标 - JOBHOT',
  description: '通过个人诊断匹配职业方向，并查看岗位要求、成长路线与薪资结构。',
};

export default function CareerAtlasLayout({ children }: { children: ReactNode }) {
  return <div className="career-atlas-root">{children}</div>;
}
