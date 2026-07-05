import React, { useState, useEffect, useMemo } from 'react';

interface TranslationFormProps {
  sourceText: string;
  targetText: string;
  vocabList: Array<{ word: string; meaning: string }>;
  userTranslation: string;
  setUserTranslation: (text: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  keywords: string[];
  isEnToVi: boolean;
}

interface SentenceFeedback {
  status: 'empty' | 'correct' | 'incorrect';
  hint?: string;
}

const viStopWords = new Set([
  'của', 'ở', 'trong', 'tại', 'với', 'và', 'thì', 'là', 'mà', 'con', 'cái', 
  'chiếc', 'đoạn', 'bài', 'vào', 'để', 'vì', 'cho', 'một', 'những', 'các'
]);

const enStopWords = new Set([
  'the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'with', 'and', 'is', 'am', 
  'are', 'was', 'were', 'been', 'be', 'for', 'because', 'my', 'his', 'her', 
  'their', 'your', 'its', 'our'
]);

// Convert digits to word representations to handle formatting differences
const convertDigitsToWords = (str: string, isEnToVi: boolean): string => {
  const viDigits: { [key: string]: string } = {
    '0': 'không', '1': 'một', '2': 'hai', '3': 'ba', '4': 'bốn',
    '5': 'năm', '6': 'sáu', '7': 'bảy', '8': 'tám', '9': 'chín'
  };
  const enDigits: { [key: string]: string } = {
    '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
    '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine'
  };
  
  const map = isEnToVi ? viDigits : enDigits;
  return str.replace(/\b[0-9]\b/g, (match) => map[match] || match);
};

// Tokenize and clean text by removing punctuation and extra spacing
const cleanAndTokenize = (str: string, isEnToVi: boolean): string[] => {
  const normalized = convertDigitsToWords(str.trim().toLowerCase(), isEnToVi);
  return normalized
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?:/–]/g, "")
    .replace(/\s+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
};

