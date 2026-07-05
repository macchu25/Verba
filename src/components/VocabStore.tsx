import React, { useState, useMemo, useEffect } from 'react';

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
  const [vocabTab, setVocabTab] = useState<'suggested' | 'personal'>('suggested');
  const [personalVocab, setPersonalVocab] = useState<AggregatedVocab[]>([]);

  // Function to load personal vocabulary from localStorage
  const loadPersonalVocab = () => {
    try {
      const stored = localStorage.getItem('verba_personal_vocab');
      if (stored) {
        const list = JSON.parse(stored);
        setPersonalVocab(
          list.map((item: any) => ({
            word: item.word,
            ipa: item.ipa || '',
            meaning: item.meaning,
            example: item.example || '',
            lessonTitle: 'Từ bôi đen cá nhân',
            lessonId: 'personal'
          }))
        );
      } else {
        setPersonalVocab([]);
      }
    } catch (e) {
      setPersonalVocab([]);
    }
  };

  // Load personal vocabulary on tab change or mount
  useEffect(() => {
    loadPersonalVocab();
  }, [vocabTab]);

  const handleDeletePersonalWord = (wordToDelete: string) => {
    try {
      const stored = localStorage.getItem('verba_personal_vocab');
      if (stored) {
        let list = JSON.parse(stored);
        list = list.filter((item: any) => item.word.toLowerCase().trim() !== wordToDelete.toLowerCase().trim());
        localStorage.setItem('verba_personal_vocab', JSON.stringify(list));
        loadPersonalVocab();
      }
    } catch (e) {
      console.error(e);
    }
  };

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

  const currentList = vocabTab === 'suggested' ? allVocab : personalVocab;

  const filteredVocab = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return currentList;
    return currentList.filter(
      (v) =>
        v.word.toLowerCase().includes(q) ||
        v.meaning.toLowerCase().includes(q) ||
        (v.example && v.example.toLowerCase().includes(q))
    );
  }, [currentList, searchQuery]);

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
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <h3 style={{ fontSize: '20px', color: 'var(--color-forest)', fontFamily: 'Outfit' }}>
          📚 Kho từ vựng của bạn
        </h3>
        <p style={{ color: '#4f6b3e', fontSize: '14px', lineHeight: '1.5' }}>
          Tìm kiếm nhanh các từ vựng học thuật hoặc tra cứu các từ mới bạn đã tự tay lưu trong quá trình dịch thuật.
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

      {/* Tab Selector */}
      <div 
        style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '24px'
        }}
      >
        <button
          onClick={() => {
            setVocabTab('suggested');
            setSearchQuery('');
          }}
          className={`btn ${vocabTab === 'suggested' ? 'btn-primary' : 'btn-secondary'}`}
          style={{
            borderRadius: '12px',
            borderWidth: '2.5px',
            padding: '10px 20px',
            fontWeight: 700,
            fontSize: '14.5px',
            boxShadow: vocabTab === 'suggested' ? '3px 3px 0px var(--color-forest)' : 'none',
            transform: vocabTab === 'suggested' ? 'translate(-1px, -1px)' : 'none'
          }}
        >
          💡 Từ vựng gợi ý ({allVocab.length})
        </button>
        <button
          onClick={() => {
            setVocabTab('personal');
            setSearchQuery('');
          }}
          className={`btn ${vocabTab === 'personal' ? 'btn-primary' : 'btn-secondary'}`}
          style={{
            borderRadius: '12px',
            borderWidth: '2.5px',
            padding: '10px 20px',
            fontWeight: 700,
            fontSize: '14.5px',
            boxShadow: vocabTab === 'personal' ? '3px 3px 0px var(--color-forest)' : 'none',
            transform: vocabTab === 'personal' ? 'translate(-1px, -1px)' : 'none'
          }}
        >
          ⭐ Từ vựng cá nhân ({personalVocab.length})
        </button>
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
                position: 'relative',
                transition: 'var(--transition-elastic)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '20px', color: 'var(--color-forest)', fontFamily: 'Outfit' }}>
                      {vocab.word}
                    </strong>
                    {vocab.ipa && (
                      <span style={{ fontSize: '13px', color: '#64748b', fontFamily: 'Outfit', fontWeight: 600 }}>
                        {vocab.ipa}
                      </span>
                    )}
                  </div>
                  {vocabTab === 'personal' && (
                    <button
                      onClick={() => handleDeletePersonalWord(vocab.word)}
                      title="Xóa khỏi từ điển cá nhân"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#f43f5e',
                        cursor: 'pointer',
                        fontSize: '15px',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.1s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                    >
                      🗑️
                    </button>
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
            {vocabTab === 'personal' ? 'Từ điển cá nhân đang trống' : 'Không tìm thấy từ vựng tương ứng'}
          </h4>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {vocabTab === 'personal' 
              ? 'Hãy bôi đen văn bản trong các bài dịch và bấm "Lưu vào từ điển cá nhân" để lưu từ mới nhé!' 
              : 'Hãy thử tìm bằng từ khóa khác hoặc kiểm tra lại chính tả.'}
          </p>
        </div>
      )}
    </div>
  );
}
