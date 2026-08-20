import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '我的求职工作台 - JOBHOT',
  description: '统一管理求职材料、目标岗位、投递进度、笔面练习与职业测评结果。',
};

export default function WorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
