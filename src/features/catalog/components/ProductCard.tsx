import React from 'react';
import { Product } from '../../../types/db';
import { Money } from '../../../components/ui/Money';
import { Button } from '../../../components/ui/Button';
import { useCartStore } from '../../cart/store/useCartStore';
import { ShoppingBag, Eye, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export interface ProductCardProps {
  product: Product;
  onViewDetail: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetail }) => {
  const addItem = useCartStore((state) => state.addItem);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(product, 1);
    toast.success(`${product.name} agregado al carrito`);
  };

  return (
    <div
      onClick={() => onViewDetail(product.id)}
      className="group bg-white rounded-xl border border-[#3E2723]/10 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative w-full aspect-square bg-[#3E2723]/5 overflow-hidden">
        {product.image_path ? (
          <img
            src={product.image_path}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#3E2723]/40 bg-[#EFEBE9]">
            <ShoppingBag className="w-12 h-12 stroke-[1.2]" />
          </div>
        )}

        {/* Badges on image */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {isOutOfStock ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#C62828] text-white shadow-xs">
              Agotado
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ED6C02] text-white shadow-xs">
              ¡Últimas {product.stock} uds!
            </span>
          ) : null}
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-[#3E2723] group-hover:text-[#D84315] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-[#6B6B6B] mt-1 line-clamp-2 leading-relaxed">
            {product.description || 'Chocolate fino de aroma elaborado artesanalmente.'}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#3E2723]/5 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6B6B] block">
              Precio
            </span>
            <Money amount={product.price_cop} className="text-base font-bold text-[#3E2723]" />
          </div>

          <Button
            size="sm"
            variant={isOutOfStock ? 'outline' : 'primary'}
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
          >
            {isOutOfStock ? 'Sin Stock' : 'Agregar'}
          </Button>
        </div>
      </div>
    </div>
  );
};
