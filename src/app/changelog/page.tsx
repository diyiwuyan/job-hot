import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '更新日志 - JOBHOT',
  description: 'JOBHOT 版本更新记录，查看每个版本的新功能和改进。',
};

export default function ChangelogPage() {
  const logs = [
    {
      version: 'v0.4.0',
      date: '2026-05-11',
      changes: [
        '首页新增数据统计面板，一目了然掌握信息量',
        '校招避雷页面新增按届筛选、结果计数、markdown 链接渲染',
        '移除空的「资讯」频道筛选项，减少用户困惑',
        '所有页面添加独立 SEO metadata（title/description/keywords）',
        '新增 RSS 订阅源（/feed.xml），支持 RSS 阅读器订阅',
        'UI 细节优化：统计卡片、分割线、搜索提示文案',
      ],
    },
    {
      version: 'v0.3.0',
      date: '2026-05-11',
      changes: [
        '新增求职日报页面，按日期聚合展示每日招聘动态',
        '新增工具推荐页面，精选 9 款求职必备工具',
        '新增关于页面，介绍项目背景和技术栈',
        '新增更新日志页面',
        '新增反馈页面，支持 GitHub Issue 反馈',
        'Sidebar 导航高亮当前页面',
        'UI 细节优化：移动端适配、搜索框交互',
      ],
    },
    {
      version: 'v0.2.0',
      date: '2026-05-10',
      changes: [
        '接入 Campus2026 真实数据源，替换模拟数据',
        '解析 88 条校招/实习信息，覆盖 6 大行业分类',
        '智能评分系统：基于时效性、企业知名度、信息完整度打分',
        '精选机制：82 分以上自动标记为精选',
        '构建时自动拉取最新数据（prebuild 脚本）',
        '部署到 GitHub Pages',
      ],
    },
    {
      version: 'v0.1.0',
      date: '2026-05-09',
      changes: [
        '项目初始化，基于 Next.js 16 + Tailwind CSS 4',
        '实现首页精选展示',
        '实现全部动态页面（分页、筛选、搜索）',
        '暗色/亮色/自动主题切换',
        '响应式布局（桌面端 + 移动端）',
        '频道筛选（校招/实习/资讯）和分类筛选',
      ],
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>更新日志</h1>
        <p>JOBHOT 的版本更新记录</p>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {logs.map((log) => (
          <div key={log.version} className="timeline-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {log.version}
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{log.date}</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {log.changes.map((change, i) => (
                <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {change}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
