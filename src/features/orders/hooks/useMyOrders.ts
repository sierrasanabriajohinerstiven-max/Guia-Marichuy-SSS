import { useEffect, useState, useCallback } from 'react';
import { Order } from '../../../types/db';
import { getMyOrders } from '../services/orderService';
import { useAuth } from '../../auth/hooks/useAuth';

export function useMyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const res = await getMyOrders(user.id);
    if (res.error) {
      setError(res.error);
    } else {
      setOrders(res.data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}
