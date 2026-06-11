import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '霍兰德职业兴趣测试 - JOBHOT',
  description: '免费在线霍兰德职业兴趣测试（Holland RIASEC），48 道题测出你的职业兴趣代码与适合的职业方向、专业参考，助力大学生求职与职业规划。',
};

export default function HollandLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
