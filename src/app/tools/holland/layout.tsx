import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '霍兰德职业兴趣测试 - JOBHOT',
  description: '免费在线霍兰德职业兴趣测试（Holland RIASEC），90 道题按兴趣、能力自评、职业反馈三项各10分计分，并结合专业与AI实践推荐大学生校招岗位大类。',
};

export default function HollandLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
