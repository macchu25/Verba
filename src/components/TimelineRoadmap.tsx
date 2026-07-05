import React from 'react';
import LessonCard from './LessonCard';

interface Level {
  _id: string;
  code: string;
  name: string;
  description: string;
  order: number;
}

interface Lesson {
  _id: string;
  title: string;
  levelCode: string;
}

interface TimelineRoadmapProps {
  levels: Level[];
  lessons: Lesson[];
  direction: 'en-to-vi' | 'vi-to-en';
  getLessonScore: (lessonId: string) => number | null;
}

export default function TimelineRoadmap({ levels, lessons, direction, getLessonScore }: TimelineRoadmapProps) {
  return (
    <div className="timeline-roadmap animate-slideup">
      {levels.map((level) => {
        const levelLessons = lessons.filter((l) => l.levelCode === level.code);
        const levelCompletedCount = levelLessons.filter((l) => {
          const score = getLessonScore(l._id);
          return score !== null && score >= 50;
        }).length;

        return (
          <div key={level._id} className="roadmap-card animate-bouncein">
            {/* Timeline node marker centered on the left line */}
            <div className="roadmap-node-icon">
              <img 
                src="/banana_bullet.png" 
                alt="banana" 
                style={{ width: '22px', height: '22px', mixBlendMode: 'multiply' }} 
              />
            </div>

            {/* Main Level block (Two columns) */}
            <div className="level-block">
              {/* Left Column: Level Meta-information */}
              <div className="level-info-col">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span 
                    style={{ 
                      background: level.code === 'A1' || level.code === 'A2' ? 'rgba(16, 185, 129, 0.12)' : level.code === 'B1' || level.code === 'B2' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                      color: level.code === 'A1' || level.code === 'A2' ? '#10b981' : level.code === 'B1' || level.code === 'B2' ? '#f59e0b' : '#f43f5e',
                      border: `1.5px solid ${level.code === 'A1' || level.code === 'A2' ? '#10b981' : level.code === 'B1' || level.code === 'B2' ? '#f59e0b' : '#f43f5e'}`,
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 800,
                      fontFamily: 'Outfit'
                    }}
                  >
                    {level.code}
                  </span>
                  <h4 style={{ fontSize: '20px', color: 'var(--color-forest)', fontFamily: 'Outfit' }}>{level.name}</h4>
                </div>
                <p style={{ color: '#4f6b3e', fontSize: '14px', lineHeight: '1.5' }}>{level.description}</p>
                <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-forest)', fontWeight: 800, background: 'rgba(255,255,255,0.6)', padding: '4px 12px', borderRadius: '8px', border: '1.5px solid var(--color-forest)', display: 'inline-block' }}>
                    Đã hoàn thành: {levelCompletedCount}/{levelLessons.length}
                  </span>
                </div>
              </div>

              {/* Right Column: Lessons Grid */}
              <div className="lessons-grid-col">
                {levelLessons.map((lesson) => {
                  const highestScore = getLessonScore(lesson._id);
                  return (
                    <LessonCard 
                      key={lesson._id}
                      id={lesson._id}
                      title={lesson.title}
                      direction={direction}
                      highestScore={highestScore}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
