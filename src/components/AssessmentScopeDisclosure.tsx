import styles from './AssessmentScopeDisclosure.module.css';

type DisclosureMode = 'minimal' | 'broad' | 'diagnostic';

const MODE_COPY: Record<DisclosureMode, { label: string; summary: string; note: string }> = {
  minimal: {
    label: '测评范围预告',
    summary: '想先了解大致会测什么？',
    note: '这里只说明内容范围。具体维度含义、得分和倾向组合会在完成后解释，避免影响你的自然作答。',
  },
  broad: {
    label: '能力范围预告',
    summary: '这份测评会关注哪些方面？',
    note: '这些领域用于帮助你回忆真实经历。答题时不会提示当前题目对应的领域，完整能力画像会在完成后呈现。',
  },
  diagnostic: {
    label: '诊断范围预告',
    summary: '这份诊断可能涉及哪些问题？',
    note: '这里只帮助你判断工具是否适合当前问题。具体卡点、优先级和行动建议会在完成后呈现。',
  },
};

export function AssessmentScopeDisclosure({ mode, areas }: { mode: DisclosureMode; areas: string[] }) {
  const copy = MODE_COPY[mode];
  return (
    <details className={styles.disclosure}>
      <summary>
        <div><span>{copy.label}</span><strong>{copy.summary}</strong></div>
        <i>⌄</i>
      </summary>
      <div className={styles.body}>
        <div className={styles.areas}>{areas.map((area) => <span key={area}>{area}</span>)}</div>
        <p>{copy.note}</p>
      </div>
    </details>
  );
}
