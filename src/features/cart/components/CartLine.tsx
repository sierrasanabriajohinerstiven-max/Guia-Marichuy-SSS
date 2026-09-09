import React from 'react';
import { CartLineItem } from '../../../types/db';
import { Money } from '../../../components/ui/Money';
import { Minus, Plus, Trash2, AlertTriangle } from 'lucide-react';

export interface CartLineProps {
  item: CartLineItem;
  isInvalid?: boolean;
  invalidReason?: string;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export const CartLine: React.FC<CartLineProps> = ({
  item,
  isInvalid = false,
  invalidReason,
  onUpdateQuantity,
  onRemove,
}) => {
  const { product, quantity } = item;
  const lineTotal = product.price_cop * quantity;
  const maxStock = product.stock;

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-xl border transition-colors flex gap-3.5 sm:gap-4 ${
        isInvalid
          ? 'bg-[#FFEBEE]/50 border-[#C62828]/40'
          : 'bg-white border-[#3E2723]/10'
      }`}
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-[#3E2723]/5 shrink-0 border border-[#3E2723]/10">
        {product.image_path ? (
          <img
            src={product.image_path}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-[#6B6B6B]">
            Cacao
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-bold text-[#3E2723] line-clamp-1">
              {product.name}
            </h4>
            <button
              type="button"
              onClick={() => onRemove(product.id)}
              className="text-[#6B6B6B] hover:text-[#C62828] p-1 rounded transition-colors"
              title="Eliminar producto"
              aria-label={`Eliminar ${product.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <Money amount={product.price_cop} className="text-xs text-[#6B6B6B]" />
            <span className="text-[10px] text-[#6B6B6B]">c/u</span>
          </div>

          {isInvalid && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#C62828]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{invalidReason || 'Este producto ya no está disponible'}</span>
            </div>
          )}
        </div>

        {/* Stepper and total */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#3E2723]/5">
          <div className="flex items-center border border-[#3E2723]/20 rounded bg-[#F9F6F0]">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => onUpdateQuantity(product.id, quantity - 1)}
              className="w-7 h-7 flex items-center justify-center text-[#3E2723] hover:bg-white disabled:opacity-30 transition-colors"
              aria-label="Restar una unidad"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-7 text-center text-xs font-bold text-[#1E1E1E]">
              {quantity}
            </span>
            <button
              type="button"
              disabled={quantity >= maxStock || product.stock <= 0}
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
              className="w-7 h-7 flex items-center justify-center text-[#3E2723] hover:bg-white disabled:opacity-30 transition-colors"
              aria-label="Sumar una unidad"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <Money amount={lineTotal} className="text-sm font-bold text-[#3E2723]" />
        </div>
      </div>
    </div>
  );
};
