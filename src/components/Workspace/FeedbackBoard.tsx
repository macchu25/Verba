import React from 'react';
import Link from 'next/link';
import ScoreRing from './ScoreRing';

interface EvaluationResult {
  score: number;
  components: {
    keywordScore: number;
    wordOverlapScore: number;
    structureScore: number;
  };
  refWordMatchStatus: Array<{ word: string; matched: boolean }>;
  userWordMatchStatus: Array<{ word: string; matched: boolean }>;
  matchedKeywords: string[];
  missingKeywords: string[];
  referenceText: string;
}

interface FeedbackBoardProps {
  result: EvaluationResult;
  keywords: string[];
  onReset: () => void;
}

export default function FeedbackBoard({ result, keywords, onReset }: FeedbackBoardProps) {
  const getAssessmentLabel = (score: number) => {
    if (score >= 85) return 'Xuất sắc! 🎉';
    if (score >= 70) return 'Khá tốt! 👍';
    if (score >= 50) return 'Đạt yêu cầu 📝';
    return 'Cần cố gắng thêm 💪';
  };

  const labelColor = result.score >= 80 
    ? 'var(--color-success)' 
    : result.score >= 50 ? 'var(--color-warning)' : 'var(--color-danger)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-slideup">
      {/* Score Header Card */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '32px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '36px', 
          flexWrap: 'wrap',
          background: '#fcfaf2',
          border: '3px solid var(--color-forest)',
          boxShadow: 'var(--shadow-earthy)',
          borderRadius: '20px'
        }}
      >
        {/* Score Ring */}
        <ScoreRing score={result.score} />

        {/* Assessment Text */}
        <div style={{ flex: 1, minWidth: '240px' }}>
          <h2 style={{ fontSize: '26px', marginBottom: '8px', color: labelColor, fontFamily: 'Outfit' }}>
            {getAssessmentLabel(result.score)}
          </h2>
          <p style={{ color: '#4f6b3e', fontSize: '14.5px', marginBottom: '16px', lineHeight: '1.6' }}>
            Hệ thống chấm điểm tự động đã đánh giá bản dịch của bạn dựa trên các cấu trúc ngữ pháp tương đồng, các từ khóa bắt buộc và mức độ bao phủ từ vựng.
          </p>

          {/* Component Progress Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Keywords */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '3px', fontWeight: 700, color: 'var(--color-forest)' }}>
                <span>Độ phủ từ khóa cốt lõi (40%)</span>
                <span>{result.components.keywordScore}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(46, 59, 38, 0.08)', borderRadius: '4px', overflow: 'hidden', border: '1.5px solid var(--color-forest)' }}>
                <div style={{ width: `${result.components.keywordScore}%`, height: '100%', background: 'var(--color-accent)', borderRadius: '4px' }} />
              </div>
            </div>
            {/* Vocabulary */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '3px', fontWeight: 700, color: 'var(--color-forest)' }}>
                <span>Độ khớp từ vựng tương đương (40%)</span>
                <span>{result.components.wordOverlapScore}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(46, 59, 38, 0.08)', borderRadius: '4px', overflow: 'hidden', border: '1.5px solid var(--color-forest)' }}>
                <div style={{ width: `${result.components.wordOverlapScore}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '4px' }} />
              </div>
            </div>
            {/* Structure */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '3px', fontWeight: 700, color: 'var(--color-forest)' }}>
                <span>Độ chuẩn xác cấu trúc & ngữ pháp (20%)</span>
                <span>{result.components.structureScore}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(46, 59, 38, 0.08)', borderRadius: '4px', overflow: 'hidden', border: '1.5px solid var(--color-forest)' }}>
                <div style={{ width: `${result.components.structureScore}%`, height: '100%', background: 'var(--color-secondary)', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diffs & Feedback panels */}
      <div className="workspace-grid">
        {/* Left Side: Word Analysis & Keywords checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Words match mapping */}
          <div 
            className="glass-panel" 
            style={{ 
              padding: '24px',
              background: '#fcfaf2',
              border: '3px solid var(--color-forest)',
              boxShadow: 'var(--shadow-earthy)',
              borderRadius: '20px'
            }}
          >
            <h3 style={{ fontSize: '15px', color: 'var(--color-forest)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Từ vựng khớp nghĩa trong bản dịch
            </h3>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: 'var(--color-forest)' }}>
              {result.userWordMatchStatus.map((item, idx) => (
                <span 
                  key={idx} 
                  style={{ 
                    color: item.matched ? 'var(--color-success)' : '#64748b', 
                    fontWeight: item.matched ? 800 : 500,
                    marginRight: '6px',
                    display: 'inline-block'
                  }}
                >
                  {item.word}
                </span>
              ))}
            </p>
            <div style={{ marginTop: '18px', display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 700 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)' }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--color-success)', borderRadius: '50%' }} /> Từ khớp nghĩa
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                <span style={{ width: '8px', height: '8px', background: '#64748b', borderRadius: '50%' }} /> Từ khác biệt / từ đệm
              </span>
            </div>
          </div>

          {/* Keywords status list */}
          {keywords.length > 0 && (
            <div 
              className="glass-panel" 
              style={{ 
                padding: '24px',
                background: '#fcfaf2',
                border: '3px solid var(--color-forest)',
                boxShadow: 'var(--shadow-earthy)',
                borderRadius: '20px'
              }}
            >
              <h3 style={{ fontSize: '15px', color: 'var(--color-forest)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                Các từ khóa chính
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {keywords.map((kw, idx) => {
                  const isMatched = result.matchedKeywords.includes(kw);
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '10px 14px',
                        background: isMatched ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)',
                        border: `2px solid ${isMatched ? 'var(--color-success)' : 'var(--color-danger)'}`,
                        borderRadius: '12px'
                      }}
                    >
                      <span style={{ color: 'var(--color-forest)', fontSize: '14px', fontWeight: 700 }}>{kw}</span>
                      <span style={{ color: isMatched ? 'var(--color-success)' : 'var(--color-danger)', fontSize: '12px', fontWeight: 800 }}>
                        {isMatched ? '✓ Khớp' : '✗ Thiếu'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Model text & operational triggers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Reference translation */}
          <div 
            className="glass-panel" 
            style={{ 
              padding: '24px',
              background: '#fcfaf2',
              border: '3px solid var(--color-forest)',
              boxShadow: 'var(--shadow-earthy)',
              borderRadius: '20px'
            }}
          >
            <h3 style={{ fontSize: '15px', color: 'var(--color-forest)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Bản dịch đối chiếu
            </h3>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: 'var(--color-forest)', whiteSpace: 'pre-wrap', fontWeight: 500 }}>
              {result.referenceText}
            </p>
          </div>

          {/* Action triggers */}
          <div 
            className="glass-panel" 
            style={{ 
              padding: '24px',
              background: '#fcfaf2',
              border: '3px solid var(--color-forest)',
              boxShadow: 'var(--shadow-earthy)',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <h3 style={{ fontSize: '15px', color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Tùy chọn thao tác
            </h3>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button 
                onClick={onReset} 
                className="btn btn-secondary"
                style={{ 
                  flex: 1, 
                  border: '2.5px solid var(--color-forest)', 
                  borderRadius: '12px',
                  minWidth: '130px'
                }}
              >
                Dịch lại bài này
              </button>
              <Link 
                href="/" 
                className="btn btn-primary"
                style={{ 
                  flex: 1, 
                  border: '2.5px solid var(--color-forest)', 
                  boxShadow: '4px 4px 0px var(--color-forest)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  minWidth: '130px'
                }}
              >
                Trở lại Lộ trình
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
