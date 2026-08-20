'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabase';

export type AssessmentAnswers = Record<string, number>;
export type AssessmentScores = Record<string, number>;

export type StoredAssessmentResult = {
  id: string;
  assessment_id: string;
  result_name: string;
  answers: AssessmentAnswers;
  scores: AssessmentScores;
  completed_at: string;
  updated_at: string;
};

type SaveAssessmentResultInput = {
  resultName: string;
  answers: AssessmentAnswers;
  scores: AssessmentScores;
};

function resultErrorMessage(message: string) {
  if (message.includes('assessment_results')) return '账号结果库尚未初始化，请稍后再试。';
  return '保存失败，请检查网络后重试。';
}

export function useAssessmentResult(assessmentId: string) {
  const { user, loading: authLoading } = useAuth();
  const [savedResult, setSavedResult] = useState<StoredAssessmentResult | null>(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading || !user || !supabase) return;
    let cancelled = false;

    async function fetchSavedResult() {
      const { data, error: fetchError } = await supabase!
        .from('assessment_results')
        .select('id,assessment_id,result_name,answers,scores,completed_at,updated_at')
        .eq('user_id', user!.id)
        .eq('assessment_id', assessmentId)
        .maybeSingle();

      if (cancelled) return;
      if (fetchError) setError(resultErrorMessage(fetchError.message));
      else setSavedResult((data as StoredAssessmentResult | null) ?? null);
      setFetching(false);
    }

    void fetchSavedResult();
    return () => { cancelled = true; };
  }, [assessmentId, authLoading, user]);

  const saveResult = useCallback(async (input: SaveAssessmentResultInput) => {
    if (!user || !supabase) return null;
    setSaving(true);
    setError('');

    const now = new Date().toISOString();
    const { data, error: saveError } = await supabase
      .from('assessment_results')
      .upsert({
        user_id: user.id,
        assessment_id: assessmentId,
        result_name: input.resultName,
        answers: input.answers,
        scores: input.scores,
        completed_at: now,
        updated_at: now,
      }, { onConflict: 'user_id,assessment_id' })
      .select('id,assessment_id,result_name,answers,scores,completed_at,updated_at')
      .single();

    setSaving(false);
    if (saveError) {
      setError(resultErrorMessage(saveError.message));
      return null;
    }

    const stored = data as StoredAssessmentResult;
    setSavedResult(stored);
    return stored;
  }, [assessmentId, user]);

  return {
    user,
    authLoading,
    loading: authLoading || Boolean(user && fetching),
    saving,
    error,
    savedResult,
    saveResult,
  };
}

