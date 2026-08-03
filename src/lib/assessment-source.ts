const SOURCE_KEY = 'jh_assessment_source';

function cleanSource(value: string | null | undefined): string {
  return (value ?? '').trim().slice(0, 80);
}

export function captureAssessmentSource(): string {
  if (typeof window === 'undefined') return '直接访问';

  const params = new URLSearchParams(window.location.search);
  const incoming = cleanSource(
    params.get('src') || params.get('source') || params.get('utm_source'),
  );

  if (incoming) {
    try {
      window.sessionStorage.setItem(SOURCE_KEY, incoming);
      window.localStorage.setItem(SOURCE_KEY, incoming);
    } catch {}
    return incoming;
  }

  try {
    return cleanSource(
      window.sessionStorage.getItem(SOURCE_KEY) ||
        window.localStorage.getItem(SOURCE_KEY),
    ) || '直接访问';
  } catch {
    return '直接访问';
  }
}

export function getAssessmentSource(): string {
  return captureAssessmentSource();
}

export function isXinyueSource(source: string): boolean {
  const normalized = source.toLowerCase();
  return normalized.includes('xinyue') || source.includes('心悦');
}

