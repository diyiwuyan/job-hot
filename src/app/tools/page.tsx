import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '工具推荐 - JOBHOT',
  description: '精选求职工具和资源推荐，包括刷题平台、简历工具、薪资查询、校招信息聚合等。',
};

export default function ToolsPage() {
  const tools = [
    {
      name: 'Campus2026',
      desc: '2026届校招信息汇总，社区共创维护，覆盖互联网、外企、游戏、车企等行业',
      url: 'https://github.com/namewyf/Campus2026',
      tags: ['GitHub', '校招汇总', '开源'],
    },
    {
      name: '牛客网',
      desc: '校招笔试面试刷题平台，提供校招日历、面经分享、在线笔试等功能',
      url: 'https://www.nowcoder.com/',
      tags: ['刷题', '面经', '笔试'],
    },
    {
      name: '实习僧',
      desc: '国内领先的实习招聘平台，覆盖互联网、金融、快消等行业实习岗位',
      url: 'https://www.shixiseng.com/',
      tags: ['实习', '招聘平台'],
    },
    {
      name: 'CampusShame',
      desc: '校招污点行为记录，帮助求职者避雷毁约、鸽offer等不良企业',
      url: 'https://github.com/forthespada/CampusShame',
      tags: ['避雷', '开源', '校招'],
    },
    {
      name: '海投网（鱼泡直聘）',
      desc: '宣讲会信息聚合平台，覆盖全国高校校园宣讲会时间和地点',
      url: 'https://www.haitou.cc/',
      tags: ['宣讲会', '校招'],
    },
    {
      name: 'Offer Show',
      desc: '校招薪资爆料平台，查看各公司校招offer薪资待遇',
      url: 'https://offershow.top/',
      tags: ['薪资', '对比', 'Offer'],
    },
    {
      name: '力扣 LeetCode',
      desc: '算法刷题必备平台，校招笔试面试算法题练习',
      url: 'https://leetcode.cn/',
      tags: ['刷题', '算法', '面试'],
    },
    {
      name: '求职方舟AI',
      desc: 'AI驱动的校招信息聚合，实时更新26届校招信息，提供Chrome插件',
      url: 'https://www.qiuzhifangzhou.com/campus',
      tags: ['AI', '校招', '聚合'],
    },
    {
      name: '超级简历',
      desc: '专业简历制作工具，提供ATS友好的简历模板和AI优化建议',
      url: 'https://www.wondercv.com/',
      tags: ['简历', '模板', 'AI'],
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>工具推荐</h1>
        <p>精选求职工具和资源，助力你的求职之路</p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem',
        }}
      >
        {tools.map((tool) => (
          <a
            key={tool.name}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="timeline-card"
            style={{ display: 'block', textDecoration: 'none' }}
          >
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>
              {tool.name}
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              {tool.desc}
            </p>
            <div className="timeline-tags" style={{ marginTop: 0 }}>
              {tool.tags.map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
