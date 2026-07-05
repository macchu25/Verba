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

interface AggregatedVocab extends VocabItem {
  lessonTitle: string;
  lessonId: string;
}

interface VocabStoreProps {
  lessons: Lesson[];
}

// Helper to shuffle vocabulary cards for practice sessions
const shuffleArray = (array: AggregatedVocab[]) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export default function VocabStore({ lessons }: VocabStoreProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [vocabTab, setVocabTab] = useState<'suggested' | 'personal'>('suggested');
  const [personalVocab, setPersonalVocab] = useState<AggregatedVocab[]>([]);

  // Practice session states
  const [reviewMode, setReviewMode] = useState<'list' | 'groups' | 'settings_select' | 'session' | 'summary'>('list');
  const [activeGroup, setActiveGroup] = useState<{ title: string; words: AggregatedVocab[] } | null>(null);
  const [quizDirection, setQuizDirection] = useState<'en-to-vi' | 'vi-to-en'>('en-to-vi');
  const [quizMode, setQuizMode] = useState<'flashcard' | 'typing'>('flashcard');
  const [sessionCards, setSessionCards] = useState<AggregatedVocab[]>([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [learnedCount, setLearnedCount] = useState(0);

  // Typing quiz states
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);

  // Load personal vocabulary from localStorage
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
            lessonTitle: item.lessonTitle || 'Từ bôi đen tự do',
            lessonId: item.lessonId || 'personal'
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

  // Aggregate vocabulary groups dynamically by lesson title
  const vocabGroups = useMemo(() => {
    const groups: { [key: string]: AggregatedVocab[] } = {};
    personalVocab.forEach((item) => {
      const title = item.lessonTitle || 'Từ bôi đen tự do';
      if (!groups[title]) {
        groups[title] = [];
      }
      groups[title].push(item);
    });

    return Object.entries(groups).map(([title, words]) => ({
      title,
      words
    }));
  }, [personalVocab]);

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

  // Session handlers
  const handleSelectGroup = (group: { title: string; words: AggregatedVocab[] }) => {
    setActiveGroup(group);
    setQuizDirection('en-to-vi');
    setQuizMode('flashcard');
    setReviewMode('settings_select');
  };

  const handleStartSession = () => {
    if (!activeGroup) return;
    setSessionCards(shuffleArray(activeGroup.words));
    setCurrentCardIdx(0);
    setShowMeaning(false);
    setTypedAnswer('');
    setIsAnswerSubmitted(false);
    setIsAnswerCorrect(false);
    setLearnedCount(0);
    setReviewMode('session');
  };

  const checkAnswer = (typed: string, correct: string) => {
    const cleanTyped = typed.trim().toLowerCase();
    const cleanCorrect = correct.trim().toLowerCase();
    
    if (quizDirection === 'vi-to-en') {
      // English spelling must be exact
      return cleanTyped === cleanCorrect;
    } else {
      // Vietnamese translation allows substring matches for flexibility
      return cleanCorrect.includes(cleanTyped) || cleanTyped.includes(cleanCorrect);
    }
  };

  const handleVerifyAnswer = () => {
    if (!typedAnswer.trim()) return;
    const currentCard = sessionCards[currentCardIdx];
    const correctAnswer = quizDirection === 'en-to-vi' ? currentCard.meaning : currentCard.word;
    const isCorrect = checkAnswer(typedAnswer, correctAnswer);
    
    setIsAnswerCorrect(isCorrect);
    setIsAnswerSubmitted(true);
    if (isCorrect) {
      setLearnedCount((prev) => prev + 1);
    }
  };

  const handleNextCard = () => {
    if (currentCardIdx < sessionCards.length - 1) {
      setCurrentCardIdx((prev) => prev + 1);
      setShowMeaning(false);
      setTypedAnswer('');
      setIsAnswerSubmitted(false);
      setIsAnswerCorrect(false);
    } else {
      setReviewMode('summary');
    }
  };

  // Flashcard response handlers
  const handleFlashcardAnswer = (known: boolean) => {
    if (known) {
      setLearnedCount((prev) => prev + 1);
    }
    handleNextCard();
  };

  // Rendering screens based on reviewMode
  if (reviewMode === 'groups') {
    return (
      <div className="animate-slideup" style={{ marginTop: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px', background: '#fcfaf2', border: '3px solid var(--color-forest)', boxShadow: 'var(--shadow-earthy)', borderRadius: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '20px', color: 'var(--color-forest)', fontFamily: 'Outfit', margin: 0 }}>
                📝 Ôn tập Từ vựng Cá nhân
              </h3>
              <p style={{ color: '#4f6b3e', fontSize: '14px', marginTop: '6px', margin: 0 }}>
                Chọn nhóm từ vựng theo bài học để bắt đầu ôn tập bằng thẻ ghi nhớ hoặc bài kiểm tra viết.
              </p>
            </div>
            <button 
              onClick={() => setReviewMode('list')} 
              className="btn btn-secondary" 
              style={{ borderWidth: '2px', borderRadius: '8px', padding: '8px 16px', boxShadow: 'none' }}
            >
              ⬅️ Quay lại Kho từ
            </button>
          </div>
        </div>

        {vocabGroups.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {vocabGroups.map((group, idx) => (
              <div 
                key={idx}
                className="glass-panel"
                style={{
                  padding: '24px',
                  background: '#ffffff',
                  border: '3px solid var(--color-forest)',
                  boxShadow: 'var(--shadow-earthy)',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '17px', color: 'var(--color-forest)', fontFamily: 'Outfit', margin: 0, lineHeight: '1.4' }}>
                    📦 {group.title}
                  </h4>
                  <span style={{ display: 'inline-block', fontSize: '12.5px', background: 'rgba(125,160,101,0.1)', color: 'var(--color-forest)', border: '1px solid rgba(46,59,38,0.12)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, marginTop: '8px' }}>
                    {group.words.length} từ vựng
                  </span>
                </div>
                <button
                  onClick={() => handleSelectGroup(group)}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    borderWidth: '2px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    justifyContent: 'center',
                    boxShadow: '2px 2px 0px var(--color-forest)'
                  }}
                >
                  ▶️ Chọn chế độ & Bắt đầu
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center', background: '#ffffff', border: '3px solid var(--color-forest)', boxShadow: 'var(--shadow-earthy)', borderRadius: '20px' }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>📝</span>
            <h4 style={{ color: 'var(--color-forest)', fontSize: '18px', fontFamily: 'Outfit', marginBottom: '8px' }}>Từ điển cá nhân đang trống</h4>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Hãy vào học và bôi đen các từ mới để lưu trữ lộ trình ôn tập cá nhân nhé!</p>
          </div>
        )}
      </div>
    );
  }

  if (reviewMode === 'settings_select') {
    return (
      <div className="animate-slideup" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
        <div 
          className="glass-panel" 
          style={{ 
            maxWidth: '520px', 
            width: '100%', 
            padding: '32px', 
            background: '#fcfaf2', 
            border: '3px solid var(--color-forest)', 
            boxShadow: 'var(--shadow-earthy)', 
            borderRadius: '24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          <div>
            <h3 style={{ fontSize: '20px', color: 'var(--color-forest)', fontFamily: 'Outfit', margin: 0 }}>
              Cấu hình phiên ôn tập
            </h3>
            <p style={{ color: '#64748b', fontSize: '13.5px', marginTop: '4px', margin: 0, fontWeight: 600 }}>
              Nhóm: {activeGroup?.title} ({activeGroup?.words.length} từ)
            </p>
          </div>

          {/* Settings Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
            {/* Direction */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-forest)', textTransform: 'uppercase', marginBottom: '8px' }}>
                HƯỚNG KIỂM TRA:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setQuizDirection('en-to-vi')}
                  className={`btn ${quizDirection === 'en-to-vi' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '12px', fontSize: '13.5px', borderRadius: '8px', borderWidth: '2px', boxShadow: quizDirection === 'en-to-vi' ? '2px 2px 0px var(--color-forest)' : 'none', transform: quizDirection === 'en-to-vi' ? 'translate(-1px,-1px)' : 'none' }}
                >
                  🇺🇸 Anh ➡️ 🇻🇳 Việt
                </button>
                <button
                  onClick={() => setQuizDirection('vi-to-en')}
                  className={`btn ${quizDirection === 'vi-to-en' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '12px', fontSize: '13.5px', borderRadius: '8px', borderWidth: '2px', boxShadow: quizDirection === 'vi-to-en' ? '2px 2px 0px var(--color-forest)' : 'none', transform: quizDirection === 'vi-to-en' ? 'translate(-1px,-1px)' : 'none' }}
                >
                  🇻🇳 Việt ➡️ 🇺🇸 Anh
                </button>
              </div>
            </div>

            {/* Mode */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-forest)', textTransform: 'uppercase', marginBottom: '8px' }}>
                HÌNH THỨC ÔN TẬP:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setQuizMode('flashcard')}
                  className={`btn ${quizMode === 'flashcard' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '12px', fontSize: '13.5px', borderRadius: '8px', borderWidth: '2px', boxShadow: quizMode === 'flashcard' ? '2px 2px 0px var(--color-forest)' : 'none', transform: quizMode === 'flashcard' ? 'translate(-1px,-1px)' : 'none' }}
                >
                  🃏 Thẻ ghi nhớ (Flashcard)
                </button>
                <button
                  onClick={() => setQuizMode('typing')}
                  className={`btn ${quizMode === 'typing' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '12px', fontSize: '13.5px', borderRadius: '8px', borderWidth: '2px', boxShadow: quizMode === 'typing' ? '2px 2px 0px var(--color-forest)' : 'none', transform: quizMode === 'typing' ? 'translate(-1px,-1px)' : 'none' }}
                >
                  ✍️ Nhập đáp án (Quiz viết)
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            <button
              onClick={handleStartSession}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                borderWidth: '2.5px',
                fontSize: '15px',
                fontWeight: 800,
                justifyContent: 'center',
                boxShadow: '3px 3px 0px var(--color-forest)'
              }}
            >
              🚀 Bắt đầu
            </button>
            <button 
              onClick={() => setReviewMode('groups')} 
              className="btn btn-secondary" 
              style={{ width: '100%', padding: '10px', borderWidth: '2px', borderRadius: '8px', fontSize: '13px', boxShadow: 'none', justifyContent: 'center' }}
            >
              Quay lại chọn nhóm
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (reviewMode === 'session') {
    const currentCard = sessionCards[currentCardIdx];
    const totalCards = sessionCards.length;
    const progressPercent = ((currentCardIdx) / totalCards) * 100;

    const correctAnswer = quizDirection === 'en-to-vi' ? currentCard.meaning : currentCard.word;

    return (
      <div className="animate-slideup" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        {/* Session Stats Header */}
        <div style={{ maxWidth: '600px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--color-forest)' }}>
            Tiến trình: {currentCardIdx + 1} / {totalCards} từ ({quizMode === 'flashcard' ? 'Thẻ ghi nhớ' : 'Quiz viết'})
          </span>
          <button
            onClick={() => {
              if (window.confirm('Bạn có muốn dừng phiên ôn tập này không?')) {
                setReviewMode('groups');
              }
            }}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px', borderWidth: '1.5px', borderRadius: '6px', boxShadow: 'none' }}
          >
            ⏹️ Dừng ôn tập
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ maxWidth: '600px', width: '100%', height: '8px', background: 'rgba(46,59,38,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--color-sage)', transition: 'width 0.3s ease' }} />
        </div>

        {/* Flashcard / Quiz container */}
        <div 
          className="glass-panel"
          style={{
            maxWidth: '600px',
            width: '100%',
            minHeight: '340px',
            background: '#ffffff',
            border: '3px solid var(--color-forest)',
            boxShadow: 'var(--shadow-earthy)',
            borderRadius: '24px',
            padding: '40px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'center',
            gap: '24px'
          }}
        >
          {/* Question Display */}
          <div style={{ width: '100%' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
              {quizDirection === 'en-to-vi' ? 'Tiếng Anh' : 'Nghĩa Tiếng Việt'}
            </span>
            <h2 style={{ 
              fontSize: quizDirection === 'en-to-vi' ? '36px' : '26px', 
              color: 'var(--color-forest)', 
              fontFamily: 'Outfit',
              margin: '12px 0 0 0',
              lineHeight: '1.3',
              wordBreak: 'break-word'
            }}>
              {quizDirection === 'en-to-vi' ? currentCard.word : currentCard.meaning}
            </h2>
          </div>

          {/* Practice view mode toggle */}
          {quizMode === 'flashcard' ? (
            /* --- FLASHCARD MODE --- */
            <>
              {showMeaning ? (
                <div className="animate-slideup" style={{ width: '100%', borderTop: '2px dashed rgba(46,59,38,0.12)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                    {quizDirection === 'en-to-vi' ? 'Nghĩa & Chi tiết' : 'Từ Tiếng Anh'}
                  </span>
                  <div>
                    <h3 style={{ fontSize: quizDirection === 'en-to-vi' ? '24px' : '32px', color: 'var(--color-forest)', fontFamily: 'Outfit', margin: 0 }}>
                      {quizDirection === 'en-to-vi' ? currentCard.meaning : currentCard.word}
                    </h3>
                    {currentCard.ipa && (
                      <span style={{ display: 'inline-block', fontSize: '14.5px', color: '#64748b', fontFamily: 'Outfit', marginTop: '4px', fontWeight: 600 }}>
                        {currentCard.ipa}
                      </span>
                    )}
                  </div>
                  {currentCard.example && (
                    <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', margin: '8px auto 0 auto', maxWidth: '440px', borderLeft: '3px solid var(--color-sage)', paddingLeft: '8px', textAlign: 'left', lineHeight: '1.45' }}>
                      &ldquo;{currentCard.example}&rdquo;
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowMeaning(true)}
                  className="btn btn-primary animate-pulse"
                  style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    borderWidth: '2px',
                    fontSize: '14px',
                    fontWeight: 700,
                    boxShadow: '3px 3px 0px var(--color-forest)'
                  }}
                >
                  👁️ Xem giải nghĩa
                </button>
              )}

              {/* Flashcard Answer Controls */}
              {showMeaning && (
                <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                  <button
                    onClick={() => handleFlashcardAnswer(false)}
                    className="btn btn-secondary"
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      borderWidth: '2px',
                      fontSize: '14px',
                      fontWeight: 700,
                      justifyContent: 'center',
                      borderColor: 'var(--color-danger)',
                      color: 'var(--color-danger)',
                      boxShadow: 'none'
                    }}
                  >
                    ❌ Chưa thuộc
                  </button>
                  <button
                    onClick={() => handleFlashcardAnswer(true)}
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      borderWidth: '2px',
                      fontSize: '14px',
                      fontWeight: 700,
                      justifyContent: 'center',
                      background: 'var(--color-sage)',
                      boxShadow: '3px 3px 0px var(--color-forest)'
                    }}
                  >
                    ✅ Đã thuộc
                  </button>
                </div>
              )}
            </>
          ) : (
            /* --- TYPING MODE --- */
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {!isAnswerSubmitted ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleVerifyAnswer();
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}
                >
                  <input
                    type="text"
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    placeholder={quizDirection === 'en-to-vi' ? 'Nhập nghĩa Tiếng Việt của từ này...' : 'Nhập từ Tiếng Anh của từ này...'}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '2.5px solid var(--color-forest)',
                      fontSize: '15px',
                      fontFamily: 'var(--font-primary)',
                      textAlign: 'center',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!typedAnswer.trim()}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      borderWidth: '2px',
                      fontSize: '14px',
                      fontWeight: 700,
                      justifyContent: 'center',
                      boxShadow: typedAnswer.trim() ? '3px 3px 0px var(--color-forest)' : 'none'
                    }}
                  >
                    Verify Answer
                  </button>
                </form>
              ) : (
                <div className="animate-slideup" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                  {/* Correct / Incorrect alert */}
                  <div 
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '2px solid',
                      borderColor: isAnswerCorrect ? 'var(--color-sage)' : 'var(--color-danger)',
                      background: isAnswerCorrect ? 'rgba(125,160,101,0.08)' : 'rgba(244,63,94,0.08)',
                      color: isAnswerCorrect ? 'var(--color-forest)' : 'var(--color-danger)',
                      fontSize: '15px',
                      fontWeight: 800
                    }}
                  >
                    {isAnswerCorrect ? '🎉 Chính xác!' : '❌ Chưa chính xác!'}
                  </div>

                  {/* Show actual answer */}
                  <div style={{ borderTop: '2px dashed rgba(46,59,38,0.12)', paddingTop: '16px', textAlign: 'left' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                      Đáp án đúng:
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-forest)', marginTop: '4px', fontFamily: 'Outfit' }}>
                      {correctAnswer}
                    </div>
                    {currentCard.ipa && (
                      <span style={{ display: 'inline-block', fontSize: '13.5px', color: '#64748b', fontFamily: 'Outfit', marginTop: '2px', fontWeight: 600 }}>
                        {currentCard.ipa}
                      </span>
                    )}

                    {currentCard.example && (
                      <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', marginTop: '10px', borderLeft: '3px solid var(--color-sage)', paddingLeft: '8px', lineHeight: '1.45' }}>
                        &ldquo;{currentCard.example}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Next button */}
                  <button
                    onClick={handleNextCard}
                    className="btn btn-primary"
                    autoFocus
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      borderWidth: '2px',
                      fontSize: '14px',
                      fontWeight: 700,
                      justifyContent: 'center',
                      boxShadow: '3px 3px 0px var(--color-forest)'
                    }}
                  >
                    Tiếp tục ➡️
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (reviewMode === 'summary') {
    const percentage = Math.round((learnedCount / sessionCards.length) * 100);

    return (
      <div className="animate-slideup" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
        <div 
          className="glass-panel" 
          style={{ 
            maxWidth: '500px', 
            width: '100%', 
            padding: '40px 32px', 
            background: '#fcfaf2', 
            border: '3px solid var(--color-forest)', 
            boxShadow: 'var(--shadow-earthy)', 
            borderRadius: '24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          <div>
            <span style={{ fontSize: '48px', display: 'block' }}>🏆</span>
            <h3 style={{ fontSize: '22px', color: 'var(--color-forest)', fontFamily: 'Outfit', marginTop: '12px', margin: 0 }}>
              Hoàn thành ôn tập!
            </h3>
            <p style={{ color: '#64748b', fontSize: '13.5px', marginTop: '4px', margin: 0, fontWeight: 600 }}>
              Nhóm: {activeGroup?.title} ({quizMode === 'flashcard' ? 'Thẻ ghi nhớ' : 'Quiz viết'})
            </p>
          </div>

          {/* Result card */}
          <div style={{ background: '#ffffff', border: '2px solid var(--color-forest)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Kết quả</div>
            <div style={{ fontSize: '40px', fontWeight: 800, color: 'var(--color-forest)', margin: '8px 0', fontFamily: 'Outfit' }}>
              {learnedCount} / {sessionCards.length}
            </div>
            <div style={{ fontSize: '14.5px', color: 'var(--color-sage)', fontWeight: 800 }}>
              {quizMode === 'flashcard' ? `Thuộc ${percentage}% số từ vựng!` : `Đạt ${percentage}% đáp án chính xác!`}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleStartSession}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                borderWidth: '2px',
                fontSize: '14px',
                fontWeight: 700,
                justifyContent: 'center',
                boxShadow: '3px 3px 0px var(--color-forest)'
              }}
            >
              🔄 Ôn tập lại nhóm này
            </button>
            <button
              onClick={() => setReviewMode('groups')}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                borderWidth: '2px',
                fontSize: '14px',
                fontWeight: 700,
                justifyContent: 'center',
                boxShadow: 'none'
              }}
            >
              📂 Chọn nhóm từ vựng khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal List View (reviewMode === 'list')
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '20px', color: 'var(--color-forest)', fontFamily: 'Outfit', margin: 0 }}>
              📚 Kho từ vựng của bạn
            </h3>
            <p style={{ color: '#4f6b3e', fontSize: '14px', lineHeight: '1.5', marginTop: '6px', margin: 0 }}>
              Tìm kiếm nhanh các từ vựng gợi ý trong lộ trình học hoặc ôn tập lại từ vựng cá nhân bạn đã lưu.
            </p>
          </div>
          {vocabTab === 'personal' && personalVocab.length > 0 && (
            <button
              onClick={() => setReviewMode('groups')}
              className="btn btn-primary"
              style={{
                borderRadius: '10px',
                borderWidth: '2px',
                padding: '8px 16px',
                fontSize: '13.5px',
                fontWeight: 700,
                boxShadow: '3px 3px 0px var(--color-forest)'
              }}
            >
              📝 Ôn tập Từ vựng
            </button>
          )}
        </div>

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
