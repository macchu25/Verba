import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function useLevels() {
  const [levels, setLevels] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('verba_token');
      const res = await fetch(`${API_URL}/api/levels`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setLevels(data.levels || []);
        setLessons(data.lessons || []);
        setProgress(data.progress || []);
      } else {
        setError(data.error || 'Không thể tải lộ trình học tập.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi mạng không thể kết nối tới máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  const resetAllProgress = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('verba_token');
      const res = await fetch(`${API_URL}/api/levels`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setProgress([]);
        return true;
      } else {
        throw new Error(data.error || 'Xóa tiến độ thất bại.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    levels,
    lessons,
    progress,
    loading,
    error,
    refetch: fetchData,
    resetProgress: resetAllProgress,
    setProgress
  };
}
