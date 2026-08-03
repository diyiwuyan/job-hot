import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '27届秋招启动诊断 - JOBHOT',
  description: '5分钟左右判断你当前更接近方向摇摆、经历未转化、简历失焦、行动拖延、信息过载还是目标冲刺，并获得72小时行动建议。',
};

export default function AutumnStartLayout({ children }: { children: React.ReactNode }) {
  return children;
}

