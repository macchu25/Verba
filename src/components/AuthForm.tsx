'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthForm() {
  const { loginWithGoogleToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMock, setShowMock] = useState(false);
  const [mockName, setMockName] = useState('DuyetDS');
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  // Handle real Google credential return
  const handleCredentialResponse = async (response: any) => {
    setLoading(true);
    setError('');
    const success = await loginWithGoogleToken(response.credential);
    setLoading(false);
    if (!success) {
      setError('Đăng nhập Google thất bại. Vui lòng kiểm tra lại cấu hình.');
    }
  };

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (typeof window !== 'undefined' && (window as any).google) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleCredentialResponse,
            auto_select: false,
          });

          if (googleBtnRef.current) {
            (window as any).google.accounts.id.renderButton(
              googleBtnRef.current,
              {
                theme: 'outline',
                size: 'large',
                width: '100%',
                shape: 'rectangular',
                text: 'signin_with',
              }
            );
          }
        } catch (err) {
          console.error('Google Sign-In initialization failed:', err);
        }
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [googleClientId]);

  // Handle mock developer login
  const handleMockLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockName.trim()) return;

    setLoading(true);
    setError('');
    // Send a mock prefix token
    const success = await loginWithGoogleToken(`mock_token_${mockName.trim()}`);
    setLoading(false);
    if (!success) {
      setError('Đăng nhập Mock thất bại.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '20px',
      fontFamily: 'var(--font-primary)'
    }}>
      <div 
        className="glass-panel animate-bouncein" 
        style={{
          maxWidth: '460px',
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
        {/* Header Title */}
        <div>
          <h1 style={{ 
            fontSize: '44px', 
            background: 'linear-gradient(to right, #3a4f2f, #7da065)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            fontFamily: 'Outfit',
            fontWeight: 800,
            margin: 0
          }}>
            Verba
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', fontWeight: 600 }}>
            Lộ trình luyện dịch tiếng Anh (A1 - C1)
          </p>
        </div>

        {/* Welcome message */}
        <p style={{ color: 'var(--color-forest)', fontSize: '14.5px', lineHeight: '1.6', margin: 0 }}>
          Chinh phục khả năng đọc hiểu và dịch thuật chuyên nghiệp. Hãy đăng nhập bằng Google để lưu trữ lộ trình học và tiến trình của riêng bạn.
        </p>

        {/* Error Notification */}
        {error && (
          <div style={{
            padding: '12px',
            background: 'rgba(244, 63, 94, 0.08)',
            border: '2px solid var(--color-danger)',
            color: 'var(--color-danger)',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 700,
            textAlign: 'left'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Google sign-in container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {googleClientId ? (
            <div 
              ref={googleBtnRef} 
              style={{ 
                minHeight: '44px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1.5px solid rgba(46, 59, 38, 0.12)'
              }} 
            />
          ) : (
            <div style={{
              padding: '16px',
              background: '#ffffff',
              border: '2px dashed var(--color-sage)',
              borderRadius: '12px',
              fontSize: '13px',
              color: '#64748b'
            }}>
              Môi trường chưa cấu hình Google Client ID.<br/>
              Bạn có thể sử dụng chế độ đăng nhập kiểm thử phía dưới.
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-sage)' }}>
              <div style={{ width: '14px', height: '14px', border: '2px solid rgba(125,160,101,0.2)', borderTopColor: 'var(--color-sage)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '13px', fontWeight: 700 }}>Đang xác thực tài khoản...</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#cbd5e1' }}>
          <div style={{ flex: 1, height: '1.5px', background: 'rgba(46,59,38,0.08)' }} />
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>Hoặc kiểm thử</span>
          <div style={{ flex: 1, height: '1.5px', background: 'rgba(46,59,38,0.08)' }} />
        </div>

        {/* Mock Developer login option */}
        <div>
          {!showMock ? (
            <button 
              onClick={() => setShowMock(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-sage)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              🚀 Đăng nhập nhanh kiểm thử (Mock Login)
            </button>
          ) : (
            <form onSubmit={handleMockLogin} className="animate-slideup" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-forest)', textTransform: 'uppercase' }}>Tên người dùng thử nghiệm:</label>
                <input 
                  type="text" 
                  value={mockName}
                  onChange={(e) => setMockName(e.target.value)}
                  placeholder="Nhập tên đăng nhập kiểm thử..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '2px solid var(--color-forest)',
                    fontSize: '14px',
                    fontFamily: 'var(--font-primary)',
                    outline: 'none'
                  }}
                  disabled={loading}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    borderWidth: '2px',
                    boxShadow: '2px 2px 0px var(--color-forest)'
                  }}
                  disabled={loading}
                >
                  Xác nhận
                </button>
                <button
                  type="button"
                  onClick={() => setShowMock(false)}
                  className="btn btn-secondary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    borderWidth: '2px',
                    boxShadow: 'none'
                  }}
                  disabled={loading}
                >
                  Đóng
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
