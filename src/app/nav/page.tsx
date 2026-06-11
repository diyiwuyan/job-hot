import type { Metadata } from 'next';
import { NAV_DATA, formatNavUrl } from '@/lib/nav-data';

export const metadata: Metadata = {
  title: '求职导航 - JOBHOT',
  description:
    '一站式求职网址导航，精选官方招聘平台、国央企与公务员、互联网大厂、地方人才社保、求职工具与资源，快速直达常用求职网站。',
};

export default function NavPage() {
  const totalSites = NAV_DATA.reduce((sum, c) => sum + c.sites.length, 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1>求职导航</h1>
        <p>精选 {totalSites} 个常用求职网站，按分类直达，告别四处搜索</p>
      </div>

      {NAV_DATA.map((group) => (
        <section key={group.category} style={{ marginTop: '2rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text)',
              paddingBottom: '0.6rem',
              marginBottom: '1rem',
              borderBottom: '2px solid var(--border)',
            }}
          >
            {group.category}
            <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>
              {group.sites.length} 项
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {group.sites.map((site) => (
              <a
                key={site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="timeline-card"
                style={{ display: 'block', textDecoration: 'none' }}
              >
                <div
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: '0.35rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {site.name}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {formatNavUrl(site.url)}
                </div>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
