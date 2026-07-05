import React from 'react';
import Link from 'next/link';

interface LessonCardProps {
  id: string;
  title: string;
  direction: 'en-to-vi' | 'vi-to-en';
  highestScore: number | null;
}

export default function LessonCard({ id, title, direction, highestScore }: LessonCardProps) {
  const isPassed = highestScore !== null && highestScore >= 50;

  return (
    <Link 
      href={`/lessons/${id}?dir=${direction}`}
      className="glass-panel"
      style={{ 
        padding: '18px', 
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '12px',
        background: '#ffffff',
        textDecoration: 'none',
        color: 'inherit',
        border: '2.5px solid var(--color-forest)',
        borderColor: highestScore !== null 
          ? (isPassed ? 'var(--color-success)' : 'var(--color-danger)') 
          : 'var(--color-forest)',
        borderRadius: '16px',
        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.1)'
      }}
    >
      <h5 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-forest)' }}>{title}</h5>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>Dịch ngay ➔</span>
        
        {highestScore !== null && (
          <span 
            style={{ 
              fontSize: '12px', 
              fontWeight: 800, 
              fontFamily: 'Outfit',
              color: isPassed ? '#10b981' : '#f43f5e',
              background: isPassed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
              padding: '2px 8px',
              borderRadius: '6px',
              border: `1.5px solid ${isPassed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`
            }}
          >
            Điểm: {highestScore}%
          </span>
        )}
      </div>
    </Link>
  );
}
