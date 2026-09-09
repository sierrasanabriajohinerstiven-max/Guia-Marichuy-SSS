import React, { useState, useEffect } from 'react';
import { Product, Category } from '../../../types/db';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { uploadProductImage } from '../services/adminService';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { sanitizeText, toSlug, isSafeImageUrl, clampInt, MAX } from '../../../lib/validation';

export interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
  categories: Category[];
  onSave: (productData: Partial<Product>, editingId?: string) => Promise<boolean>;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  categories,
  onSave,
}) => {
  const [name, setName] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [priceCop, setPriceCop] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [imagePath, setImagePath] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setCategoryId(productToEdit.category_id || (categories[0]?.id ?? ''));
      setPriceCop(productToEdit.price_cop || 0);
      setStock(productToEdit.stock || 0);
      setDescription(productToEdit.description || '');
      setImagePath(productToEdit.image_path || '');
      setIsActive(productToEdit.is_active);
    } else {
      setName('');
      setCategoryId(categories[0]?.id ?? '');
      setPriceCop(25000);
      setStock(10);
      setDescription('');
      setImagePath('');
      setIsActive(true);
    }
  }, [productToEdit, categories, isOpen]);

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingImage(true);
      const res = await uploadProductImage(file);
      setUploadingImage(false);

      if (res.error || !res.data) {
        toast.error(res.error || 'Error al subir la fotografía');
      } else {
        setImagePath(res.data.publicUrl);
        toast.success('Fotografía del producto subida con éxito');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = sanitizeText(name, MAX.productName);
    if (!cleanName) {
      toast.error('El nombre del producto es obligatorio');
      return;
    }

    if (!categoryId) {
      toast.error('Selecciona una categoría');
      return;
    }

    if (priceCop <= 0) {
      toast.error('El precio en COP debe ser mayor a cero');
      return;
    }

    if (stock < 0) {
      toast.error('El stock no puede ser negativo');
      return;
    }

    if (imagePath.trim() && !isSafeImageUrl(imagePath)) {
      toast.error('La URL de imagen debe empezar por https://');
      return;
    }

    setLoading(true);

    const payload: Partial<Product> = {
      name: cleanName,
      slug: toSlug(cleanName) || ('producto-' + Date.now()),
      category_id: categoryId,
      price_cop: clampInt(Number(priceCop), 0, 100000000),
      stock: clampInt(Number(stock), 0, 1000000),
      description: sanitizeText(description, MAX.description) || null,
      image_path: imagePath.trim() || null,
      is_active: isActive,
    };

    const success = await onSave(payload, productToEdit?.id);
    setLoading(false);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? 'Editar Producto Artesanal' : 'Nuevo Producto Artesanal'}
      description="Configura los atributos técnicos, precio en COP y fotografía del producto"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del Producto *"
          placeholder="Ej. Tableta Sierra Nevada 72%"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#3E2723]/80">
              Categoría *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-white border border-[#3E2723]/20 rounded-lg text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#D84315]/20 focus:border-[#D84315]"
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Precio COP *"
            type="number"
            min={0}
            step={500}
            required
            value={priceCop}
            onChange={(e) => setPriceCop(Number(e.target.value))}
          />

          <Input
            label="Stock Disponible *"
            type="number"
            min={0}
            required
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
          />
        </div>

        <div className="w-full flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#3E2723]/80">
            Descripción & Notas de Cata
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalles sobre el porcentaje de cacao, origen geográfico y notas sensoriales..."
            className="w-full px-3.5 py-2 text-sm bg-white border border-[#3E2723]/20 rounded-lg text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#D84315]/20 focus:border-[#D84315]"
          />
        </div>

        {/* Imagen del Producto */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#3E2723]/80 block">
            Fotografía del Producto (Bucket product-images)
          </label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-[#3E2723]/5 border border-[#3E2723]/10 overflow-hidden shrink-0 flex items-center justify-center">
              {imagePath ? (
                <img src={imagePath} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-6 h-6 text-[#6B6B6B]" />
              )}
            </div>

            <div className="flex-1">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-[#3E2723]/20 rounded-lg hover:bg-white transition-colors">
                <UploadCloud className="w-4 h-4 text-[#D84315]" />
                <span>{uploadingImage ? 'Subiendo...' : 'Cargar Imagen (< 5MB)'}</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/*"
                  onChange={handleImageFile}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-[#6B6B6B] mt-1">O ingresa una URL directa de imagen:</p>
            </div>
          </div>

          <Input
            placeholder="https://images.unsplash.com/..."
            value={imagePath}
            onChange={(e) => setImagePath(e.target.value)}
          />
        </div>

        {/* Is Active Toggle */}
        <div className="pt-2 flex items-center gap-3">
          <input
            type="checkbox"
            id="is-active-check"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 accent-[#D84315] rounded cursor-pointer"
          />
          <label htmlFor="is-active-check" className="text-xs font-semibold text-[#3E2723] cursor-pointer">
            Producto Activo (Visible en el catálogo público)
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#3E2723]/10">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {productToEdit ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
