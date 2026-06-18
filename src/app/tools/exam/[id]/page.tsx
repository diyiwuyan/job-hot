import { EXAM_SETS } from '@/lib/exam-data';
import ExamClient from './ExamClient';

// Required for Next.js static export (output: 'export')
export function generateStaticParams() {
  return EXAM_SETS.map((exam) => ({ id: exam.id }));
}

export default function ExamDetailPage({ params }: { params: { id: string } }) {
  return <ExamClient id={params.id} />;
}
