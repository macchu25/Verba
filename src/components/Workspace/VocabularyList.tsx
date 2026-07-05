import React from 'react';

interface VocabItem {
  word: string;
  ipa?: string;
  meaning: string;
  example?: string;
}

interface VocabularyListProps {
  vocabulary: VocabItem[];
}

export default function VocabularyList({ vocabulary }: VocabularyListProps) {
  if (!vocabulary || vocabulary.length === 0) return null;

  return (
    <div className="glass-panel animate-slideup" style={{ padding: '24px', background: '#fcfaf2', border: '3px solid var(--color-forest)', boxShadow: 'var(--shadow-earthy)', borderRadius: '20px' }}>
      <h3 style={{ fontSize: '15px', color: 'var(--color-forest)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
        Từ vựng quan trọng (Glossary)
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {vocabulary.map((vocab, idx) => (
          <div 
            key={idx} 
            style={{ paddingBottom: '12px', borderBottom: idx < vocabulary.length - 1 ? '1.5px solid rgba(46, 59, 38, 0.08)' : 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <strong style={{ color: 'var(--color-forest)', fontSize: '16px', fontFamily: 'Outfit' }}>{vocab.word}</strong>
              {vocab.ipa && <span style={{ color: '#64748b', fontSize: '12px', fontFamily: 'Outfit' }}>{vocab.ipa}</span>}
            </div>
            <p style={{ fontSize: '14px', color: '#2c3527', fontWeight: 600 }}>{vocab.meaning}</p>
            {vocab.example && (
              <p style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
                Ex: {vocab.example}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
