'use client';

import React, { useEffect, useState, use } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthForm from '@/components/AuthForm';
import InteractiveText from '@/components/Workspace/InteractiveText';
import VocabularyList from '@/components/Workspace/VocabularyList';
import GrammarTips from '@/components/Workspace/GrammarTips';
import TranslationForm from '@/components/Workspace/TranslationForm';
import FeedbackBoard from '@/components/Workspace/FeedbackBoard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface VocabItem {
  word: string;
  ipa?: string;
  meaning: string;
  example?: string;
}

interface GrammarItem {
  structure: string;
  explanation: string;
  example?: string;
}

interface Lesson {
  _id: string;
  title: string;
  levelCode: string;
  englishText: string;
  vietnameseText: string;
  keywordsEn: string[];
  keywordsVi: string[];
  vocabulary: VocabItem[];
  grammar: GrammarItem[];
}

export default function LessonWorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const id = params.id as string;
  const direction = (searchParams.get('dir') || 'en-to-vi') as 'en-to-vi' | 'vi-to-en';

  const { user, loading: authLoading } = useAuth();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [userTranslation, setUserTranslation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('verba_token');
      const res = await fetch(`${API_URL}/api/lessons/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setLesson(data.lesson);
      } else {
        setError(data.error || 'Không tìm thấy bài học này.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi mạng không thể tải thông tin bài học.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && user) {
      fetchLesson();
    }
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userTranslation.trim()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('verba_token');
      const res = await fetch(`${API_URL}/api/lessons/${id}/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userTranslation,
          direction
        })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        alert('Có lỗi xảy ra: ' + data.error);
      }
    } catch (err: any) {
      alert('Lỗi kết nối máy chủ: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

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
        <p style={{ color: 'var(--color-forest)', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Đang tải bài dịch...</p>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div style={{ maxWidth: '600px', margin: '100px auto', padding: '24px', textAlign: 'center', background: '#fcfaf2', border: '3px solid var(--color-forest)', boxShadow: 'var(--shadow-earthy)', borderRadius: '20px' }} className="glass-panel">
        <h2 style={{ color: 'var(--color-danger)', marginBottom: '12px' }}>Lỗi Tải Bài Học</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>{error || 'Không tìm thấy thông tin bài dịch.'}</p>
        <Link href="/" className="btn btn-primary" style={{ border: '2.5px solid var(--color-forest)', boxShadow: '4px 4px 0px var(--color-forest)', borderRadius: '12px' }}>Quay về Trang chủ</Link>
      </div>
    );
  }

  const isEnToVi = direction === 'en-to-vi';
  const sourceText = isEnToVi ? lesson.englishText : lesson.vietnameseText;
  const keywords = isEnToVi ? lesson.keywordsVi : lesson.keywordsEn;

  return (
    <div className="workspace-container" style={{ paddingTop: '32px', paddingBottom: '80px', position: 'relative' }}>
      
      {/* Navigation */}
      <nav style={{ marginBottom: '24px' }} className="animate-slideup">
        <Link href="/" style={{ color: 'var(--color-sage)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14.5px', fontWeight: 700, textDecoration: 'none' }}>
          ← Quay lại Lộ trình học
        </Link>
      </nav>

      {/* Workspace Header */}
      <header style={{ marginBottom: '32px' }} className="animate-slideup">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(125, 160, 101, 0.12)', color: 'var(--color-forest)', border: '1.5px solid var(--color-forest)', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, fontFamily: 'Outfit' }}>
            {lesson.levelCode}
          </span>
          <span style={{ color: '#64748b', fontSize: '14.5px', fontWeight: 700 }}>
            Chế độ: {isEnToVi ? 'Dịch Anh ➔ Việt (Đọc hiểu)' : 'Dịch Việt ➔ Anh (Viết/Ngữ pháp)'}
          </span>
        </div>
        <h1 style={{ fontSize: '28px', color: 'var(--color-forest)', fontFamily: 'Outfit' }}>{lesson.title}</h1>
      </header>

      {/* Main Workspace Layout */}
      {!result ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-slideup">
          {/* Top Row: Original Text & Translation Input Side-by-Side */}
          <div className="workspace-grid">
            <div 
              className="glass-panel animate-bouncein sticky-original-text" 
              style={{ 
                padding: '24px',
                background: '#fcfaf2',
                border: '3px solid var(--color-forest)',
                boxShadow: 'var(--shadow-earthy)',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                zIndex: 10
              }}
            >
              <div>
                <h3 style={{ fontSize: '15px', color: 'var(--color-forest)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  Văn bản gốc
                </h3>
                <InteractiveText 
                  text={sourceText} 
                  vocabList={lesson.vocabulary} 
                  isEnToVi={isEnToVi} 
                  lessonTitle={lesson.title}
                  lessonId={lesson._id}
                />
              </div>
              {isEnToVi && (
                <div style={{ marginTop: '24px', padding: '10px 14px', background: 'rgba(125, 160, 101, 0.08)', borderRadius: '8px', fontSize: '12.5px', color: '#4f6b3e', border: '1.5px solid rgba(46,59,38,0.1)', fontWeight: 600 }}>
                  💡 Rê chuột vào các từ có nét đứt để xem nhanh từ điển.
                </div>
              )}
            </div>

            <TranslationForm 
              sourceText={sourceText}
              targetText={isEnToVi ? lesson.vietnameseText : lesson.englishText}
              vocabList={lesson.vocabulary || []}
              userTranslation={userTranslation}
              setUserTranslation={setUserTranslation}
              onSubmit={handleSubmit}
              submitting={submitting}
              keywords={keywords}
              isEnToVi={isEnToVi}
            />
          </div>

          {/* Bottom Row: Glossary & Grammar Side-by-Side */}
          {(lesson.vocabulary?.length > 0 || lesson.grammar?.length > 0) && (
            <div className="workspace-grid" style={{ marginTop: '8px' }}>
              <VocabularyList vocabulary={lesson.vocabulary} />
              <GrammarTips grammar={lesson.grammar} />
            </div>
          )}
        </div>
      ) : (
        /* RESULTS OVERVIEW */
        <FeedbackBoard 
          result={result} 
          keywords={keywords} 
          onReset={() => setResult(null)} 
        />
      )}
    </div>
  );
}
