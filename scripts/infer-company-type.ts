/**
 * Infer company type (央国企/外企/银行/事业单位/民企) from company name.
 *
 * This is a shared utility used by all parse-*.ts scripts to provide
 * consistent companyType classification across data sources.
 *
 * The inference is based on well-known naming patterns for Chinese
 * state-owned enterprises, banks, foreign companies, and institutions.
 */

import type { CompanyType } from '../src/lib/types';

// ─── State-owned enterprise patterns ─────────────────────────────────
// Central SOEs (央企) — directly managed by SASAC or special regulatory bodies
const CENTRAL_SOE_PREFIXES = [
  '中国石油', '中国石化', '中国海油', '中海石油', '中海油',
  '国家电网', '南方电网', '中国华能', '中国大唐', '中国华电',
  '国家能源', '国家电投', '中国三峡', '中国长江电力',
  '中国移动', '中国电信', '中国联通', '中国铁塔',
  '中国建筑', '中国中铁', '中国铁建', '中国交建', '中国中冶',
  '中国中车', '中国船舶', '中国兵器', '中国兵装', '中国航天', '中国航空',
  '中国电子', '中国电科', '中航工业', '中国航发',
  '中国一汽', '东风汽车', '东风集团', '长安汽车',
  '中粮集团', '中粮', '中国储备粮', '中储粮',
  '华润集团', '华润', '招商局', '中国中信', '中信集团',
  '中国邮政', '中国铁路', '国铁集团',
  '中国核工业', '中核集团', '中广核',
  '中国宝武', '中国钢铁', '鞍钢集团', '鞍钢',
  '中国有色', '中国铝业', '中铝集团', '中国五矿', '五矿集团',
  '中国化工', '中国中化', '中化集团', '中化',
  '中国机械', '国机集团', '中国通用',
  '中国节能', '中国环保',
  '中国医药', '国药集团', '国药', '中国生物',
  '中国出版', '中国旅游', '中旅集团',
  '中国建材', '中国物流', '中国诚通',
  '中国航信', '中国民航', '中国商飞',
  '中国林业', '中国农业发展',
  '南航集团', '东航集团', '国航集团', '中国南方航空', '中国东方航空', '中国国际航空',
  '中远海运', '中国远洋',
  '中国能建', '中国电建',
  '中国黄金', '中国稀土',
  '中国通号', '中国铁通',
  '中国化学', '中国有研',
  '中煤集团', '中国煤炭',
  '保利集团', '保利',
  '中国外运',
  '中国西电', '中国东方电气',
];

// Generic SOE indicators (国企 naming patterns)
const SOE_KEYWORDS = [
  // Common prefixes indicating state-owned
  /^中国\S{2,}(集团|公司|总公司|有限公司|股份)/,
  /^国家\S{2,}(集团|公司|总公司|局)/,
  /^中央\S{2,}(集团|公司)/,
  // Provincial/city SOEs
  /^(北京|上海|天津|重庆|广东|浙江|江苏|山东|四川|湖北|湖南|河南|河北|福建|安徽|陕西|辽宁|黑龙江|吉林|云南|贵州|广西|山西|内蒙古|新疆|甘肃|海南|宁夏|青海|西藏|江西)\S{0,4}(国资|国有|投资集团|发展集团|能源集团|交通集团|建设集团|水务集团|城投|城建|产投|金控|资本)/,
  // Tobacco, salt, postal
  /烟草/, /中烟/, /盐业集团/,
];

// ─── Bank patterns ───────────────────────────────────────────────────
const BANK_KEYWORDS = [
  '中国银行', '工商银行', '建设银行', '农业银行', '交通银行', '邮储银行',
  '招商银行', '浦发银行', '民生银行', '中信银行', '光大银行', '华夏银行',
  '平安银行', '兴业银行', '广发银行', '渤海银行', '恒丰银行', '浙商银行',
  '国家开发银行', '进出口银行', '农业发展银行',
];
const BANK_REGEX = /银行|Bank(?!.*安全|.*cyber)/i;

