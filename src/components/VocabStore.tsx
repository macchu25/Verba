import React, { useState, useMemo } from 'react';

interface VocabItem {
  word: string;
  ipa?: string;
  meaning: string;
  example?: string;
}

interface Lesson {
  _id: string;
  title: string;
  levelCode: string;
  vocabulary: VocabItem[];
}

interface VocabStoreProps {
  lessons: Lesson[];
}

interface AggregatedVocab extends VocabItem {
  lessonTitle: string;
  lessonId: string;
}

export default function VocabStore({ lessons }: VocabStoreProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const allVocab = useMemo(() => {
    const list: AggregatedVocab[] = [];
    const seenWords = new Set<string>();

    lessons.forEach((lesson) => {
      if (lesson.vocabulary && Array.isArray(lesson.vocabulary)) {
        lesson.vocabulary.forEach((vocab) => {
          const lowerWord = vocab.word.toLowerCase().trim();
          if (!seenWords.has(lowerWord)) {
            seenWords.add(lowerWord);
            list.push({
              ...vocab,
              lessonTitle: lesson.title,
              lessonId: lesson._id
            });
          }
        });
      }
    });

    return list;
  }, [lessons]);

  const filteredVocab = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allVocab;
    return allVocab.filter(
      (v) =>
        v.word.toLowerCase().includes(q) ||
        v.meaning.toLowerCase().includes(q) ||
        (v.example && v.example.toLowerCase().includes(q))
    );
  }, [allVocab, searchQuery]);

  return (
    <div className="animate-slideup" style={{ marginTop: '20px' }}>
      {/* Search Header panel */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '24px', 
          background: '#fcfaf2', 
          border: '3px solid var(--color-forest)', 
          boxShadow: 'var(--shadow-earthy)', 
          borderRadius: '20px',
          marginBottom: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <h3 style={{ fontSize: '20px', color: 'var(--color-forest)', fontFamily: 'Outfit' }}>
          📚 Kho từ vựng của bạn
        </h3>
        <p style={{ color: '#4f6b3e', fontSize: '14px', lineHeight: '1.5' }}>
          Tổng hợp tất cả từ vựng quan trọng từ lộ trình bài học dịch thuật. Nhập từ cần tìm kiếm bên dưới để tra từ điển nhanh.
        </p>

        <div style={{ position: 'relative', marginTop: '6px' }}>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm từ tiếng Anh hoặc nghĩa tiếng Việt..."
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: '2.5px solid var(--color-forest)',
              fontSize: '15px',
              fontFamily: 'var(--font-primary)',
              color: 'var(--color-forest)',
              outline: 'none',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)'
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--color-sage)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '14px'
              }}
            >
              Xóa
            </button>
          )}
        </div>
      </div>

      {/* Vocabulary Grid list */}
      {filteredVocab.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredVocab.map((vocab, idx) => (
            <div 
              key={idx}
              className="glass-panel"
              style={{
                padding: '20px',
                background: '#ffffff',
                border: '3px solid var(--color-forest)',
                boxShadow: 'var(--shadow-earthy)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                transition: 'var(--transition-elastic)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <strong style={{ fontSize: '20px', color: 'var(--color-forest)', fontFamily: 'Outfit' }}>
                    {vocab.word}
                  </strong>
                  {vocab.ipa && (
                    <span style={{ fontSize: '13px', color: '#64748b', fontFamily: 'Outfit', fontWeight: 600 }}>
                      {vocab.ipa}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '15px', color: '#2c3527', marginTop: '6px', fontWeight: 700 }}>
                  {vocab.meaning}
                </p>
                {vocab.example && (
                  <p style={{ fontSize: '12.5px', color: '#64748b', fontStyle: 'italic', marginTop: '8px', borderLeft: '3px solid var(--color-sage)', paddingLeft: '8px', lineHeight: '1.45' }}>
                    &ldquo;{vocab.example}&rdquo;
                  </p>
                )}
              </div>

              {/* Lesson Source tag footer */}
              <div style={{ borderTop: '1.5px dashed rgba(46,59,38,0.08)', paddingTop: '10px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Nguồn:</span>
                <span style={{ fontSize: '11px', background: 'rgba(125,160,101,0.1)', color: 'var(--color-forest)', border: '1px solid rgba(46,59,38,0.12)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, maxWidth: '170px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={vocab.lessonTitle}>
                  {vocab.lessonTitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '48px 24px', 
            textAlign: 'center', 
            background: '#ffffff', 
            border: '3px solid var(--color-forest)', 
            boxShadow: 'var(--shadow-earthy)', 
            borderRadius: '20px' 
          }}
        >
          <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>🔍</span>
          <h4 style={{ color: 'var(--color-forest)', fontSize: '18px', fontFamily: 'Outfit', marginBottom: '8px' }}>
            Không tìm thấy từ vựng tương ứng
          </h4>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Hãy thử tìm bằng từ khóa khác hoặc kiểm tra lại chính tả.
          </p>
        </div>
      )}
    </div>
  );
}
