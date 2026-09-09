import { useEffect, useState, useCallback } from 'react';
import { AdminStats, getAdminStats } from '../services/adminService';

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getAdminStats();
    if (res.error) {
      setError(res.error);
    } else {
      setStats(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
