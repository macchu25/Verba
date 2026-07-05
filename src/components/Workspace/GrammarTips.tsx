import React from 'react';

interface GrammarItem {
  structure: string;
  explanation: string;
  example?: string;
}

interface GrammarTipsProps {
  grammar: GrammarItem[];
}

export default function GrammarTips({ grammar }: GrammarTipsProps) {
  if (!grammar || grammar.length === 0) return null;

  return (
    <div className="glass-panel animate-slideup" style={{ padding: '24px', background: '#fcfaf2', border: '3px solid var(--color-forest)', boxShadow: 'var(--shadow-earthy)', borderRadius: '20px' }}>
      <h3 style={{ fontSize: '15px', color: 'var(--color-forest)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
        Ngữ pháp cần lưu ý
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {grammar.map((g, idx) => (
          <div key={idx} style={{ paddingLeft: '12px', borderLeft: '3px solid var(--color-sage)' }}>
            <h4 style={{ fontSize: '15px', color: 'var(--color-forest)', marginBottom: '4px', fontWeight: 700, fontFamily: 'Outfit' }}>{g.structure}</h4>
            <p style={{ fontSize: '13px', color: '#2c3527', marginBottom: '4px', lineHeight: '1.4' }}>{g.explanation}</p>
            {g.example && (
              <p style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                Ví dụ: {g.example}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
