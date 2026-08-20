import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { AdminOnlyGate } from '@/components/AdminOnlyGate';
import styles from '../../tools/assessment/AssessmentCenter.module.css';

export const metadata: Metadata = {
  title: '测评运营方法 - JOBHOT 管理后台',
  description: 'JOBHOT职业测评体系的分层、使用阶段与运营原则。',
};

const layers = [
  { label:'相对稳定', title:'职业倾向：我更愿意怎样工作？', description:'识别兴趣、价值取向与行为偏好，用来提出方向假设，而不是直接决定职业。', tools:'霍兰德、职业价值观、职业工作风格、MBTI（辅助）', cadence:'6—12个月或重大经历后复看', color:'#6366f1' },
  { label:'可以发展', title:'职业资本：我已经具备什么？', description:'盘点技能、经历证据与职场新人能力，找到简历资源和需要补齐的短板。', tools:'技能画像、就业胜任力、职业适应力、求职底牌', cadence:'每学期或实习项目后更新', color:'#0f766e' },
  { label:'当下状态', title:'求职诊断：我现在卡在哪里？', description:'定位决策、材料、面试、投递和行动问题，结果应直接连接下一项任务。', tools:'职业决策卡点、行动准备度、秋招启动诊断', cadence:'每2—4周或关键节点复测', color:'#ea580c' },
];

const stages = [
  { number:'01', label:'引流 / 初次接触', title:'先解决一个具体问题', use:'适合活动、社群、内容分享和第一次来到网站，只做一份短测。', tools:'秋招启动诊断、求职底牌、行动准备度', principle:'3—6分钟完成，报告给出一项72小时行动。', background:'linear-gradient(135deg,#f97316,#ef4444)' },
  { number:'02', label:'首次建档', title:'分次建立职业基线', use:'注册后逐步补齐兴趣、价值观和工作风格，形成相对稳定的基线。', tools:'霍兰德＋职业价值观，下一次补工作风格', principle:'首次最多推荐1—2份，不把长题量设为门槛。', background:'linear-gradient(135deg,#6366f1,#8b5cf6)' },
  { number:'03', label:'方向探索', title:'用能力与卡点校正方向', use:'当兴趣仍无法转成岗位选择时，补充真实能力、适应资源和决策障碍。', tools:'技能画像、职业适应力、职业决策卡点', principle:'结合专业、经历和岗位JD，不单凭分数推荐职业。', background:'linear-gradient(135deg,#0ea5e9,#0f766e)' },
  { number:'04', label:'求职推进', title:'从认识自己切换到推进结果', use:'进入简历、面试和投递阶段时，优先使用行为诊断。', tools:'就业胜任力、行动准备度、秋招启动诊断', principle:'每次只解决最高优先级卡点，并用复测观察变化。', background:'linear-gradient(135deg,#16a34a,#14b8a6)' },
  { number:'05', label:'深度服务 / 复盘', title:'把测评和真实证据放在一起', use:'用于咨询、训练营和阶段复盘，读取账号历史结果形成综合判断。', tools:'综合画像＋简历＋目标JD＋行动记录', principle:'测评是输入，最终输出是岗位假设和行动计划。', background:'linear-gradient(135deg,#111827,#475569)' },
];

export default function AssessmentStrategyAdminPage() {
  return (
    <AdminOnlyGate redirectPath="/admin/assessments">
      <div className="page">
        <div className="page-header" style={{ display:'flex', justifyContent:'space-between', gap:'1rem', alignItems:'center' }}>
          <div><h1>测评体系运营方法</h1><p>内部使用：测评分层、用户旅程和推荐原则</p></div>
          <Link href="/tools/assessment" className="btn btn-secondary">查看用户端 →</Link>
        </div>

        <section className={styles.conceptHero}>
          <div className={styles.conceptCopy}><span className={styles.eyebrow}>INTERNAL PLAYBOOK</span><h2>测评不是给人贴标签，而是把模糊问题变成可验证的假设</h2><p>运营时先判断用户当前问题，再选择工具。兴趣、能力、环境和行动状态需要组合解释，所有报告必须连接真实经历、岗位信息和下一步行动。</p></div>
          <div className={styles.conceptRules}>
            <div><span>1</span><p><strong>先有问题，再选测评</strong><small>不要让用户因为工具多而一次全部完成。</small></p></div>
            <div><span>2</span><p><strong>组合判断，不看孤立分数</strong><small>用账号画像和真实证据交叉验证。</small></p></div>
            <div><span>3</span><p><strong>结果必须连接行动</strong><small>短测承接进入，诊断承接持续服务。</small></p></div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}><div><h2>测评的三个层级</h2><p>稳定程度不同，解释方式和复测频率也不同。</p></div><span>THREE LEVELS</span></div>
          <div className={styles.layerGrid}>{layers.map((layer) => <article key={layer.title} className={styles.layerCard} style={{'--layer-color':layer.color} as CSSProperties}><div className={styles.layerTop}><span>{layer.label}</span><small>{layer.cadence}</small></div><h3>{layer.title}</h3><p>{layer.description}</p><div className={styles.layerTools}>{layer.tools}</div></article>)}</div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}><div><h2>用户旅程与使用阶段</h2><p>从低门槛体验到深度服务，不让所有用户走同一条路径。</p></div><span>USAGE MAP</span></div>
          <div className={styles.stageMap}>{stages.map((stage) => <article key={stage.number} className={styles.stageRow}><span className={styles.stageNumber} style={{'--stage-bg':stage.background} as CSSProperties}>{stage.number}</span><div className={styles.stageName}><span>{stage.label}</span><strong>{stage.title}</strong></div><div className={styles.stageUse}><strong>怎么用</strong><p>{stage.use}</p></div><div className={styles.stageTool}><strong>推荐：{stage.tools}</strong><p>{stage.principle}</p></div></article>)}</div>
          <div className={styles.operatingNote}><span>!</span><div><strong>推荐的首次用户路径</strong><p>一份短诊断 → 登录保存 → 根据卡点推荐一份基础测评或行动工具 → 在不同会话逐步补齐画像。不要把霍兰德、价值观和工作风格同时设为必做门槛。</p></div></div>
        </section>
      </div>
    </AdminOnlyGate>
  );
}
