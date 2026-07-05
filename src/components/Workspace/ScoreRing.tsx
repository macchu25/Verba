import React from 'react';

interface ScoreRingProps {
  score: number;
}

export default function ScoreRing({ score }: ScoreRingProps) {
  const getScoreColor = (val: number) => {
    if (val >= 80) return 'var(--color-success)';
    if (val >= 50) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  const strokeColor = getScoreColor(score);

  return (
    <div style={{ position: 'relative', width: '120px', height: '120px' }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        {/* Track */}
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(46, 59, 38, 0.08)" strokeWidth="8"/>
        {/* Animated circle */}
        <circle 
          cx="60" 
          cy="60" 
          r="50" 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="8"
          strokeDasharray="314" 
          strokeDashoffset={314 - (314 * score) / 100}
          strokeLinecap="round" 
          className="progress-ring-circle" 
        />
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
        <span style={{ fontSize: '30px', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--color-forest)' }}>
          {score}
        </span>
        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '-4px', fontWeight: 700 }}>điểm</span>
      </div>
    </div>
  );
}
