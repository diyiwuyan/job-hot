import { createClient } from '@supabase/supabase-js';
import { getRoleIndustries, industryOrder, roles } from '../src/app/tools/career-atlas/role-data';

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY');
}

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const industryIds: Record<string, string> = {
  '互联网与软件': 'internet-software',
  '金融与保险': 'finance-insurance',
  '制造与工业': 'manufacturing-industry',
  '新能源与能源': 'new-energy',
  '消费与零售': 'consumer-retail',
  '供应链与物流': 'supply-chain-logistics',
  '医疗与医药': 'healthcare-pharma',
  '教育与科研': 'education-research',
  '咨询与专业服务': 'professional-services',
  '国央企与公共服务': 'soe-public',
  '建筑与房地产': 'construction-real-estate',
  '传媒与文化': 'media-culture',
  '农业与食品': 'agriculture-food',
  '环保与ESG': 'environment-esg',
};

async function main() {
  const industries = industryOrder
    .filter((name) => name !== '全部')
    .map((name, index) => ({
      id: industryIds[name],
      name,
      sort_order: (index + 1) * 10,
      is_published: true,
    }));

  const { error: industryError } = await admin
    .from('career_industries')
    .upsert(industries, { onConflict: 'id' });
  if (industryError) throw industryError;

  const roleRows = roles.map((role, index) => ({
    slug: role.slug,
    name: role.name,
    english: role.english,
    family: role.family,
    seniority: role.seniority,
    purpose: role.purpose,
    interests: role.interests,
    strengths: role.strengths,
    styles: role.styles,
    keywords: role.keywords,
    outputs: role.outputs,
    requirements: role.requirements,
    gaps: role.gaps,
    salary: role.salary,
    growth: role.growth,
    industries: getRoleIndustries(role),
    core_skills: role.coreSkills,
    work_context: role.workContext,
    adjacent: role.adjacent,
    entry: role.entry,
    confidence: role.confidence,
    evidence_status: role.confidence === '中' ? 'JD观察' : '编辑种子',
    is_published: true,
    sort_order: index + 1,
    last_reviewed_at: '2026-07-25',
  }));

  const { error: roleError } = await admin
    .from('career_roles')
    .upsert(roleRows, { onConflict: 'slug' });
  if (roleError) throw roleError;

  console.log(`Synced ${industries.length} industries and ${roleRows.length} career roles to Supabase.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
