'use client';

import { useEffect } from 'react';
import { captureAssessmentSource } from '@/lib/assessment-source';
import { trackEvent } from '@/lib/analytics';

export function AssessmentSourceCapture({ page }: { page: string }) {
  useEffect(() => {
    const source = captureAssessmentSource();
    trackEvent('assessment_view', page, { source });
  }, [page]);

  return null;
}

