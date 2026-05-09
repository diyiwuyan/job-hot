import Link from 'next/link';
import { getFeaturedItems } from '@/lib/feed';
import { FeedItem } from '@/lib/types';

function getScoreClass(score: number): string {
  if (score >= 80) return 'score-high';
  if (score >= 50) return 'score-mid';
  return 'score-muted';
}

function FeaturedCard({ item }: { item: FeedItem }) {
  return (
    <article className="timeline-card" style={{ marginBottom: '1rem' }}>
      <div className="timeline-card-head">
        <div className="timeline-source">
          {item.sourceAvatar && (
            <img
              src={item.sourceAvatar}
              alt=""
              className="timeline-source-icon"
              width={16}
              height={16}
            />
          )}
          <span>{item.source}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="timeline-selected-badge">精选</span>
          <span className={`timeline-score ${getScoreClass(item.score)}`}>
            {item.score}
          </span>
        </div>
      </div>

      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="timeline-title"
      >
        {item.title}
      </a>

      <p className="timeline-summary">{item.summary}</p>

      <div className="timeline-tags">
        {item.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

export default function HomePage() {
  const featuredItems = getFeaturedItems(10);

  return (
    <div className="page page-home">
      <div className="page-header">
        <div style={{ marginBottom: '0.5rem' }}>
          <h1>
            <span>JOB</span>
            <span className="text-gradient">HOT</span>
            {' '}精选
          </h1>
          <p>编辑精选的高质量求职信息，助你高效求职</p>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        {featuredItems.map((item) => (
          <FeaturedCard key={item.id} item={item} />
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link href="/all" className="btn">
          查看全部动态 →
        </Link>
      </div>
    </div>
  );
}
