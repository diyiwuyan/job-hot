import { RECRUITMENT_SOURCES } from '@/lib/recruitment-sources';

const kindLabel = {
  official: '企业官网',
  aggregator: '聚合平台',
  'campus-info': '校园信息',
} as const;

export function RecruitmentSourcePanel() {
  const official = RECRUITMENT_SOURCES.filter(source => source.kind === 'official');
  const aggregators = RECRUITMENT_SOURCES.filter(source => source.kind !== 'official');

  return (
    <details className="recruitment-source-panel">
      <summary>
        <span className="recruitment-source-summary-main">
          <span className="recruitment-source-kicker">信息源</span>
          <strong>{RECRUITMENT_SOURCES.length} 个公开来源</strong>
          <span>已补充互联网大厂官方校招入口，职位状态以原站为准</span>
        </span>
        <span className="recruitment-source-summary-action">查看来源清单</span>
      </summary>
      <div className="recruitment-source-body">
        <p className="recruitment-source-note">
          JOBHOT 只收录公开可访问的招聘页面或聚合数据。企业官网入口用于补齐没有被聚合平台覆盖的岗位；点击后可在原站查看实时职位、批次、城市和截止时间。
        </p>
        <div className="recruitment-source-grid">
          {[...official, ...aggregators].map(source => (
            <a
              className="recruitment-source-item"
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="recruitment-source-item-topline">
                <span className={`recruitment-source-kind recruitment-source-kind-${source.kind}`}>
                  {kindLabel[source.kind]}
                </span>
                <span className="recruitment-source-verified">核验于 {source.verifiedAt}</span>
              </span>
              <strong>{source.name}</strong>
              <span>{source.focus}</span>
            </a>
          ))}
        </div>
      </div>
    </details>
  );
}

