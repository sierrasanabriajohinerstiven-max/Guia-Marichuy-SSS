import { useEffect, useState, useCallback } from 'react';
import { Profile } from '../../../types/db';
import { getAdminClients } from '../services/adminService';

export function useAdminClients() {
  const [clients, setClients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getAdminClients();
    if (res.error) {
      setError(res.error);
    } else {
      setClients(res.data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return { clients, loading, error, refetch: fetchClients };
}
