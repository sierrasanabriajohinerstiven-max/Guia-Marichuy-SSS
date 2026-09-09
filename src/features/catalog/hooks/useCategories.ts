import { useEffect, useState, useCallback } from 'react';
import { Category } from '../../../types/db';
import { getCategories } from '../services/catalogService';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getCategories();
    if (res.error) {
      setError(res.error);
    } else {
      setCategories(res.data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}