// ─── Institution patterns (事业单位) ─────────────────────────────────
const INSTITUTION_KEYWORDS = [
  '研究院', '研究所', '科学院', '社会科学院', '工程院',
  '气象局', '地震局', '海洋局', '测绘局',
  '博物馆', '图书馆', '档案馆', '美术馆',
  '医院', '疾控中心', '卫生中心',
  '出版社', '报社', '通讯社', '新华社',
  '大学', '学院', // only if the company itself is a university
];
// More precise institution regex
const INSTITUTION_REGEX = /^(中国|国家|中央)?\S{0,6}(研究院|研究所|科学院|工程院|气象局|地震局)$/;

// ─── Foreign company patterns ────────────────────────────────────────
const FOREIGN_KEYWORDS = [
  'Google', 'Microsoft', '微软', 'Apple', '苹果公司', 'Amazon', 'Meta', 'NVIDIA',
  'Intel', '英特尔', 'AMD', 'IBM', 'Oracle', '甲骨文', 'SAP', 'Salesforce',
  'Samsung', '三星', 'Sony', '索尼', 'LG', '松下', 'Panasonic',
  'Bosch', '博世', 'Siemens', '西门子', 'ABB', 'Schneider', '施耐德',
  'P&G', '宝洁', 'Unilever', '联合利华', "L'Oréal", '欧莱雅', '雅诗兰黛',
  'Johnson', '强生', 'Pfizer', '辉瑞', 'Roche', '罗氏', 'Novartis', '诺华',
  'McKinsey', '麦肯锡', 'BCG', '波士顿咨询', 'Bain', '贝恩',
  'Goldman Sachs', '高盛', 'Morgan Stanley', '摩根士丹利', 'JPMorgan', '摩根大通',
  'HSBC', '汇丰', 'UBS', '瑞银', 'Citi', '花旗', 'Deutsche Bank', '德意志银行',
  'Toyota', '丰田', 'Honda', '本田', 'BMW', '宝马', 'Mercedes', '梅赛德斯', '奔驰',
  'Volkswagen', '大众汽车',
  'EY', '安永', 'Deloitte', '德勤', 'KPMG', '毕马威', 'PwC', '普华永道',
  'Mars', '玛氏', 'Nestlé', '雀巢', 'Coca-Cola', '可口可乐', 'PepsiCo', '百事',
  'Nike', 'Adidas', 'LVMH', 'Gucci', 'Hermes',
  'Qualcomm', '高通', 'Broadcom', '博通', 'Texas Instruments', '德州仪器',
  'ASML', 'Applied Materials',
  'Shell', '壳牌', 'BP', 'ExxonMobil', '埃克森',
  'GE', '通用电气', 'Honeywell', '霍尼韦尔', '3M',
  'Accenture', '埃森哲', 'Capgemini', '凯捷',
];

/**
 * Infer CompanyType from company name.
 *
 * Priority: bank > state > institution > foreign > private (default)
 *
 * Returns undefined (not 'private') when no match is found,
 * so the display layer can distinguish "unknown" from "confirmed private".
 */
export function inferCompanyType(companyName: string): CompanyType | undefined {
  if (!companyName) return undefined;

  const name = companyName.trim();

  // 1. Bank detection (highest priority — banks are also state-owned but need separate category)
  if (BANK_KEYWORDS.some(k => name.includes(k))) return 'bank';
  if (BANK_REGEX.test(name) && !/网络安全|信息安全|安全银行/.test(name)) return 'bank';

  // 2. Central SOE detection
  if (CENTRAL_SOE_PREFIXES.some(prefix => name.includes(prefix))) return 'state';

  // 3. Generic SOE patterns
  for (const re of SOE_KEYWORDS) {
    if (re.test(name)) return 'state';
  }

  // 4. Institution detection (research institutes, universities acting as employers, etc.)
  if (INSTITUTION_REGEX.test(name)) return 'institution';
  // Less strict: check if name contains institution keywords (but be careful with false positives)
  // For example "XX研究院" is institution, but "XX研究院有限公司" might be private
  for (const kw of INSTITUTION_KEYWORDS) {
    if (name.endsWith(kw) && !name.includes('有限公司')) return 'institution';
  }

  // 5. Foreign company detection
  if (FOREIGN_KEYWORDS.some(k => name.includes(k))) return 'foreign';
  // Heuristic: company name is mostly English/non-Chinese
  const chineseRatio = (name.match(/[\u4e00-\u9fff]/g) || []).length / name.length;
  if (name.length > 3 && chineseRatio < 0.3) return 'foreign';

  // Unknown — return undefined so the display layer shows '—' instead of '民企'
  return undefined;
}
