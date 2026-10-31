"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Keep old bookmarks working; account roles are managed in one place.
export default function AdminUsersPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin/accounts"); }, [router]);
  return (
    <div className="page admin-page">
      <div className="admin-loading">账号管理已合并，正在跳转… <Link href="/admin/accounts">立即前往</Link></div>
    </div>
  );
}
