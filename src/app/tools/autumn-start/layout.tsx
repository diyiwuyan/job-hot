import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '27届秋招启动诊断 - JOBHOT',
  description: '约4分钟，从目标、材料、投递、笔面和复盘五个环节定位当前秋招卡点，并获得一项72小时行动。',
};

export default function AutumnStartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
