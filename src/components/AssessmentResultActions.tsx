'use client';

import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import { trackEvent } from '@/lib/analytics';
import { downloadAssessmentResultCard } from '@/lib/assessment-result-card';
import { captureAssessmentSource } from '@/lib/assessment-source';
import styles from './AssessmentResultActions.module.css';

type NextStep = {
  href: string;
  label: string;
  description: string;
};

type AssessmentResultActionsProps = {
  assessmentId: string;
  assessmentName: string;
  resultName: string;
  headline: string;
  summary: string;
  action: string;
  nextStep?: NextStep;
  accent?: string;
  onSaveCard?: (source: string) => Promise<void>;
};

export function AssessmentResultActions({
  assessmentId,
  assessmentName,
  resultName,
  headline,
  action,
  nextStep,
  accent,
  onSaveCard,
}: AssessmentResultActionsProps) {
  const [source, setSource] = useState('直接访问');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const captured = captureAssessmentSource();
    const timer = window.setTimeout(() => setSource(captured), 0);
    trackEvent('assessment_complete', assessmentId, { source: captured, result: resultName });
    return () => window.clearTimeout(timer);
  }, [assessmentId, resultName]);

  const resultText = `我的${assessmentName}结果：${resultName}\n${headline}\n未来72小时行动：${action}\n来源：${source}`;

  async function saveCard() {
    if (onSaveCard) await onSaveCard(source);
    else await downloadAssessmentResultCard({ assessmentName, resultName, headline, action, source, accent });
    trackEvent('assessment_result_save', assessmentId, { source, result: resultName });
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('请复制下面的结果：', resultText);
    }
    trackEvent('assessment_result_copy', assessmentId, { source, result: resultName });
  }

  return (
    <section className={styles.panel} style={{ '--result-accent': accent || 'var(--accent)' } as CSSProperties}>
      <header className={styles.header}>
        <span>FROM INSIGHT TO ACTION</span>
        <h2>把这次结果变成下一步</h2>
        <p>不需要继续完成所有测评。先执行一个动作，再用真实反馈校准判断。</p>
      </header>
      <ol className={styles.steps}>
        <li className={styles.step}>
          <span className={styles.number}>01</span>
          <div className={styles.content}>
            <span>未来72小时</span>
            <strong>{action}</strong>
          </div>
        </li>
        <li className={styles.step}>
          <span className={styles.number}>02</span>
          <div className={styles.content}>
            <span>保存本次结果</span>
            <strong>留下一份结果卡，方便后续复盘和比较变化。</strong>
            <div className={styles.actions}>
              <button type="button" className="btn" onClick={saveCard}>保存结果卡</button>
              <button type="button" className="btn btn-secondary" onClick={copyResult}>{copied ? '已复制' : '复制结果文字'}</button>
            </div>
          </div>
        </li>
        {nextStep && (
          <li className={styles.step}>
            <span className={styles.number}>03</span>
            <div className={styles.content}>
              <span>需要继续时</span>
              <strong>{nextStep.label}</strong>
              <p>{nextStep.description}</p>
              <div className={styles.actions}>
                <Link href={nextStep.href} className="btn btn-secondary" onClick={() => trackEvent('assessment_next_step', assessmentId, { source, result: resultName, target: nextStep.href })}>继续下一步 →</Link>
              </div>
            </div>
          </li>
        )}
      </ol>
    </section>
  );
}
