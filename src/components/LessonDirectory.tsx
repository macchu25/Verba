import React, { useState, useMemo } from 'react';
import Link from 'next/link';

interface Lesson {
  _id: string;
  title: string;
  levelCode: string;
}

interface LessonDirectoryProps {
  lessons: Lesson[];
  getLessonScore: (lessonId: string) => number | null;
  direction: 'en-to-vi' | 'vi-to-en';
}

export default function LessonDirectory({ lessons, getLessonScore, direction }: LessonDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');

  const levels = ['ALL', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'];

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      // 1. Level filter
      const matchesLevel = selectedLevel === 'ALL' || lesson.levelCode === selectedLevel;
      // 2. Title search
      const matchesQuery = lesson.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
      
      return matchesLevel && matchesQuery;
    });
  }, [lessons, selectedLevel, searchQuery]);

  return (
    <div className="animate-slideup" style={{ marginTop: '20px' }}>
      {/* Filters & Search Box */}
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
          gap: '16px'
        }}
      >
        <h3 style={{ fontSize: '20px', color: 'var(--color-forest)', fontFamily: 'Outfit' }}>
          🔍 Mục lục & Tìm kiếm bài học
        </h3>
        <p style={{ color: '#4f6b3e', fontSize: '14px', lineHeight: '1.5' }}>
          Duyệt qua danh sách toàn bộ các bài dịch thuật tiếng Anh từ cơ bản đến nâng cao. Lọc nhanh theo cấp độ CEFR hoặc nhập từ khóa để tìm kiếm.
        </p>

        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nhập tên tiêu đề bài học cần tìm..."
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: '2.5px solid var(--color-forest)',
              fontSize: '15px',
              fontFamily: 'var(--font-primary)',
              color: 'var(--color-forest)',
              outline: 'none'
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

        {/* Level Filters Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
          {levels.map((lvl) => {
            const isActive = selectedLevel === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '8px',
                  border: '2px solid var(--color-forest)',
                  background: isActive ? 'var(--color-sage)' : '#ffffff',
                  color: isActive ? '#ffffff' : 'var(--color-forest)',
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: isActive ? '2px 2px 0px var(--color-forest)' : 'none',
                  transform: isActive ? 'translate(-1px, -1px)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {lvl === 'ALL' ? 'Tất cả' : lvl}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lessons List Table */}
      {filteredLessons.length > 0 ? (
        <>
          {/* Desktop Table view */}
          <div 
            className="glass-panel hide-on-mobile" 
            style={{ 
              padding: '12px 24px', 
              background: '#ffffff', 
              border: '3px solid var(--color-forest)', 
              boxShadow: 'var(--shadow-earthy)', 
              borderRadius: '20px',
              overflowX: 'auto'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '2.5px solid var(--color-forest)' }}>
                  <th style={{ padding: '16px 12px', color: 'var(--color-forest)', fontFamily: 'Outfit', fontWeight: 800, width: '100px' }}>Cấp độ</th>
                  <th style={{ padding: '16px 12px', color: 'var(--color-forest)', fontFamily: 'Outfit', fontWeight: 800 }}>Tiêu đề bài học</th>
                  <th style={{ padding: '16px 12px', color: 'var(--color-forest)', fontFamily: 'Outfit', fontWeight: 800, width: '140px', textAlign: 'center' }}>Điểm số</th>
                  <th style={{ padding: '16px 12px', color: 'var(--color-forest)', fontFamily: 'Outfit', fontWeight: 800, width: '150px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredLessons.map((lesson) => {
                  const score = getLessonScore(lesson._id);
                  const isCompleted = score !== null && score >= 50;

                  return (
                    <tr 
                      key={lesson._id} 
                      style={{ 
                        borderBottom: '1.5px solid rgba(46,59,38,0.06)',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <td style={{ padding: '14px 12px' }}>
                        <span 
                          style={{ 
                            background: lesson.levelCode === 'L1' || lesson.levelCode === 'L2' || lesson.levelCode === 'A1' || lesson.levelCode === 'A2' ? 'rgba(16, 185, 129, 0.1)' : lesson.levelCode === 'L3' || lesson.levelCode === 'L4' || lesson.levelCode === 'B1' || lesson.levelCode === 'B2' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                            color: lesson.levelCode === 'L1' || lesson.levelCode === 'L2' || lesson.levelCode === 'A1' || lesson.levelCode === 'A2' ? '#10b981' : lesson.levelCode === 'L3' || lesson.levelCode === 'L4' || lesson.levelCode === 'B1' || lesson.levelCode === 'B2' ? '#f59e0b' : '#f43f5e',
                            border: `1.5px solid ${lesson.levelCode === 'L1' || lesson.levelCode === 'L2' || lesson.levelCode === 'A1' || lesson.levelCode === 'A2' ? '#10b981' : lesson.levelCode === 'L3' || lesson.levelCode === 'L4' || lesson.levelCode === 'B1' || lesson.levelCode === 'B2' ? '#f59e0b' : '#f43f5e'}`,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '12.5px',
                            fontWeight: 800,
                            fontFamily: 'Outfit'
                          }}
                        >
                          {lesson.levelCode}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', fontWeight: 700, color: 'var(--color-forest)' }}>
                        {lesson.title}
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        {score !== null ? (
                          <span 
                            style={{ 
                              color: score >= 80 ? 'var(--color-success)' : score >= 50 ? 'var(--color-warning)' : 'var(--color-danger)', 
                              fontWeight: 800, 
                              fontFamily: 'Outfit',
                              fontSize: '16px',
                              background: 'rgba(0,0,0,0.02)',
                              padding: '3px 10px',
                              borderRadius: '8px',
                              border: '1.5px solid rgba(46,59,38,0.06)'
                            }}
                          >
                            {score} / 100
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '13.5px', fontWeight: 500 }}>Chưa làm</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                        <Link 
                          href={`/lessons/${lesson._id}?dir=${direction}`}
                          className="btn btn-secondary"
                          style={{ 
                            padding: '6px 16px', 
                            fontSize: '13px', 
                            borderWidth: '2px', 
                            borderRadius: '8px',
                            boxShadow: '2px 2px 0px var(--color-forest)'
                          }}
                        >
                          {isCompleted ? 'Dịch lại' : 'Bắt đầu dịch'}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards List */}
          <div className="show-on-mobile responsive-table-cards">
            {filteredLessons.map((lesson) => {
              const score = getLessonScore(lesson._id);
              const isCompleted = score !== null && score >= 50;

              return (
                <div key={lesson._id} className="responsive-card-item animate-bouncein">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span 
                      style={{ 
                        background: lesson.levelCode === 'L1' || lesson.levelCode === 'L2' || lesson.levelCode === 'A1' || lesson.levelCode === 'A2' ? 'rgba(16, 185, 129, 0.1)' : lesson.levelCode === 'L3' || lesson.levelCode === 'L4' || lesson.levelCode === 'B1' || lesson.levelCode === 'B2' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                        color: lesson.levelCode === 'L1' || lesson.levelCode === 'L2' || lesson.levelCode === 'A1' || lesson.levelCode === 'A2' ? '#10b981' : lesson.levelCode === 'L3' || lesson.levelCode === 'L4' || lesson.levelCode === 'B1' || lesson.levelCode === 'B2' ? '#f59e0b' : '#f43f5e',
                        border: `1.5px solid ${lesson.levelCode === 'L1' || lesson.levelCode === 'L2' || lesson.levelCode === 'A1' || lesson.levelCode === 'A2' ? '#10b981' : lesson.levelCode === 'L3' || lesson.levelCode === 'L4' || lesson.levelCode === 'B1' || lesson.levelCode === 'B2' ? '#f59e0b' : '#f43f5e'}`,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        fontFamily: 'Outfit'
                      }}
                    >
                      {lesson.levelCode}
                    </span>
                    
                    {score !== null ? (
                      <span 
                        style={{ 
                          color: score >= 80 ? 'var(--color-success)' : score >= 50 ? 'var(--color-warning)' : 'var(--color-danger)', 
                          fontWeight: 800, 
                          fontFamily: 'Outfit',
                          fontSize: '14px',
                          background: 'rgba(0,0,0,0.02)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: '1.5px solid rgba(46,59,38,0.06)'
                        }}
                      >
                        {score} / 100
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '12.5px', fontWeight: 500 }}>Chưa làm</span>
                    )}
                  </div>

                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-forest)', margin: '4px 0 8px 0' }}>
                    {lesson.title}
                  </h4>

                  <Link 
                    href={`/lessons/${lesson._id}?dir=${direction}`}
                    className="btn btn-secondary"
                    style={{ 
                      padding: '8px 16px', 
                      fontSize: '13px', 
                      borderWidth: '2px', 
                      borderRadius: '8px',
                      boxShadow: '2px 2px 0px var(--color-forest)',
                      width: '100%',
                      justifyContent: 'center'
                    }}
                  >
                    {isCompleted ? 'Dịch lại' : 'Bắt đầu dịch'}
                  </Link>
                </div>
              );
            })}
          </div>
        </>
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
            Không tìm thấy bài dịch nào
          </h4>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Hãy thử tìm bằng từ khóa khác hoặc chuyển sang cấp độ khác.
          </p>
        </div>
      )}
    </div>
  );
}
