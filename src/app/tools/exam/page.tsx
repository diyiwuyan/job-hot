'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabase';
import { EXAM_SETS } from '@/lib/exam-data';

interface HistoryRecord {
  exam_id: string;
  score: number;
  total: number;
}

export default function ExamPage() {
  const { user, loading } = useAuth();
  const [bestScores, setBestScores] = useState<Record<string, HistoryRecord>>({});

  useEffect(() => {
    if (!user || !supabase) return;

    async function fetchBestScores() {
      const { data } = await supabase!
        .from('exam_results')
        .select('exam_id, score, total')
        .eq('user_id', user!.id)
        .order('score', { ascending: false });

      if (data) {
        const best: Record<string, HistoryRecord> = {};
        for (const row of data) {
          if (!best[row.exam_id] || row.score > best[row.exam_id].score) {
            best[row.exam_id] = row;
          }
        }
        setBestScores(best);
      }
    }

    fetchBestScores();
  }, [user]);

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>笔试训练</h1>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>笔试训练</h1>
          <p>行测类通用笔试题训练，提升你的应试能力</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text)' }}>
            登录后开始训练
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            登录后可以记录你的成绩、查看历史最高分，追踪进步轨迹。
          </p>
          <Link href="/login" className="btn" style={{ display: 'inline-block' }}>
            去登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>笔试训练</h1>
        <p>行测类通用笔试题训练，5大模块各20题，限时作答，即时出分</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
        {EXAM_SETS.map((exam) => {
          const best = bestScores[exam.id];
          return (
            <Link
              key={exam.id}
              href={`/tools/exam/${exam.id}`}
              className="timeline-card"
              style={{ display: 'block', textDecoration: 'none', padding: '1.5rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{exam.icon}</div>
                {best && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: best.score >= best.total * 0.8 ? 'var(--success)' : 'var(--warning)',
                    fontWeight: 600,
                    background: best.score >= best.total * 0.8 ? 'rgba(63, 185, 80, 0.1)' : 'rgba(210, 153, 34, 0.1)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem',
                  }}>
                    最高 {best.score}/{best.total}
                  </div>
                )}
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>
                {exam.title}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                {exam.description}
              </p>
              <div className="timeline-tags" style={{ marginTop: '0.75rem' }}>
                {exam.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
