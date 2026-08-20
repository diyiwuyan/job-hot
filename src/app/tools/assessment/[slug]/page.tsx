import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CareerAssessmentRunner } from '@/components/CareerAssessmentRunner';
import { CAREER_ASSESSMENTS, CAREER_ASSESSMENT_BY_SLUG } from '@/lib/career-assessment-data';

export const dynamicParams = false;

export function generateStaticParams() {
  return CAREER_ASSESSMENTS.map((assessment) => ({ slug: assessment.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const assessment = CAREER_ASSESSMENT_BY_SLUG.get(slug);
  if (!assessment) return { title: '职业测评 - JOBHOT' };
  const title = `${assessment.title} - JOBHOT`;
  return {
    title,
    description: `${assessment.description}${assessment.questions.length}题，完成后获得分维度解释和求职行动建议。`,
    openGraph: { title, description: assessment.description, images: [] },
    twitter: { title, description: assessment.description, images: [] },
  };
}

export default async function CareerAssessmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const assessment = CAREER_ASSESSMENT_BY_SLUG.get(slug);
  if (!assessment) notFound();
  return <CareerAssessmentRunner definition={assessment} />;
}
