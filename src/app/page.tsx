'use client';

import React, { useState } from 'react';
import { useLevels } from '@/hooks/useLevels';
import { useAuth } from '@/context/AuthContext';
import AuthForm from '@/components/AuthForm';
import Header from '@/components/Header';
import MascotBanner from '@/components/MascotBanner';
import DirectionSelector from '@/components/DirectionSelector';
import TimelineRoadmap from '@/components/TimelineRoadmap';
import VocabStore from '@/components/VocabStore';
import LessonDirectory from '@/components/LessonDirectory';

export default function DashboardPage() {
  const { user, token, loading: authLoading, logout } = useAuth();
  const { 
    levels, 
    lessons, 
    progress, 
    loading, 
    error, 
    refetch, 
    resetProgress 
  } = useLevels(token);

  const [direction, setDirection] = useState<'en-to-vi' | 'vi-to-en'>('en-to-vi');
  const [activeTab, setActiveTab] = useState<'roadmap' | 'vocab' | 'directory'>('roadmap');

  const handleReset = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử học tập?')) {
      return;
    }
    const success = await resetProgress();
    if (success) {
      alert('Đã reset toàn bộ tiến độ học tập!');
    }
  };

  const getLessonScore = (lessonId: string) => {
    const attempts = progress.filter((p) => p.lessonId === lessonId && p.direction === direction);
    if (attempts.length === 0) return null;
    return Math.max(...attempts.map((a) => a.score));
  };

  const completedCount = lessons.filter((l) => {
    const score = getLessonScore(l._id);
    return score !== null && score >= 50;
  }).length;

  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  // Calculate unique vocabulary count across all lessons
  const totalUniqueVocabCount = React.useMemo(() => {
    const seen = new Set<string>();
    lessons.forEach((l) => {
      if (l.vocabulary && Array.isArray(l.vocabulary)) {
        l.vocabulary.forEach((v: any) => seen.add(v.word.toLowerCase().trim()));
      }
    });
    return seen.size;
  }, [lessons]);

  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(125, 160, 101, 0.1)', borderTopColor: 'var(--color-forest)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--color-forest)', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(125, 160, 101, 0.1)', borderTopColor: 'var(--color-forest)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--color-forest)', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Đang tải lộ trình học tiếng Anh...</p>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '100px auto', padding: '24px', textAlign: 'center', background: '#fcfaf2', border: '3px solid var(--color-forest)', boxShadow: 'var(--shadow-earthy)', borderRadius: '20px' }} className="glass-panel">
        <h2 style={{ color: 'var(--color-danger)', marginBottom: '12px' }}>Đã xảy ra lỗi</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>{error}</p>
        <button onClick={refetch} className="btn btn-primary" style={{ border: '2.5px solid var(--color-forest)', boxShadow: '4px 4px 0px var(--color-forest)', borderRadius: '12px' }}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile Sticky Top Header */}
      <header className="mobile-top-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user?.picture ? (
            <img 
              src={user.picture} 
              alt={user.name} 
              style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid var(--color-forest)' }} 
            />
          ) : (
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: 'var(--color-sage)', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontFamily: 'Outfit',
              fontWeight: 800,
              fontSize: '14px',
              border: '1.5px solid var(--color-forest)'
            }}>
              {user?.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 style={{ fontSize: '20px', background: 'linear-gradient(to right, #3a4f2f, #7da065)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'Outfit', fontWeight: 800, margin: 0 }}>
            Verba
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {progress.length > 0 && (
            <button 
              onClick={handleReset} 
              className="btn btn-secondary" 
              style={{ 
                padding: '6px 12px', 
                fontSize: '11px',
                borderWidth: '1.5px',
                borderRadius: '8px',
                boxShadow: 'none'
              }}
              disabled={loading}
            >
              Reset
            </button>
          )}
          <button 
            onClick={logout}
            className="btn btn-secondary" 
            style={{ 
              padding: '6px 12px', 
              fontSize: '11px',
              borderWidth: '1.5px',
              borderRadius: '8px',
              boxShadow: 'none',
              color: 'var(--color-danger)'
            }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Left Column: Sidebar Navigation */}
      <aside className="sidebar-col animate-slideup">
        <div>
          {/* Logo Section */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '32px', background: 'linear-gradient(to right, #3a4f2f, #7da065)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'Outfit', fontWeight: 800, margin: 0 }}>
              Verba
            </h1>
            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '2px', lineHeight: '1.4' }}>
              Luyện dịch lộ trình (A1 - C1)
            </p>
          </div>

          {/* User Profile Card */}
          {user && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '24px',
              padding: '12px',
              background: 'var(--bg-nature-light)',
              border: '2px solid var(--color-forest)',
              borderRadius: '16px'
            }}>
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--color-forest)', flexShrink: 0 }} 
                />
              ) : (
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: 'var(--color-sage)', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  fontSize: '18px',
                  border: '2px solid var(--color-forest)',
                  flexShrink: 0
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--color-forest)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {user.name}
                </div>
                <button 
                  onClick={logout}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--color-danger)', 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline'
                  }}
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          )}

          <div className="sidebar-menu">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`btn sidebar-nav-btn ${activeTab === 'roadmap' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                borderRadius: '12px',
                borderWidth: '2.5px',
                boxShadow: activeTab === 'roadmap' ? '3px 3px 0px var(--color-forest)' : 'none',
                transform: activeTab === 'roadmap' ? 'translate(-1px, -1px)' : 'none'
              }}
            >
              🗺️ Lộ trình học
            </button>
            <button
              onClick={() => setActiveTab('vocab')}
              className={`btn sidebar-nav-btn ${activeTab === 'vocab' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                borderRadius: '12px',
                borderWidth: '2.5px',
                boxShadow: activeTab === 'vocab' ? '3px 3px 0px var(--color-forest)' : 'none',
                transform: activeTab === 'vocab' ? 'translate(-1px, -1px)' : 'none'
              }}
            >
              📚 Kho từ vựng ({totalUniqueVocabCount} từ)
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`btn sidebar-nav-btn ${activeTab === 'directory' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                borderRadius: '12px',
                borderWidth: '2.5px',
                boxShadow: activeTab === 'directory' ? '3px 3px 0px var(--color-forest)' : 'none',
                transform: activeTab === 'directory' ? 'translate(-1px, -1px)' : 'none'
              }}
            >
              🔍 Mục lục & Tìm kiếm ({lessons.length} bài)
            </button>
          </div>
        </div>

        {/* Reset progress widget inside sidebar */}
        {progress.length > 0 && (
          <div 
            className="glass-panel" 
            style={{ 
              padding: '18px', 
              background: '#ffffff', 
              border: '2.5px solid var(--color-forest)', 
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <strong style={{ fontSize: '13px', color: 'var(--color-forest)', display: 'block', fontFamily: 'Outfit' }}>
              Quản lý tiến độ
            </strong>
            <p style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              Bạn có thể xóa lịch sử dịch thuật để bắt đầu lại lộ trình.
            </p>
            <button 
              onClick={handleReset} 
              className="btn btn-secondary" 
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                fontSize: '12px',
                borderWidth: '2px',
                borderRadius: '8px',
                boxShadow: 'none'
              }}
              disabled={loading}
            >
              Reset Tiến độ
            </button>
          </div>
        )}
      </aside>

      {/* Right Column: Main Content Panel */}
      <main className="main-content-col">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <MascotBanner 
            completedCount={completedCount} 
            totalCount={lessons.length} 
            progressPercent={progressPercent} 
          />

          {activeTab === 'roadmap' && (
            <div className="animate-slideup" style={{ marginTop: '24px' }}>
              <DirectionSelector 
                direction={direction} 
                onChange={setDirection} 
              />
              <TimelineRoadmap 
                levels={levels} 
                lessons={lessons} 
                direction={direction} 
                getLessonScore={getLessonScore} 
              />
            </div>
          )}

          {activeTab === 'vocab' && (
            <VocabStore lessons={lessons} />
          )}

          {activeTab === 'directory' && (
            <LessonDirectory 
              lessons={lessons} 
              getLessonScore={getLessonScore} 
              direction={direction} 
            />
          )}
        </div>
      </main>

      {/* Mobile Sticky Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button 
          onClick={() => setActiveTab('roadmap')}
          className={`mobile-nav-item ${activeTab === 'roadmap' ? 'active' : ''}`}
        >
          <span style={{ fontSize: '18px' }}>🗺️</span>
          <span>Lộ trình</span>
        </button>
        <button 
          onClick={() => setActiveTab('vocab')}
          className={`mobile-nav-item ${activeTab === 'vocab' ? 'active' : ''}`}
        >
          <span style={{ fontSize: '18px' }}>📚</span>
          <span>Kho từ vựng</span>
        </button>
        <button 
          onClick={() => setActiveTab('directory')}
          className={`mobile-nav-item ${activeTab === 'directory' ? 'active' : ''}`}
        >
          <span style={{ fontSize: '18px' }}>🔍</span>
          <span>Mục lục</span>
        </button>
      </nav>
    </div>
  );
}
