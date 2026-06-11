'use client';

import { NAV_DATA, formatNavUrl } from '@/lib/nav-data';

function slugify(s: string): string {
  return 'cat-' + s.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
}

export default function NavPage() {
  const totalSites = NAV_DATA.reduce((sum, c) => sum + c.sites.length, 0);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>求职导航</h1>
        <p>
          精选 {totalSites}+ 个常用求职网站，覆盖官方平台、央企、银行、文化企业、选调事业单位与求职工具，按分类直达
        </p>
      </div>

      {/* 分类快捷跳转条 */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          margin: '1.25rem 0',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'var(--bg)',
          paddingTop: '0.5rem',
          paddingBottom: '0.5rem',
        }}
      >
        {NAV_DATA.map((g) => (
          <button
            key={g.category}
            onClick={() => scrollTo(slugify(g.category))}
            className="tag"
            style={{ cursor: 'pointer', border: 'none', fontSize: '0.8rem' }}
          >
            {g.category}
            <span style={{ opacity: 0.6, marginLeft: 4 }}>{g.sites.length}</span>
          </button>
        ))}
      </div>

      {NAV_DATA.map((group) => (
        <section key={group.category} id={slugify(group.category)} style={{ marginTop: '2rem', scrollMarginTop: '4rem' }}>
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
                key={site.url}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="timeline-card"
                style={{ display: 'block', textDecoration: 'none' }}
                title={site.desc || site.name}
              >
                <div
                  style={{
                    fontSize: '0.9rem',
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
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {site.desc || formatNavUrl(site.url)}
                </div>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