// Client-side sentence evaluation helper
const getSentenceFeedback = (
  userText: string,
  referenceText: string,
  sourceText: string,
  vocabList: Array<{ word: string; meaning: string }> = [],
  isEnToVi: boolean
): SentenceFeedback => {
  const cleanUser = userText.trim().toLowerCase();
  if (!cleanUser) {
    return { status: 'empty' };
  }

  // Helper to remove punctuation
  const removePunctuation = (str: string) => 
    str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?:/–]/g, "").replace(/\s+/g, " ").trim();
  
  const userCleaned = removePunctuation(cleanUser);
  const refCleaned = removePunctuation(referenceText.toLowerCase());

  // 1. Direct exact match check
  if (userCleaned === refCleaned) {
    return { status: 'correct' };
  }

  const userWords = cleanAndTokenize(userText, isEnToVi);
  const refWords = cleanAndTokenize(referenceText, isEnToVi);

  // 2. Capitalized proper nouns check (excluding first word of sentence)
  const refWordsWithCasing = referenceText.split(/\s+/).filter(Boolean);
  if (refWordsWithCasing.length > 1) {
    const properNouns = refWordsWithCasing.slice(1).filter(w => {
      const raw = w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?:–]/g, "");
      return raw && raw[0] === raw[0].toUpperCase() && raw[0] !== raw[0].toLowerCase();
    }).map(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?:–]/g, "").toLowerCase());

    for (const noun of properNouns) {
      if (!userCleaned.includes(noun)) {
        return {
          status: 'incorrect',
          hint: `💡 Gợi ý: Hãy kiểm tra xem bạn đã dịch đúng tên riêng hoặc danh từ riêng "${refWordsWithCasing.find(w => w.toLowerCase().includes(noun))?.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?:–]/g, "")}" chưa.`
        };
      }
    }
  }

  // 3. Grammatical Tense Verification
  if (isEnToVi) {
    // Continuous aspect (đang)
    if (refWords.includes('đang') && !userWords.includes('đang')) {
      return {
        status: 'incorrect',
        hint: '💡 Gợi ý: Hãy chú ý dịch đúng thì tiếp diễn (ví dụ: thêm từ "đang" để thể hiện hành động đang diễn ra).'
      };
    }
    // Past aspect (đã, từng)
    const pastIndicators = ['đã', 'từng'];
    const refHasPast = refWords.some(w => pastIndicators.includes(w));
    const userHasPast = userWords.some(w => pastIndicators.includes(w));
    if (refHasPast && !userHasPast) {
      return {
        status: 'incorrect',
        hint: '💡 Gợi ý: Hãy chú ý dịch đúng thì quá khứ (ví dụ: sử dụng từ chỉ thời gian quá khứ hoặc trạng từ "đã", "từng").'
      };
    }
    // Future aspect (sẽ, sắp)
    const futureIndicators = ['sẽ', 'sắp'];
    const refHasFuture = refWords.some(w => futureIndicators.includes(w));
    const userHasFuture = userWords.some(w => futureIndicators.includes(w));
    if (refHasFuture && !userHasFuture) {
      return {
        status: 'incorrect',
        hint: '💡 Gợi ý: Hãy chú ý dịch đúng thì tương lai (ví dụ: thêm từ "sẽ" hoặc "sắp").'
      };
    }
  } else {
    // English translation tense checks
    // Continuous aspect
    const refHasContinuous = refWords.some(w => ['am', 'is', 'are', 'was', 'were'].includes(w)) || referenceText.toLowerCase().includes('ing');
    const userHasContinuous = userWords.some(w => ['am', 'is', 'are', 'was', 'were'].includes(w)) || userText.toLowerCase().includes('ing');
    if (refHasContinuous && !userHasContinuous) {
      return {
        status: 'incorrect',
        hint: '💡 Gợi ý: Hãy dịch đúng cấu trúc thì tiếp diễn trong tiếng Anh (ví dụ: "am/is/are + V-ing").'
      };
    }
    // Future aspect
    const refHasFuture = refWords.some(w => ['will', 'shall', 'going'].includes(w));
    const userHasFuture = userWords.some(w => ['will', 'shall', 'going'].includes(w));
    if (refHasFuture && !userHasFuture) {
      return {
        status: 'incorrect',
        hint: '💡 Gợi ý: Hãy chú ý dịch đúng thì tương lai (ví dụ: sử dụng động từ khuyết thiếu "will" hoặc cấu trúc "be going to").'
      };
    }
    // Past aspect
    const refHasPast = refWords.some(w => ['did', 'was', 'were', 'had', 'went', 'saw', 'ate', 'took', 'made', 'gave', 'came'].includes(w)) || refWords.some(w => w.endsWith('ed'));
    const userHasPast = userWords.some(w => ['did', 'was', 'were', 'had', 'went', 'saw', 'ate', 'took', 'made', 'gave', 'came'].includes(w)) || userWords.some(w => w.endsWith('ed'));
    if (refHasPast && !userHasPast) {
      return {
        status: 'incorrect',
        hint: '💡 Gợi ý: Hãy chú ý dịch đúng thì quá khứ (sử dụng động từ ở dạng quá khứ V2 hoặc thêm đuôi "-ed").'
      };
    }
  }

  // 4. Content Words Presence Check
  // Ensures that all non-grammatical keywords (nouns, verbs, adjectives) must be present
  const stopWords = isEnToVi ? viStopWords : enStopWords;
  const refContentWords = refWords.filter(w => !stopWords.has(w));
  
  for (const refWord of refContentWords) {
    const hasWord = userWords.some(uw => uw.includes(refWord) || refWord.includes(uw));
    if (!hasWord) {
      return {
        status: 'incorrect',
        hint: `💡 Gợi ý: Hãy dịch sát nghĩa hơn. Bản dịch của bạn đang thiếu hoặc dịch chưa đúng từ khóa "${refWord}".`
      };
    }
  }

  // 5. Recall Overlap Coefficient (Jaccard Recall)
  const userSet = new Set(userWords);
  const refSet = new Set(refWords);

  let intersectionCount = 0;
  refSet.forEach(w => {
    if (userSet.has(w)) {
      intersectionCount++;
    }
  });

  const recall = refSet.size > 0 ? intersectionCount / refSet.size : 0;
  const threshold = 0.75;

  if (recall >= threshold) {
    return { status: 'correct' };
  }

  // Helper to strip accents for Vietnamese typing verification
  const removeVietnameseAccents = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd');
  };

  // 6. Accent mark check
  if (isEnToVi) {
    const userNoAccentWords = userWords.map(w => removeVietnameseAccents(w));
    const refNoAccentWords = refWords.map(w => removeVietnameseAccents(w));
    
    const userNoAccentSet = new Set(userNoAccentWords);
    const refNoAccentSet = new Set(refNoAccentWords);
    
    let noAccentIntersection = 0;
    refNoAccentSet.forEach(w => {
      if (userNoAccentSet.has(w)) {
        noAccentIntersection++;
      }
    });
    
    const noAccentRecall = refNoAccentSet.size > 0 ? noAccentIntersection / refNoAccentSet.size : 0;
    
    if (noAccentRecall >= threshold) {
      return {
        status: 'incorrect',
        hint: '💡 Gợi ý: Gần chính xác! Hãy kiểm tra lại các dấu tiếng Việt.'
      };
    }
  }

  // 7. Vocab dictionary presence check
  const activeVocabs = vocabList.filter(v => {
    const wordPattern = new RegExp(`\\b${v.word.toLowerCase()}\\b`, 'i');
    return isEnToVi 
      ? wordPattern.test(sourceText)
      : new RegExp(`\\b${removeVietnameseAccents(v.meaning.toLowerCase())}\\b`, 'i').test(removeVietnameseAccents(sourceText));
  });

  for (const vocab of activeVocabs) {
    const targetMeaningClean = removePunctuation(vocab.meaning.toLowerCase());
    const targetWordClean = removePunctuation(vocab.word.toLowerCase());
    
    if (isEnToVi) {
      const meaningWords = targetMeaningClean.split(/\s+/);
      const isMissing = !meaningWords.every(w => userCleaned.includes(w));
      if (isMissing) {
        return {
          status: 'incorrect',
          hint: `💡 Gợi ý: Hãy đảm bảo bạn đã dịch đúng nghĩa của từ khóa "${vocab.word}".`
        };
      }
    } else {
      if (!userCleaned.includes(targetWordClean)) {
        return {
          status: 'incorrect',
          hint: `💡 Gợi ý: Có phải bạn đang thiếu hoặc dịch sai từ khóa tương ứng với "${vocab.meaning}"?`
        };
      }
    }
  }

  // 8. Length check
  if (userWords.length < refWords.length / 2) {
    return {
      status: 'incorrect',
      hint: '💡 Gợi ý: Bản dịch hơi ngắn, hãy bổ sung đầy đủ các vế câu.'
    };
  }

  // 9. Fallback warning
  return {
    status: 'incorrect',
    hint: '💡 Gợi ý: Có từ hoặc cụm từ dịch chưa chính xác. Hãy kiểm tra kỹ thì động từ hoặc cách chọn từ ngữ.'
  };
};

