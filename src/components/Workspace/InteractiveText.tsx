import React, { useState, useEffect, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface VocabItem {
  word: string;
  ipa?: string;
  meaning: string;
  example?: string;
}

interface InteractiveTextProps {
  text: string;
  vocabList: VocabItem[];
  isEnToVi: boolean;
}

export default function InteractiveText({ text, vocabList, isEnToVi }: InteractiveTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredVocabIdx, setHoveredVocabIdx] = useState<number | null>(null);
  const [tooltipAlign, setTooltipAlign] = useState<'center' | 'left' | 'right'>('center');

  const [selectedText, setSelectedText] = useState('');
  const [translatedSelection, setTranslatedSelection] = useState('');
  const [popupCoords, setPopupCoords] = useState<{ x: number; y: number } | null>(null);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Keep track of viewport width for mobile layout to avoid hydration issues
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!selectedText) {
      setIsSaved(false);
      return;
    }
    const cleanWord = selectedText.toLowerCase().trim();
    try {
      const stored = localStorage.getItem('verba_personal_vocab');
      if (stored) {
        const list = JSON.parse(stored);
        const exists = list.some((item: any) => item.word.toLowerCase().trim() === cleanWord);
        setIsSaved(exists);
      } else {
        setIsSaved(false);
      }
    } catch (e) {
      setIsSaved(false);
    }
  }, [selectedText]);

  const handleClosePopup = () => {
    setPopupCoords(null);
    setSelectedText('');
    setTranslatedSelection('');
    setIsSaved(false);
  };

  const handleSelection = (target: HTMLElement) => {
    // Wait slightly to get correct selection range
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection) return;

      const selected = selection.toString().trim();
      if (!selected) {
        if (target && target.closest('.selection-translate-popup')) {
          return;
        }
        handleClosePopup();
        return;
      }

      // Check if selection is within our interactive container
      if (!containerRef.current) return;
      let node = selection.anchorNode;
      let isInContainer = false;
      while (node) {
        if (node === containerRef.current) {
          isInContainer = true;
          break;
        }
        node = node.parentNode;
      }

      if (!isInContainer) return;

      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (rect.width > 0 || rect.height > 0) {
          setSelectedText(selected);
          setPopupCoords({
            x: rect.left + rect.width / 2,
            y: rect.top - 8
          });
          setTranslatedSelection('');
        }
      } catch (err) {
        // Selection error
      }
    }, 10);
  };

  useEffect(() => {
    const handleDocumentMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.selection-translate-popup')) {
        handleClosePopup();
      }
    };

    const handleDocumentMouseUp = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.selection-translate-popup')) {
        return;
      }
      handleSelection(target);
    };

    const handleDocumentTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.selection-translate-popup')) {
        handleClosePopup();
      }
    };

    const handleDocumentTouchEnd = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.selection-translate-popup')) {
        return;
      }
      handleSelection(target);
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);
    document.addEventListener('mouseup', handleDocumentMouseUp);
    document.addEventListener('touchstart', handleDocumentTouchStart);
    document.addEventListener('touchend', handleDocumentTouchEnd);

    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
      document.removeEventListener('touchstart', handleDocumentTouchStart);
      document.removeEventListener('touchend', handleDocumentTouchEnd);
    };
  }, []);

  const handleTranslateSelection = async () => {
    if (!selectedText) return;
    try {
      setLoadingTranslation(true);
      const fromLang = isEnToVi ? 'en' : 'vi';
      const toLang = isEnToVi ? 'vi' : 'en';

      const res = await fetch(`${API_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedText,
          from: fromLang,
          to: toLang
        })
      });
      const data = await res.json();
      if (data.success) {
        setTranslatedSelection(data.translatedText);
      } else {
        setTranslatedSelection('Lỗi khi dịch văn bản.');
      }
    } catch (err) {
      setTranslatedSelection('Lỗi kết nối máy chủ.');
    } finally {
      setLoadingTranslation(false);
    }
  };

  const handleSaveToPersonalVocab = () => {
    if (!selectedText || !translatedSelection) return;
    const cleanWord = selectedText.trim();
    const cleanMeaning = translatedSelection.trim();

    // Try to find if it exists in the lesson's vocabList
    const lessonVocab = vocabList.find(v => v.word.toLowerCase().trim() === cleanWord.toLowerCase());

    const newItem = {
      word: cleanWord,
      ipa: lessonVocab?.ipa || '',
      meaning: cleanMeaning,
      example: lessonVocab?.example || '',
      savedAt: Date.now()
    };

    try {
      const stored = localStorage.getItem('verba_personal_vocab');
      let list = stored ? JSON.parse(stored) : [];
      // Remove duplicate if somehow exists
      list = list.filter((item: any) => item.word.toLowerCase().trim() !== cleanWord.toLowerCase());
      list.unshift(newItem); // Add to the top
      localStorage.setItem('verba_personal_vocab', JSON.stringify(list));
      setIsSaved(true);
    } catch (e) {
      console.error('Failed to save word to personal vocabulary', e);
    }
  };

  const getSelectionPopupStyles = () => {
    if (!popupCoords) return {};

    if (isMobile) {
      return {};
    }

    const popupWidth = 280;
    const halfWidth = popupWidth / 2;
    const margin = 16;
    const rightMargin = 36; // Larger margin on the right to clear Windows scrollbars

    let left: string | number = `${popupCoords.x}px`;
    let right: string | number = 'auto';
    let transform = 'translate(-50%, -100%)';

    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;

    if (popupCoords.x - halfWidth < margin) {
      left = `${margin}px`;
      transform = 'translate(0, -100%)';
    } else if (popupCoords.x + halfWidth > windowWidth - rightMargin) {
      left = 'auto';
      right = `${rightMargin}px`;
      transform = 'translate(0, -100%)';
    }

    return {
      position: 'fixed' as const,
      left,
      right,
      top: `${popupCoords.y}px`,
      transform,
      zIndex: 9999,
      pointerEvents: 'auto' as const
    };
  };

  const renderContent = () => {
    if (!text) return null;

    if (!isEnToVi) {
      // If not English-to-Vietnamese, original text is Vietnamese, so no tokenization is needed
      return <p className="workspace-source-text">{text}</p>;
    }

    const tokens = text.split(/(\s+|[.,\/#!$%\^&\*;:{}=\-_`~()?"'“’])/);

    return (
      <p className="workspace-source-text">
        {tokens.map((token, idx) => {
          const cleaned = token.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'“’]/g, '').trim();
          if (!cleaned) return <span key={idx}>{token}</span>;

          const vocab = vocabList.find(v => v.word.toLowerCase() === cleaned);

          if (vocab) {
            const isHovered = hoveredVocabIdx === idx;
            return (
              <span
                key={idx}
                className="interactive-word"
                style={{ fontWeight: '600', position: 'relative' }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const spaceRight = window.innerWidth - rect.right;
                  const spaceLeft = rect.left;
                  if (spaceRight < 140) {
                    setTooltipAlign('right');
                  } else if (spaceLeft < 140) {
                    setTooltipAlign('left');
                  } else {
                    setTooltipAlign('center');
                  }
                  setHoveredVocabIdx(idx);
                }}
                onMouseLeave={() => {
                  setHoveredVocabIdx(null);
                  setTooltipAlign('center');
                }}
              >
                {token}
                {isHovered && (
                  <span className={`tooltip-bubble align-${tooltipAlign} animate-bouncein`}>
                    <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', gap: '8px' }}>
                      <strong style={{ color: 'var(--color-forest)', fontSize: '15px' }}>{vocab.word}</strong>
                      {vocab.ipa && <span style={{ color: '#64748b', fontSize: '11px', fontFamily: 'Outfit' }}>{vocab.ipa}</span>}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--color-forest)', display: 'block', marginBottom: '6px', fontWeight: 'normal' }}>
                      {vocab.meaning}
                    </span>
                    {vocab.example && (
                      <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '4px', display: 'block', fontWeight: 'normal' }}>
                        Ex: {vocab.example}
                      </span>
                    )}
                  </span>
                )}
              </span>
            );
          }

          return <span key={idx}>{token}</span>;
        })}
      </p>
    );
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {renderContent()}

      {/* Backdrop overlay for mobile to lock focus and tap-to-close */}
      {popupCoords && isMobile && (
        <div
          onClick={handleClosePopup}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 9998
          }}
        />
      )}

      {popupCoords && (
        <div
          className={`selection-translate-popup ${isMobile ? 'selection-bottom-sheet animate-slideup' : 'animate-bouncein'}`}
          style={getSelectionPopupStyles()}
        >
          {!translatedSelection && !loadingTranslation ? (
            <button
              onClick={handleTranslateSelection}
              className="selection-btn-trigger"
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
            >
              🔍 Dịch đoạn chọn
            </button>
          ) : (
            <div
              className="selection-popup-content"
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-sage)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Bản dịch đoạn bôi đen
                </span>
                <button
                  onClick={handleClosePopup}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-forest)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 800,
                    padding: '0 4px'
                  }}
                >
                  ✕
                </button>
              </div>
              
              <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                "{selectedText}"
              </div>

              <div style={{ borderTop: '1.5px dashed rgba(46, 59, 38, 0.1)', paddingTop: '8px' }}>
                {loadingTranslation ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-sage)' }}>
                    <div style={{ width: '12px', height: '12px', border: '2px solid rgba(125,160,101,0.2)', borderTopColor: 'var(--color-sage)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Đang dịch...</span>
                  </div>
                 ) : (
                  <>
                    <p style={{ fontSize: '14px', fontWeight: 600, margin: 0, whiteSpace: 'pre-wrap' }}>
                      {translatedSelection}
                    </p>
                    {translatedSelection && !translatedSelection.startsWith('Lỗi') && (
                      <button
                        onClick={handleSaveToPersonalVocab}
                        disabled={isSaved}
                        style={{
                          marginTop: '12px',
                          width: '100%',
                          padding: '8px 12px',
                          background: isSaved ? '#e2e8f0' : 'var(--color-sage)',
                          color: isSaved ? '#64748b' : '#ffffff',
                          border: isSaved ? '1.5px solid #cbd5e1' : '1.5px solid var(--color-sage)',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: isSaved ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontFamily: 'Outfit, sans-serif',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSaved ? '✓ Đã lưu vào từ điển' : '⭐ Lưu vào từ điển cá nhân'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
