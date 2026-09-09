import { useEffect, useState, useCallback } from 'react';
import { Product } from '../../../types/db';
import { getProducts, getProductById } from '../services/catalogService';

export function useProducts(params?: { categoryId?: string; search?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getProducts(params);
    if (res.error) {
      setError(res.error);
    } else {
      setProducts(res.data || []);
    }
    setLoading(false);
  }, [params?.categoryId, params?.search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

export function useProductDetail(productId: string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await getProductById(productId);
    if (res.error) {
      setError(res.error);
    } else {
      setProduct(res.data);
    }
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
}
