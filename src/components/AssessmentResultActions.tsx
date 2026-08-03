'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { downloadAssessmentResultCard } from '@/lib/assessment-result-card';
import { captureAssessmentSource, isXinyueSource } from '@/lib/assessment-source';

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
  campFit?: string;
  accent?: string;
};

export function AssessmentResultActions({
  assessmentId,
  assessmentName,
  resultName,
  headline,
  summary,
  action,
  nextStep,
  campFit,
  accent,
}: AssessmentResultActionsProps) {
  const [source, setSource] = useState('直接访问');
  const [showTeacher, setShowTeacher] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const captured = captureAssessmentSource();
    const timer = window.setTimeout(() => setSource(captured), 0);
    trackEvent('assessment_complete', assessmentId, {
      source: captured,
      result: resultName,
    });
    return () => window.clearTimeout(timer);
  }, [assessmentId, resultName]);

  const teacher = useMemo(() => {
    const xinyue = isXinyueSource(source);
    return {
      name: xinyue ? '心悦老师' : '小仙老师',
      qr: xinyue ? '/images/qr-coach-xinyue.png' : '/images/qr-coach-xiaoxian.png',
    };
  }, [source]);

  const resultText = `我的${assessmentName}结果：${resultName}\n${headline}\n未来72小时行动：${action}\n来源：${source}`;

  async function saveCard() {
    await downloadAssessmentResultCard({
      assessmentName,
      resultName,
      headline,
      action,
      source,
      accent,
    });
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

  function revealTeacher() {
    setShowTeacher((value) => !value);
    trackEvent('assessment_teacher_reveal', assessmentId, {
      source,
      result: resultName,
      teacher: teacher.name,
    });
  }

  return (
    <>
      <section
        className="card"
        style={{
          marginBottom: '1rem',
          borderLeft: `4px solid ${accent || 'var(--accent)'}`,
          background: 'var(--accent-muted)',
        }}
      >
        <div style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.35rem' }}>
          未来72小时，先完成这一件事
        </div>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.8, margin: 0 }}>{action}</p>
      </section>

      <section className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>把这次结果带走</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.7, marginBottom: '0.85rem' }}>
          保存个人结果卡，或复制文字发给老师。无需留下联系方式，也能先看到完整基础结果。
        </p>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn" onClick={saveCard}>保存个人结果卡</button>
          <button type="button" className="btn btn-secondary" onClick={copyResult}>
            {copied ? '已复制' : '复制结果文字'}
          </button>
        </div>
      </section>

      {nextStep && (
        <section className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.3rem' }}>建议的下一步</div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>{nextStep.label}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.7, marginBottom: '0.8rem' }}>
            {nextStep.description}
          </p>
          <Link
            href={nextStep.href}
            className="btn"
            onClick={() => trackEvent('assessment_next_step', assessmentId, { source, result: resultName, target: nextStep.href })}
          >
            继续下一步 →
          </Link>
        </section>
      )}

      <section className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.76rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.3rem' }}>如果希望有人一起推进</div>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>让职路同行社老师结合你的结果补充一条判断</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.7, marginBottom: '0.75rem' }}>
          {campFit || summary} 职路同行社提供职业发展内容、测评解读与行动支持；是否进一步了解训练营，由你自己决定。
        </p>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary" onClick={revealTeacher}>
            {showTeacher ? '收起老师二维码' : '查看老师二维码'}
          </button>
          <Link
            href="/tools/coaching"
            className="btn btn-secondary"
            onClick={() => trackEvent('assessment_camp_view', assessmentId, { source, result: resultName })}
          >
            了解7天训练营
          </Link>
        </div>

        {showTeacher && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Image
              src={teacher.qr}
              alt={`${teacher.name}微信二维码`}
              width={176}
              height={176}
              style={{ width: 176, height: 176, maxWidth: '100%', objectFit: 'contain', background: '#fff', borderRadius: 14, padding: 8 }}
            />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.7, marginTop: '0.5rem' }}>
              添加{teacher.name}，发送“测评＋{resultName}”<br />
              请勿在公开区域发送简历或敏感个人信息。
            </div>
          </div>
        )}
      </section>
    </>
  );
}
