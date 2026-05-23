import { useState, useEffect, useCallback } from 'react';
import { getDashboard } from '../api/client';

export function useStats(year, month) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDashboard(year, month);
      setDashboard(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { dashboard, loading, error, refetch: fetchStats };
}