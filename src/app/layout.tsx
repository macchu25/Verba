import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Verba - Học Tiếng Anh Qua Dịch Thuật Lộ Trình Graded',
  description: 'Trang web hỗ trợ học tiếng Anh thông qua luyện dịch 2 chiều từ cơ bản đến nâng cao (A1 - C1). Chấm điểm thông minh, giải nghĩa từ vựng tức thì.',
  keywords: ['học tiếng anh', 'dịch tiếng anh', 'luyện dịch', 'tiếng anh lộ trình', 'cefr a1 c1', 'verba'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
