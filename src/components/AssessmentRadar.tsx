import type { CSSProperties } from 'react';
import styles from './AssessmentReport.module.css';

export type AssessmentMetric = {
  key: string;
  label: string;
  shortLabel: string;
  score: number;
  maxScore: number;
  color: string;
};

type AssessmentRadarProps = {
  metrics: AssessmentMetric[];
  title: string;
};

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = 108;
const LEVELS = [0.25, 0.5, 0.75, 1];

function pointAt(index: number, total: number, radius: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
}

function pointsToString(points: Array<{ x: number; y: number }>) {
  return points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
}

export function AssessmentRadar({ metrics, title }: AssessmentRadarProps) {
  const gridPolygons = LEVELS.map((level) =>
    pointsToString(metrics.map((_, index) => pointAt(index, metrics.length, RADIUS * level)))
  );
  const resultPoints = metrics.map((metric, index) => {
    const ratio = Math.max(0, Math.min(metric.score / metric.maxScore, 1));
    return pointAt(index, metrics.length, RADIUS * ratio);
  });

  return (
    <div className={styles.radarWrap}>
      <svg className={styles.radar} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={title}>
        <title>{title}</title>
        <desc>{metrics.map((metric) => `${metric.label}${metric.score}分`).join('，')}</desc>
        {gridPolygons.map((points, index) => (
          <polygon key={points} points={points} className={index === LEVELS.length - 1 ? styles.radarGridOuter : styles.radarGrid} />
        ))}
        {metrics.map((_, index) => {
          const point = pointAt(index, metrics.length, RADIUS);
          return <line key={index} x1={CENTER} y1={CENTER} x2={point.x} y2={point.y} className={styles.radarAxis} />;
        })}
        <polygon points={pointsToString(resultPoints)} className={styles.radarArea} />
        {resultPoints.map((point, index) => (
          <circle
            key={metrics[index].key}
            cx={point.x}
            cy={point.y}
            r="4.5"
            fill={metrics[index].color}
            className={styles.radarDot}
          />
        ))}
        {metrics.map((metric, index) => {
          const point = pointAt(index, metrics.length, RADIUS + 31);
          return (
            <g key={metric.key} transform={`translate(${point.x} ${point.y})`}>
              <text textAnchor="middle" dominantBaseline="middle" className={styles.radarLabel}>{metric.shortLabel}</text>
              <text y="17" textAnchor="middle" dominantBaseline="middle" className={styles.radarScore}>{metric.score}</text>
            </g>
          );
        })}
      </svg>
      <p className={styles.radarHint}>越靠近外圈，代表本次作答中该维度越突出</p>
    </div>
  );
}

export function ScoreBars({ metrics }: { metrics: AssessmentMetric[] }) {
  return (
    <div className={styles.scoreBars}>
      {metrics.map((metric, index) => {
        const percent = Math.round((metric.score / metric.maxScore) * 100);
        return (
          <div className={styles.scoreRow} key={metric.key}>
            <div className={styles.scoreMeta}>
              <span className={styles.scoreRank}>{String(index + 1).padStart(2, '0')}</span>
              <strong>{metric.label}</strong>
              <span>{metric.score} / {metric.maxScore}</span>
            </div>
            <div className={styles.scoreTrack}>
              <span
                className={styles.scoreFill}
                style={{
                  '--metric-color': metric.color,
                  '--metric-width': `${percent}%`,
                } as CSSProperties}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
