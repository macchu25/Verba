import React from 'react';

interface MascotBannerProps {
  completedCount: number;
  totalCount: number;
  progressPercent: number;
}

export default function MascotBanner({ completedCount, totalCount, progressPercent }: MascotBannerProps) {
  return (
    <div className="mascot-banner-wrapper animate-slideup">
      {/* Background Illustrated Mascot/Banner */}
      <div className="mascot-banner-bg" />

      <div className="mascot-banner-content">
        <h2 style={{ fontSize: '26px', color: 'var(--color-forest)', marginBottom: '8px', fontFamily: 'Outfit' }}>
          Chào mừng đến với Verba! 🌳
        </h2>
        <p style={{ color: '#4f6b3e', fontSize: '15px', lineHeight: '1.6', marginBottom: '18px', maxWidth: '600px' }}>
          Học tiếng Anh tự nhiên qua các đoạn văn bản dịch phân cấp. Mỗi đoạn dịch thành công sẽ đưa bạn đi sâu hơn vào khu rừng tri thức.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4f6b3e', fontWeight: 700, marginBottom: '6px' }}>
              <span>Tiến độ trồng cây</span>
              <span>Đã dịch xong {completedCount}/{totalCount} bài ({progressPercent}%)</span>
            </div>
            <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.7)', borderRadius: '7px', overflow: 'hidden', border: '2px solid var(--color-forest)' }}>
              <div 
                style={{ 
                  width: `${progressPercent}%`, 
                  height: '100%', 
                  background: 'linear-gradient(to right, var(--color-sage), var(--color-forest))', 
                  transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
                }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
