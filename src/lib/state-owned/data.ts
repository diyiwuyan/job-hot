import companies from './companies.json';
import industries from './industries.json';
import interviewData from './interview-data.json';
import majorMap from './major-map.json';

export type CompanyType = 'central' | 'provincial' | 'subsidiary';
export type CompanyTier = 1 | 2 | 3;

export interface RecruitInfo {
  total: string;
  period: string;
  phase: string;
  direction: string;
  note?: string;
}

export interface StateOwnedCompany {
  name: string;
  short: string;
  type: CompanyType;
  industry: string;
  province: string;
  tier: CompanyTier;
  positions: string[];
  eduReq: string;
  schoolHint: string;
  description: string;
  advice: string;
  talentProfile: string[];
  recruitInfo: RecruitInfo;
}

export interface MajorInfo {
  category: string;
  positions: string[];
  industries: string[];
}

export interface InterviewInfo {
  interviewProcess: string;
  writtenTest: string;
  interviewForm: string;
  commonQuestions: string[];
  preparationTips: string;
  difficulty: string;
  competitionRatio: string;
}

export const SOE_COMPANIES = companies as StateOwnedCompany[];
export const SOE_INDUSTRIES = industries as Record<string, string[]>;
export const SOE_MAJOR_MAP = majorMap as Record<string, MajorInfo>;
export const SOE_INTERVIEW_DATA = interviewData as Record<string, InterviewInfo>;

export const SOE_MAJOR_NAMES = Object.keys(SOE_MAJOR_MAP);