export default function TranslationForm({
  sourceText,
  targetText,
  vocabList,
  userTranslation,
  setUserTranslation,
  onSubmit,
  submitting,
  keywords,
  isEnToVi
}: TranslationFormProps) {
  const [showHint, setShowHint] = useState(false);

  // Split source text into sentences
  const sentences = useMemo(() => {
    if (!sourceText) return [];
    return sourceText.match(/[^.!?]+[.!?]+(\s+|$)/g) || [sourceText];
  }, [sourceText]);

  // Split target text into reference sentences
  const referenceSentences = useMemo(() => {
    if (!targetText) return [];
    return targetText.match(/[^.!?]+[.!?]+(\s+|$)/g) || [targetText];
  }, [targetText]);

  // Local state for each sentence translation
  const [sentenceTranslations, setSentenceTranslations] = useState<string[]>([]);

  // Initialize/reset sentence translations when sentences list changes
  useEffect(() => {
    setSentenceTranslations(new Array(sentences.length).fill(''));
    setUserTranslation(''); // reset parent state
  }, [sentences, setUserTranslation]);

  // Handle single sentence input change
  const handleSentenceChange = (index: number, val: string) => {
    const nextTranslations = [...sentenceTranslations];
    nextTranslations[index] = val;
    setSentenceTranslations(nextTranslations);

    // Combine them to update parent userTranslation state
    const combined = nextTranslations.map((s) => s.trim()).filter(Boolean).join(' ');
    setUserTranslation(combined);
  };

  return (
    <div 
      className="glass-panel animate-slideup" 
      style={{ 
        padding: '24px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px',
        background: '#fcfaf2',
        border: '3px solid var(--color-forest)',
        boxShadow: 'var(--shadow-earthy)',
        borderRadius: '20px'
      }}
    >
      {/* Header section with toggle hint */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '15px', color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
          Dịch từng câu
        </h3>
        {keywords.length > 0 && (
          <button 
            type="button" 
            onClick={() => setShowHint(!showHint)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--color-sage)', 
              cursor: 'pointer', 
              fontSize: '13px', 
              fontWeight: 700 
            }}
          >
            {showHint ? 'Ẩn gợi ý' : 'Hiện gợi ý'}
          </button>
        )}
      </div>

      {/* Keywords Hint box */}
      {showHint && keywords.length > 0 && (
        <div 
          className="animate-bouncein" 
          style={{ 
            padding: '14px', 
            background: 'rgba(125, 160, 101, 0.1)', 
            borderRadius: '12px', 
            border: '2px dashed var(--color-sage)' 
          }}
        >
          <strong style={{ fontSize: '12px', color: 'var(--color-forest)', display: 'block', marginBottom: '4px' }}>
            Các cụm từ khóa gợi ý nên có trong bài dịch:
          </strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
            {keywords.map((kw, idx) => (
              <span 
                key={idx} 
                style={{ 
                  fontSize: '11px', 
                  background: '#ffffff', 
                  border: '1.5px solid var(--color-forest)',
                  color: 'var(--color-forest)', 
                  padding: '2px 8px', 
                  borderRadius: '6px',
                  fontWeight: 700
                }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sentence Inputs List with Real-time Feedback */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {sentences.map((sentence, idx) => {
          const userVal = sentenceTranslations[idx] || '';
          const refSentence = referenceSentences[idx] || '';
          const feedback = getSentenceFeedback(userVal, refSentence, sentence, vocabList, isEnToVi);

          return (
            <div key={idx} className="sentence-row">
              <div className="sentence-label">
                <span className="sentence-index">{idx + 1}</span>
                <span>{sentence.trim()}</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  value={userVal}
                  onChange={(e) => handleSentenceChange(idx, e.target.value)}
                  placeholder={isEnToVi ? "Nhập bản dịch tiếng Việt cho câu này..." : "Enter English translation for this sentence..."}
                  className="sentence-input"
                  disabled={submitting}
                  style={{
                    paddingRight: feedback.status !== 'empty' ? '40px' : '14px',
                    borderColor: feedback.status === 'correct' ? 'var(--color-success)' : feedback.status === 'incorrect' ? '#f43f5e' : 'var(--color-forest)',
                    transition: 'all 0.2s ease'
                  }}
                />
                
                {/* Verification check/cross inside input */}
                {feedback.status === 'correct' && (
                  <span 
                    style={{ 
                      position: 'absolute', 
                      right: '14px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: 'var(--color-success)',
                      fontWeight: 800,
                      fontSize: '18px'
                    }}
                  >
                    ✓
                  </span>
                )}
                {feedback.status === 'incorrect' && (
                  <span 
                    style={{ 
                      position: 'absolute', 
                      right: '14px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#f43f5e',
                      fontWeight: 800,
                      fontSize: '18px'
                    }}
                  >
                    ✗
                  </span>
                )}
              </div>

              {/* Helpful Hint warning rendered below the input */}
              {feedback.status === 'incorrect' && feedback.hint && (
                <div 
                  className="animate-slideup" 
                  style={{ 
                    fontSize: '12.5px', 
                    color: '#e11d48', 
                    fontWeight: 600, 
                    marginTop: '4px',
                    paddingLeft: '4px'
                  }}
                >
                  {feedback.hint}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Assembled Paragraph Preview (Read-only) */}
      <div 
        className="glass-panel animate-bouncein" 
        style={{ 
          padding: '20px', 
          background: '#ffffff', 
          border: '2.5px dashed var(--color-sage)', 
          borderRadius: '16px',
          boxShadow: 'none',
          marginTop: '8px'
        }}
      >
        <h4 style={{ fontSize: '14px', color: 'var(--color-forest)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
          📄 Bản dịch toàn bộ đoạn văn (Tự động ghép)
        </h4>
        <p 
          style={{ 
            fontSize: '15px', 
            lineHeight: '1.6', 
            color: userTranslation ? 'var(--color-forest)' : '#94a3b8', 
            fontStyle: userTranslation ? 'normal' : 'italic',
            whiteSpace: 'pre-wrap'
          }}
        >
          {userTranslation || (isEnToVi ? "(Bản dịch đầy đủ của bạn sẽ tự động xuất hiện tại đây khi bạn dịch các câu phía trên...)" : "(Your full translation will automatically assemble here as you translate the sentences above...)")}
        </p>
      </div>

      {/* Form Submission Button */}
      <form onSubmit={onSubmit} style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
        <button
          type="submit"
          disabled={submitting || !userTranslation.trim()}
          className="btn btn-primary"
          style={{ 
            minWidth: '160px', 
            border: '2.5px solid var(--color-forest)', 
            boxShadow: '4px 4px 0px var(--color-forest)',
            borderRadius: '12px',
            padding: '10px 24px'
          }}
        >
          {submitting ? 'Đang chấm điểm...' : 'Nộp bài dịch'}
        </button>
      </form>
    </div>
  );
}
