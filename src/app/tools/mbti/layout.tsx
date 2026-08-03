import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MBTI 测试（非官方）- JOBHOT',
  description: '70道原创题，从精力来源、信息偏好、决策偏好和生活方式四个维度进行轻量自我探索，获得MBTI偏好结果与下一步行动建议。',
};

export default function MbtiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
