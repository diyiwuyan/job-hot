import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '我的综合职业画像 - JOBHOT',
  description: '汇总霍兰德兴趣、职业价值观、工作风格、技能、职业决策卡点和求职行动准备度，形成持续更新的大学生职业画像。',
  openGraph: {
    title: '我的综合职业画像 - JOBHOT',
    description: '把不同测评结果放在一起理解，找到更适合你的求职下一步。',
    images: [],
  },
  twitter: {
    title: '我的综合职业画像 - JOBHOT',
    description: '把不同测评结果放在一起理解，找到更适合你的求职下一步。',
    images: [],
  },
};

export default function CareerProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
