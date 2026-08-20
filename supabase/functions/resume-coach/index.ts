// Supabase Edge Function: authenticated AI resume diagnosis and optimization.
// Deploy with: supabase functions deploy resume-coach
// Secrets: OPENAI_API_KEY, optional OPENAI_RESUME_MODEL (default gpt-5.4-mini)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const allowedOrigins = new Set([
  'https://jobhot.abcdabcd.cc',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

function corsHeaders(origin: string | null) {
  const safeOrigin = origin && allowedOrigins.has(origin) ? origin : 'https://jobhot.abcdabcd.cc';
  return {
    'Access-Control-Allow-Origin': safeOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

function json(origin: string | null, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function textFromResponse(payload: Record<string, unknown>) {
  const output = Array.isArray(payload.output) ? payload.output : [];
  for (const item of output as Array<Record<string, unknown>>) {
    if (!Array.isArray(item.content)) continue;
    for (const content of item.content as Array<Record<string, unknown>>) {
      if (content.type === 'output_text' && typeof content.text === 'string') return content.text;
    }
  }
  return '';
}

const diagnosisSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['overall_score', 'summary', 'dimensions', 'strengths', 'issues', 'missing_questions'],
  properties: {
    overall_score: { type: 'integer', minimum: 0, maximum: 100 },
    summary: { type: 'string' },
    dimensions: {
      type: 'array', minItems: 5, maxItems: 5,
      items: {
        type: 'object', additionalProperties: false,
        required: ['key', 'name', 'score', 'assessment', 'evidence'],
        properties: {
          key: { type: 'string', enum: ['job_match', 'evidence', 'impact', 'structure', 'risk'] },
          name: { type: 'string' },
          score: { type: 'integer', minimum: 0, maximum: 100 },
          assessment: { type: 'string' },
          evidence: { type: 'string' },
        },
      },
    },
    strengths: { type: 'array', maxItems: 6, items: { type: 'string' } },
    issues: {
      type: 'array', maxItems: 10,
      items: {
        type: 'object', additionalProperties: false,
        required: ['id', 'priority', 'title', 'evidence', 'impact', 'recommendation'],
        properties: {
          id: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          title: { type: 'string' },
          evidence: { type: 'string' },
          impact: { type: 'string' },
          recommendation: { type: 'string' },
        },
      },
    },
    missing_questions: {
      type: 'array', maxItems: 8,
      items: {
        type: 'object', additionalProperties: false,
        required: ['id', 'question', 'why', 'placeholder', 'required'],
        properties: {
          id: { type: 'string' },
          question: { type: 'string' },
          why: { type: 'string' },
          placeholder: { type: 'string' },
          required: { type: 'boolean' },
        },
      },
    },
  },
};

const optimizationSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'positioning', 'sections', 'change_log', 'unresolved_items'],
  properties: {
    title: { type: 'string' },
    positioning: { type: 'string' },
    sections: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['name', 'items'],
        properties: {
          name: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object', additionalProperties: false,
              required: ['heading', 'subheading', 'bullets'],
              properties: {
                heading: { type: 'string' },
                subheading: { type: 'string' },
                bullets: {
                  type: 'array',
                  items: {
                    type: 'object', additionalProperties: false,
                    required: ['text', 'source', 'confidence'],
                    properties: {
                      text: { type: 'string' },
                      source: { type: 'string' },
                      confidence: { type: 'string', enum: ['confirmed', 'needs_review'] },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    change_log: {
      type: 'array', maxItems: 20,
      items: {
        type: 'object', additionalProperties: false,
        required: ['location', 'before', 'after', 'reason'],
        properties: {
          location: { type: 'string' },
          before: { type: 'string' },
          after: { type: 'string' },
          reason: { type: 'string' },
        },
      },
    },
    unresolved_items: { type: 'array', maxItems: 10, items: { type: 'string' } },
  },
};

async function callOpenAI(args: {
  apiKey: string;
  model: string;
  fileUrl: string;
  instructions: string;
  prompt: string;
  schemaName: string;
  schema: Record<string, unknown>;
}) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${args.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: args.model,
      store: false,
      instructions: args.instructions,
      input: [{
        role: 'user',
        content: [
          { type: 'input_text', text: args.prompt },
          { type: 'input_file', file_url: args.fileUrl, detail: 'auto' },
        ],
      }],
      text: {
        format: {
          type: 'json_schema',
          name: args.schemaName,
          strict: true,
          schema: args.schema,
        },
      },
      max_output_tokens: args.schemaName === 'resume_diagnosis' ? 5000 : 9000,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.error?.message || 'AI 服务暂时不可用';
    throw new Error(message);
  }
  const outputText = textFromResponse(payload);
  if (!outputText) throw new Error('AI 未返回可读取的结果');
  return { result: JSON.parse(outputText), responseId: payload.id as string | undefined };
}

Deno.serve(async (request) => {
  const origin = request.headers.get('Origin');
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) });
  if (request.method !== 'POST') return json(origin, { error: 'Method not allowed' }, 405);

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  const model = Deno.env.get('OPENAI_RESUME_MODEL') || 'gpt-5.4-mini';
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!apiKey) return json(origin, { error: 'AI 简历服务尚未配置' }, 503);
  if (!supabaseUrl || !supabaseAnonKey) return json(origin, { error: '服务配置不完整' }, 503);

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return json(origin, { error: '请先登录账号' }, 401);
  const token = authorization.slice(7);
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await client.auth.getUser(token);
  const user = userData.user;
  if (userError || !user) return json(origin, { error: '登录状态已失效，请重新登录' }, 401);

  try {
    const body = await request.json();
    const action = body.action === 'optimize' ? 'optimize' : 'diagnose';
    const documentId = typeof body.documentId === 'string' ? body.documentId : '';
    if (!documentId) return json(origin, { error: '请选择一份简历' }, 400);

    const { data: documentRow, error: documentError } = await client
      .from('career_documents')
      .select('id,user_id,name,storage_path,mime_type')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (documentError || !documentRow) return json(origin, { error: '没有找到这份简历' }, 404);
    if (documentRow.mime_type !== 'application/pdf' && !documentRow.name.toLowerCase().endsWith('.pdf')) {
      return json(origin, { error: '当前 AI 诊断第一版仅支持 PDF 简历' }, 415);
    }

    const { data: signed, error: signedError } = await client.storage
      .from('career-documents')
      .createSignedUrl(documentRow.storage_path, 300);
    if (signedError || !signed?.signedUrl) return json(origin, { error: '无法读取简历文件' }, 400);

    const applicationId = typeof body.applicationId === 'string' && body.applicationId ? body.applicationId : null;
    let application: { id: string; company: string; job_title: string; source_url: string | null } | null = null;
    if (applicationId) {
      const { data } = await client.from('job_applications')
        .select('id,company,job_title,source_url')
        .eq('id', applicationId).eq('user_id', user.id).maybeSingle();
      application = data;
    }

    const targetCompany = String(body.targetCompany || application?.company || '').trim().slice(0, 200);
    const targetJobTitle = String(body.targetJobTitle || application?.job_title || '').trim().slice(0, 200);
    const jobDescription = String(body.jobDescription || '').trim().slice(0, 12000);
    if (!targetJobTitle) return json(origin, { error: '请填写目标岗位' }, 400);

    const { data: assessmentRows } = await client.from('assessment_results')
      .select('assessment_id,result_name,scores')
      .eq('user_id', user.id).limit(12);
    const assessmentContext = (assessmentRows || []).map((item) => ({
      assessment: item.assessment_id,
      result: item.result_name,
    }));

    const today = new Date().toISOString().slice(0, 10);
    const table = action === 'diagnose' ? 'resume_diagnostics' : 'resume_versions';
    const { count } = await client.from(table).select('*', { count: 'exact', head: true })
      .eq('user_id', user.id).gte('created_at', `${today}T00:00:00.000Z`);
    if ((count || 0) >= 8) return json(origin, { error: '今天的 AI 简历使用次数已达上限，请明天再试' }, 429);

    const commonInstructions = `你是面向中国大学生校招与实习的资深简历顾问。你的首要原则是事实准确：
1. 只能使用简历原文和用户明确补充的信息，绝不虚构公司、岗位、职责、指标、排名、奖项或技术细节。
2. 缺少数字时提出问题或标为待核实，不得自行创造量化结果。
3. 职业测评只用于内容排序和提问策略，不能转写成未经证实的人格优势。
4. 输出使用简洁、具体、适合中文招聘阅读的表达，避免空泛形容词。
5. 诊断应说明原文证据；优化内容的每条要标明来源与置信状态。`;

    if (action === 'diagnose') {
      const prompt = `请诊断附件中的简历。
目标公司：${targetCompany || '未指定'}
目标岗位：${targetJobTitle}
岗位 JD：${jobDescription || '用户尚未提供，请降低“岗位匹配”判断的确定性，并提示补充 JD。'}
用户账号内已有测评结果（仅用于提问和排序，不可作为履历事实）：${JSON.stringify(assessmentContext)}

请从岗位匹配、经历证据、成果影响、结构可读性、基础风险五个维度评分。先指出可保留的强项，再列出最影响投递的具体问题，并提出最多 8 个真正会改变优化结果的补充问题。不要要求用户重复简历中已经写明的信息。`;
      const { result } = await callOpenAI({ apiKey, model, fileUrl: signed.signedUrl, instructions: commonInstructions, prompt, schemaName: 'resume_diagnosis', schema: diagnosisSchema });
      const { data: saved, error: saveError } = await client.from('resume_diagnostics').insert({
        user_id: user.id,
        document_id: documentId,
        application_id: applicationId,
        target_company: targetCompany || null,
        target_job_title: targetJobTitle,
        job_description: jobDescription || null,
        overall_score: result.overall_score,
        summary: result.summary,
        dimensions: result.dimensions,
        strengths: result.strengths,
        issues: result.issues,
        missing_questions: result.missing_questions,
        model,
      }).select().single();
      if (saveError || !saved) throw new Error('诊断结果保存失败');
      return json(origin, { diagnostic: saved });
    }

    const diagnosticId = typeof body.diagnosticId === 'string' ? body.diagnosticId : '';
    if (!diagnosticId) return json(origin, { error: '请先完成简历诊断' }, 400);
    const { data: diagnostic, error: diagnosticError } = await client.from('resume_diagnostics')
      .select('*').eq('id', diagnosticId).eq('user_id', user.id).maybeSingle();
    if (diagnosticError || !diagnostic) return json(origin, { error: '没有找到本次诊断' }, 404);

    const evidenceAnswers = Array.isArray(body.evidenceAnswers)
      ? body.evidenceAnswers.filter((item: Record<string, unknown>) => typeof item.answer === 'string' && item.answer.trim()).slice(0, 8)
      : [];
    if (evidenceAnswers.length) {
      const evidenceRows = evidenceAnswers.map((item: Record<string, unknown>) => ({
        user_id: user.id,
        diagnostic_id: diagnosticId,
        question_id: String(item.id || crypto.randomUUID()),
        question: String(item.question || '').slice(0, 1000),
        answer: String(item.answer || '').trim().slice(0, 3000),
        updated_at: new Date().toISOString(),
      }));
      const { error } = await client.from('resume_evidence_answers').upsert(evidenceRows, { onConflict: 'diagnostic_id,question_id' });
      if (error) throw new Error('补充信息保存失败');
    }

    const prompt = `请基于附件简历、本次诊断和用户补充证据，生成一份面向目标岗位的中文优化版内容。
目标公司：${diagnostic.target_company || '未指定'}
目标岗位：${diagnostic.target_job_title}
岗位 JD：${diagnostic.job_description || '未提供'}
诊断：${JSON.stringify({ summary: diagnostic.summary, dimensions: diagnostic.dimensions, issues: diagnostic.issues })}
用户补充证据：${JSON.stringify(evidenceAnswers)}

保留真实的教育、实习、项目和技能结构。可以重排、压缩和重写，但不能补造事实。没有得到回答的关键缺口放入 unresolved_items；对应文案标记 needs_review。change_log 中列出重要改动的前后对照和理由。`;
    const { result } = await callOpenAI({ apiKey, model, fileUrl: signed.signedUrl, instructions: commonInstructions, prompt, schemaName: 'resume_optimization', schema: optimizationSchema });
    const { data: saved, error: saveError } = await client.from('resume_versions').insert({
      user_id: user.id,
      diagnostic_id: diagnosticId,
      document_id: documentId,
      application_id: diagnostic.application_id,
      title: result.title || `${diagnostic.target_job_title} · AI 优化版`,
      optimized_content: { positioning: result.positioning, sections: result.sections },
      change_log: result.change_log,
      unresolved_items: result.unresolved_items,
      model,
    }).select().single();
    if (saveError || !saved) throw new Error('优化版本保存失败');
    return json(origin, { version: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : '处理失败，请稍后再试';
    console.error('resume-coach', message);
    return json(origin, { error: message }, 500);
  }
});
