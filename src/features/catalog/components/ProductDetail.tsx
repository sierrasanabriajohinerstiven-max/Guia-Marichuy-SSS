import React, { useState } from 'react';
import { Product } from '../../../types/db';
import { Money } from '../../../components/ui/Money';
import { Button } from '../../../components/ui/Button';
import { useCartStore } from '../../cart/store/useCartStore';
import { ArrowLeft, ShoppingBag, Minus, Plus, CheckCircle, ShieldCheck, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

export interface ProductDetailProps {
  product: Product | null;
  loading: boolean;
  error: string | null;
  onBack: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  loading,
  error,
  onBack,
}) => {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState<number>(1);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 sm:p-8 rounded-xl border border-[#3E2723]/10 animate-pulse">
          <div className="aspect-square bg-[#3E2723]/10 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-[#3E2723]/10 rounded-md w-3/4" />
            <div className="h-6 bg-[#3E2723]/10 rounded-md w-1/3" />
            <div className="h-24 bg-[#3E2723]/10 rounded-md w-full" />
            <div className="h-12 bg-[#3E2723]/10 rounded-md w-full mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <h3 className="text-xl font-bold text-[#3E2723] mb-2">Producto no disponible</h3>
        <p className="text-sm text-[#6B6B6B] mb-6">
          {error || 'El producto seleccionado no existe o fue retirado del catálogo.'}
        </p>
        <Button variant="primary" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Regresar al Catálogo
        </Button>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const maxStock = product.stock;

  const handleIncrement = () => {
    if (quantity < maxStock) setQuantity((q) => q + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    toast.success(`${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} de "${product.name}" agregadas al carrito`);
  };

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 space-y-6">
      <button
        onClick={onBack}
        type="button"
        className="inline-flex items-center text-xs font-bold text-[#3E2723] hover:text-[#D84315] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Volver a todos los chocolates
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white p-6 sm:p-10 rounded-xl border border-[#3E2723]/10 shadow-sm">
        {/* Product Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-[#3E2723]/5 border border-[#3E2723]/10">
          {product.image_path ? (
            <img
              src={product.image_path}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#3E2723]/40 bg-[#EFEBE9]">
              <ShoppingBag className="w-20 h-20 stroke-[1.2]" />
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-[#C62828] text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
                Agotado Temporalmente
              </span>
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#EFEBE9] text-[#3E2723]">
                Chocolatería de Origen
              </span>
              {product.stock > 0 && product.stock <= 5 && (
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#FFF3E0] text-[#ED6C02]">
                  ¡Pocas existencias: {product.stock} disponibles!
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#3E2723] tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3">
              <Money amount={product.price_cop} className="text-3xl font-extrabold text-[#D84315]" />
              <span className="text-xs text-[#6B6B6B]">IVA incluido (COP)</span>
            </div>

            <div className="border-t border-b border-[#3E2723]/10 py-4 my-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#3E2723] mb-2">
                Descripción & Perfil de Sabor
              </h2>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">
                {product.description ||
                  'Delicada pieza de chocolatería artesanal elaborada con cacaos seleccionados a mano, fermentación controlada y tostado suave para resaltar los atributos aromáticos florales y afrutados propios del suelo colombiano.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-[#3E2723]/90">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F9F6F0]">
                <ShieldCheck className="w-4 h-4 text-[#558B2F]" />
                <span>100% Cacao Colombiano</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F9F6F0]">
                <Truck className="w-4 h-4 text-[#0288D1]" />
                <span>Envíos Nacionales</span>
              </div>
            </div>
          </div>

          {/* Quantity & CTA */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-[#3E2723] uppercase">Cantidad:</span>
              <div className="flex items-center border border-[#3E2723]/20 rounded-lg bg-[#F9F6F0] p-1">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-8 h-8 flex items-center justify-center rounded text-[#3E2723] hover:bg-white disabled:opacity-30 transition-colors"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-[#1E1E1E]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={quantity >= maxStock || isOutOfStock}
                  className="w-8 h-8 flex items-center justify-center rounded text-[#3E2723] hover:bg-white disabled:opacity-30 transition-colors"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-[#6B6B6B]">
                (Disponible: {product.stock} uds)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="lg"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1"
                leftIcon={<ShoppingBag className="w-5 h-5" />}
              >
                {isOutOfStock ? 'Producto Agotado' : `Agregar ${quantity} al Carrito`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
