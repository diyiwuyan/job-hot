'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';

type AdminOnlyGateProps = {
  children: React.ReactNode;
  redirectPath: string;
};

export function AdminOnlyGate({ children, redirectPath }: AdminOnlyGateProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  if (authLoading || adminLoading) {
    return (
      <div className="page admin-only-state">
        <div className="timeline-card admin-only-card">
          <span className="admin-only-eyebrow">权限校验</span>
          <h1>正在确认管理员身份…</h1>
          <p>请稍候，验证完成后将自动显示页面。</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page admin-only-state">
        <div className="timeline-card admin-only-card">
          <span className="admin-only-eyebrow">管理员页面</span>
          <h1>此页面不对外开放</h1>
          <p>央国企服务资料仅供职路同行社管理员内部使用，请先登录管理员账号。</p>
          <div className="admin-only-actions">
            <Link href={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="btn">
              管理员登录
            </Link>
            <Link href="/" className="btn btn-secondary">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="page admin-only-state">
        <div className="timeline-card admin-only-card">
          <span className="admin-only-eyebrow">访问受限</span>
          <h1>当前账号没有管理员权限</h1>
          <p>如确需使用，请联系职路同行社管理员为账号开通权限。</p>
          <div className="admin-only-actions">
            <Link href="/" className="btn">
              返回首页
            </Link>
            <a href="tel:18611884299" className="btn btn-secondary">
              联系小仙老师
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
