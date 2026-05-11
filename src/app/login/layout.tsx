import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '登录 - JOBHOT',
  description: '登录 JOBHOT 解锁收藏职位、个性化推送等功能。',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
