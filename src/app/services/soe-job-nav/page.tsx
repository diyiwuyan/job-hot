import type { Metadata } from 'next';
import { StateOwnedJobNavigator } from '@/components/StateOwnedJobNavigator';

export const metadata: Metadata = {
  title: '央国企求职导航 - JOBHOT',
  description: '按专业匹配央国企可投递企业、岗位方向、学历要求、招聘节奏与面试准备要点。',
};

export default function SoeJobNavPage() {
  return <StateOwnedJobNavigator />;
}
