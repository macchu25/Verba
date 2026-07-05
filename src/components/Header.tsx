import React from 'react';

interface HeaderProps {
  hasProgress: boolean;
  onReset: () => void;
  resetting: boolean;
}

export default function Header({ hasProgress, onReset, resetting }: HeaderProps) {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px', marginBottom: '32px' }} className="animate-slideup">
      <div>
        <h1 style={{ fontSize: '38px', background: 'linear-gradient(to right, #3a4f2f, #7da065)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', marginBottom: '4px', fontFamily: 'Outfit' }}>
          Verba
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>
          Luyện dịch tiếng Anh theo lộ trình tự nhiên (A1 - C1)
        </p>
      </div>
      
      {hasProgress && (
        <button 
          onClick={onReset} 
          disabled={resetting}
          className="btn btn-secondary"
          style={{ fontSize: '13px', padding: '8px 16px', borderRadius: '12px' }}
        >
          {resetting ? 'Đang xóa...' : 'Reset tiến độ'}
        </button>
      )}
    </header>
  );
}
