import React from 'react';

interface DirectionSelectorProps {
  direction: 'en-to-vi' | 'vi-to-en';
  onChange: (dir: 'en-to-vi' | 'vi-to-en') => void;
}

export default function DirectionSelector({ direction, onChange }: DirectionSelectorProps) {
  return (
    <section style={{ marginBottom: '40px' }} className="animate-slideup">
      <h3 style={{ fontSize: '15px', color: 'var(--color-forest)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
        Chọn chế độ dịch thuật
      </h3>
      <div className="direction-grid">
        {/* Mode 1: EN -> VI */}
        <div 
          onClick={() => onChange('en-to-vi')}
          className="glass-panel"
          style={{ 
            padding: '24px', 
            cursor: 'pointer',
            borderWidth: '3px',
            borderColor: 'var(--color-forest)',
            background: direction === 'en-to-vi' ? 'rgba(125, 160, 101, 0.15)' : '#ffffff',
            boxShadow: direction === 'en-to-vi' ? 'var(--shadow-earthy)' : 'none',
            transform: direction === 'en-to-vi' ? 'translate(-4px, -4px)' : 'none',
            borderRadius: '20px',
            transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px' }}>🇬🇧 ➔ 🇻🇳</span>
            <h4 style={{ fontSize: '18px', color: 'var(--color-forest)' }}>Dịch Anh - Việt</h4>
          </div>
          <p style={{ color: '#4f6b3e', fontSize: '14px', lineHeight: '1.5' }}>
            Luyện kỹ năng đọc hiểu và từ vựng. Đọc văn bản tiếng Anh và tự tay viết lời dịch sang tiếng Việt tự nhiên nhất.
          </p>
        </div>

        {/* Mode 2: VI -> EN */}
        <div 
          onClick={() => onChange('vi-to-en')}
          className="glass-panel"
          style={{ 
            padding: '24px', 
            cursor: 'pointer',
            borderWidth: '3px',
            borderColor: 'var(--color-forest)',
            background: direction === 'vi-to-en' ? 'rgba(125, 160, 101, 0.15)' : '#ffffff',
            boxShadow: direction === 'vi-to-en' ? 'var(--shadow-earthy)' : 'none',
            transform: direction === 'vi-to-en' ? 'translate(-4px, -4px)' : 'none',
            borderRadius: '20px',
            transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px' }}>🇻🇳 ➔ 🇬🇧</span>
            <h4 style={{ fontSize: '18px', color: 'var(--color-forest)' }}>Dịch Việt - Anh</h4>
          </div>
          <p style={{ color: '#4f6b3e', fontSize: '14px', lineHeight: '1.5' }}>
            Luyện kỹ năng viết, kết hợp ngữ pháp và lựa chọn từ vựng tiếng Anh tương ứng với nội dung tiếng Việt.
          </p>
        </div>
      </div>
    </section>
  );
}
