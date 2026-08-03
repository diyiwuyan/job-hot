import type { Metadata } from 'next';
import { AdminOnlyGate } from '@/components/AdminOnlyGate';
import { StateOwnedJobNavigator } from '@/components/StateOwnedJobNavigator';

export const metadata: Metadata = {
  title: '管理员工具 - JOBHOT',
  description: 'JOBHOT 管理员内部工具，仅向获得权限的账号开放。',
};

export default function SoeJobNavPage() {
  return (
    <AdminOnlyGate redirectPath="/services/soe-job-nav">
      <StateOwnedJobNavigator />
    </AdminOnlyGate>
  );
}
