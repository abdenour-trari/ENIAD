import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const REFLEX_META = {
  'Moro':          { color: '#EF4444', bg: '#FEE2E2', desc: 'Startle / hypersensitivity' },
  'ATNR':          { color: '#F59E0B', bg: '#FEF9C3', desc: 'Midline crossing' },
  'STNR':          { color: '#8B5CF6', bg: '#EDE9FE', desc: 'Posture / sitting' },
  'TLR':           { color: '#3B82F6', bg: '#DBEAFE', desc: 'Balance / postural tone' },
  'Spinal Galant': { color: '#10B981', bg: '#D1FAE5', desc: 'Trunk coordination' },
  'Palmar Grasp':  { color: '#0D5E6B', bg: '#C8E8ED', desc: 'Fine motor / grip' },
};

export default function ReflexScoreCard({ reflex, score, confidence, trend, compact }) {
  const meta = REFLEX_META[reflex] || { color: '#6B7280', bg: '#F3F4F6', desc: '' };
  const numScore = Number(score) || 0;

  const TrendIcon = trend === 'improving' ? TrendingUp
    : trend === 'declining' ? TrendingDown
    : Minus;
  const trendColor = trend === 'improving' ? '#10B981'
    : trend === 'declining' ? '#EF4444'
    : '#9CA3AF';

  const badgeColor = confidence === 'High' ? '#EF4444'
    : confidence === 'Medium' ? '#F59E0B'
    : '#10B981';

  if (compact) {
    return (
      <div style={{ ...styles.compactCard, borderLeft: `3px solid ${meta.color}` }}>
        <div style={styles.compactTop}>
          <span style={{ ...styles.dot, background: meta.color }} />
          <span style={styles.compactName}>{reflex}</span>
          <span style={{ ...styles.confBadge, background: badgeColor + '20', color: badgeColor }}>
            {confidence}
          </span>
        </div>
        <div style={styles.compactScore}>{numScore}</div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${numScore}%`, background: meta.color }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.card, background: meta.bg }}>
      <div style={styles.top}>
        <div>
          <div style={styles.name}>{reflex}</div>
          <div style={styles.desc}>{meta.desc}</div>
        </div>
        <TrendIcon size={16} color={trendColor} />
      </div>

      <div style={styles.scoreRow}>
        <span style={{ ...styles.scoreNum, color: meta.color }}>{numScore}</span>
        <span style={styles.scoreMax}>/100</span>
      </div>

      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${numScore}%`, background: meta.color }} />
      </div>

      <div style={styles.bottom}>
        <span style={{ ...styles.confBadge, background: badgeColor + '25', color: badgeColor }}>
          {confidence} confidence
        </span>
        <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>
          {numScore >= 70 ? 'On Track' : numScore >= 50 ? 'Monitor' : 'Action needed'}
        </span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    borderRadius: 12,
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  top: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  name: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700, fontSize: '0.9rem',
    color: '#1F2937',
  },
  desc: {
    fontSize: '0.72rem', color: '#6B7280', marginTop: 1,
  },
  scoreRow: { display: 'flex', alignItems: 'baseline', gap: 2 },
  scoreNum: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 800, fontSize: '1.8rem',
  },
  scoreMax: { fontSize: '0.75rem', color: '#9CA3AF' },
  progressBar: {
    height: 6, background: 'rgba(0,0,0,0.08)',
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', borderRadius: 3,
    transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
  },
  bottom: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  confBadge: {
    padding: '2px 8px',
    borderRadius: 99,
    fontSize: '0.7rem', fontWeight: 600,
  },
  // Compact
  compactCard: {
    background: '#fff', borderRadius: 8,
    padding: '10px 12px',
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  compactTop: {
    display: 'flex', alignItems: 'center', gap: 6,
  },
  dot: {
    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
  },
  compactName: {
    fontSize: '0.8rem', fontWeight: 600, color: '#1F2937', flex: 1,
  },
  compactScore: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 800, fontSize: '1.2rem', color: '#1F2937',
  },
};
