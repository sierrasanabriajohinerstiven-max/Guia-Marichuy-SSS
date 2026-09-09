import { useEffect, useState, useCallback } from 'react';
import { Product, Category } from '../../../types/db';
import {
  getAdminProducts,
  getAdminCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/adminService';
import toast from 'react-hot-toast';

export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [prodRes, catRes] = await Promise.all([
      getAdminProducts(),
      getAdminCategories(),
    ]);

    if (prodRes.error) {
      setError(prodRes.error);
    } else {
      setProducts(prodRes.data || []);
    }

    if (catRes.data) {
      setCategories(catRes.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveProduct = async (
    productData: Partial<Product>,
    editingId?: string
  ): Promise<boolean> => {
    if (editingId) {
      const res = await updateProduct(editingId, productData);
      if (res.error) {
        toast.error(res.error);
        return false;
      }
      toast.success('Producto actualizado con éxito');
    } else {
      const res = await createProduct(productData as Omit<Product, 'id'>);
      if (res.error) {
        toast.error(res.error);
        return false;
      }
      toast.success('Producto creado con éxito');
    }
    await fetchData();
    return true;
  };

  const handleDeleteProduct = async (id: string): Promise<boolean> => {
    const res = await deleteProduct(id);
    if (res.error) {
      toast.error(res.error);
      return false;
    }
    toast.success('Producto eliminado');
    await fetchData();
    return true;
  };

  const handleSaveCategory = async (
    name: string,
    description?: string,
    editingId?: string
  ): Promise<boolean> => {
    if (editingId) {
      const res = await updateCategory(editingId, name, description);
      if (res.error) {
        toast.error(res.error);
        return false;
      }
      toast.success('Categoría actualizada');
    } else {
      const res = await createCategory(name, description);
      if (res.error) {
        toast.error(res.error);
        return false;
      }
      toast.success('Categoría creada');
    }
    await fetchData();
    return true;
  };

  const handleDeleteCategory = async (id: string): Promise<boolean> => {
    const res = await deleteCategory(id);
    if (res.error) {
      toast.error(res.error);
      return false;
    }
    toast.success('Categoría eliminada');
    await fetchData();
    return true;
  };

  return {
    products,
    categories,
    loading,
    error,
    refetch: fetchData,
    handleSaveProduct,
    handleDeleteProduct,
    handleSaveCategory,
    handleDeleteCategory,
  };
}
