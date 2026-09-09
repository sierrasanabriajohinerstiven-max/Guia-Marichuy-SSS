import React, { useState } from 'react';
import { useAdminProducts } from '../hooks/useAdminProducts';
import { ProductModal } from './ProductModal';
import { Product, Category } from '../../../types/db';
import { Money } from '../../../components/ui/Money';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ProductTable: React.FC = () => {
  const {
    products,
    categories,
    loading,
    refetch,
    handleSaveProduct,
    handleDeleteProduct,
    handleSaveCategory,
    handleDeleteCategory,
  } = useAdminProducts();

  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [categoryDescription, setCategoryDescription] = useState<string>('');
  const [savingCategory, setSavingCategory] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'product' | 'category'; id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Product filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openNewProduct = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const openEditProduct = (prod: Product) => {
    setProductToEdit(prod);
    setIsProductModalOpen(true);
  };

  const confirmDeleteProduct = (id: string, name: string) => {
    setDeleteTarget({ type: 'product', id, name });
  };

  const openNewCategory = () => {
    setCategoryToEdit(null);
    setCategoryName('');
    setCategoryDescription('');
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (cat: Category) => {
    setCategoryToEdit(cat);
    setCategoryName(cat.name);
    setCategoryDescription(cat.description || '');
    setIsCategoryModalOpen(true);
  };

  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error('El nombre de la categoría es requerido');
      return;
    }
    setSavingCategory(true);
    const ok = await handleSaveCategory(categoryName, categoryDescription, categoryToEdit?.id);
    setSavingCategory(false);
    if (ok) {
      setIsCategoryModalOpen(false);
    }
  };

  const confirmDeleteCategory = (id: string, name: string) => {
    setDeleteTarget({ type: 'category', id, name });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    if (deleteTarget.type === 'product') {
      await handleDeleteProduct(deleteTarget.id);
    } else {
      await handleDeleteCategory(deleteTarget.id);
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3E2723]/10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-[#3E2723] text-white shadow-xs'
                : 'bg-white text-[#6B6B6B] hover:text-[#3E2723] border border-[#3E2723]/10'
            }`}
          >
            <Package className="w-4 h-4" />
            Productos ({products.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-[#3E2723] text-white shadow-xs'
                : 'bg-white text-[#6B6B6B] hover:text-[#3E2723] border border-[#3E2723]/10'
            }`}
          >
            <Layers className="w-4 h-4" />
            Categorías ({categories.length})
          </button>
        </div>

        <div>
          {activeTab === 'products' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={openNewProduct}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Nuevo Producto
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={openNewCategory}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Nueva Categoría
            </Button>
          )}
        </div>
      </div>

      {activeTab === 'products' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-[#3E2723]/10 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <Input
                placeholder="Buscar por nombre de variedad o porcentaje..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <div className="w-full sm:w-60">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 text-xs bg-[#F9F6F0] border border-[#3E2723]/20 rounded-lg text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#D84315]/20"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-[#3E2723]/10 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F9F6F0] border-b border-[#3E2723]/10 text-[#3E2723] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Producto</th>
                    <th className="py-3.5 px-4">Categoría</th>
                    <th className="py-3.5 px-4">Precio COP</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3E2723]/5">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8">
                        <Skeleton variant="card" className="h-24 w-full" />
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-[#6B6B6B]">
                        No se encontraron productos coincidentes.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => {
                      const cat = categories.find((c) => c.id === prod.category_id);
                      return (
                        <tr key={prod.id} className="hover:bg-[#F9F6F0]/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#3E2723]/5 shrink-0 border border-[#3E2723]/10">
                                {prod.image_path ? (
                                  <img
                                    src={prod.image_path}
                                    alt={prod.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[9px] text-[#6B6B6B]">
                                    Cacao
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-[#3E2723]">{prod.name}</p>
                                <p className="text-[10px] text-[#6B6B6B] truncate max-w-xs">
                                  {prod.description || 'Sin descripción'}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-[#6B6B6B]">
                            {cat?.name || 'General'}
                          </td>

                          <td className="py-3.5 px-4 font-bold text-[#1E1E1E]">
                            <Money amount={prod.price_cop} />
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                prod.stock === 0
                                  ? 'bg-[#FFEBEE] text-[#C62828]'
                                  : prod.stock < 10
                                  ? 'bg-[#FFF3E0] text-[#ED6C02]'
                                  : 'bg-[#F1F8E9] text-[#558B2F]'
                              }`}
                            >
                              {prod.stock} uds
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                prod.is_active
                                  ? 'bg-[#E8F5E9] text-[#2E7D32]'
                                  : 'bg-[#F5F5F5] text-[#757575]'
                              }`}
                            >
                              {prod.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openEditProduct(prod)}
                                className="p-1.5 text-[#6B6B6B] hover:text-[#3E2723] rounded-md hover:bg-[#F9F6F0] transition-colors"
                                title="Editar producto"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => confirmDeleteProduct(prod.id, prod.name)}
                                className="p-1.5 text-[#6B6B6B] hover:text-[#C62828] rounded-md hover:bg-[#FFEBEE] transition-colors"
                                title="Eliminar producto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Categories Tab */
        <div className="bg-white rounded-xl border border-[#3E2723]/10 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9F6F0] border-b border-[#3E2723]/10 text-[#3E2723] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Nombre de Categoría</th>
                  <th className="py-3.5 px-4">Slug Identificador</th>
                  <th className="py-3.5 px-4">Descripción</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3E2723]/5">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#F9F6F0]/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#3E2723]">
                      {cat.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#6B6B6B]">
                      {cat.slug}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B6B6B] max-w-sm">
                      {cat.description || 'Sin descripción'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditCategory(cat)}
                          className="p-1.5 text-[#6B6B6B] hover:text-[#3E2723] rounded-md hover:bg-[#F9F6F0] transition-colors"
                          title="Editar categoría"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmDeleteCategory(cat.id, cat.name)}
                          className="p-1.5 text-[#6B6B6B] hover:text-[#C62828] rounded-md hover:bg-[#FFEBEE] transition-colors"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Edit/New Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
        categories={categories}
        onSave={handleSaveProduct}
      />

      {/* Category Edit/New Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={categoryToEdit ? 'Editar Categoría' : 'Nueva Categoría de Cacao'}
        maxWidth="md"
      >
        <form onSubmit={submitCategory} className="space-y-4">
          <Input
            label="Nombre de la Categoría *"
            placeholder="Ej. Bombones Pintados"
            required
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />

          <div className="w-full flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#3E2723]/80">
              Descripción de la Línea
            </label>
            <textarea
              rows={2}
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              placeholder="Breve reseña del proceso y características..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#3E2723]/20 rounded-lg text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#D84315]/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#3E2723]/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCategoryModalOpen(false)}
              disabled={savingCategory}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={savingCategory}>
              {categoryToEdit ? 'Guardar Cambios' : 'Crear Categoría'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirmar eliminación"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#1E1E1E]">
            ¿Estás seguro de eliminar{' '}
            <strong className="text-[#3E2723]">"{deleteTarget?.name}"</strong>{' '}
            del sistema? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2 pt-4 border-t border-[#3E2723]/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={executeDelete}
              isLoading={deleting}
            >
              Eliminar definitivamente
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
