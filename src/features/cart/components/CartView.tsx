import React, { useEffect, useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { fetchCartProducts } from '../services/cartService';
import { CartLine } from './CartLine';
import { Money } from '../../../components/ui/Money';
import { Button } from '../../../components/ui/Button';
import { ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

export interface CartViewProps {
  onNavigateToCatalog: () => void;
  onNavigateToCheckout: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  onNavigateToCatalog,
  onNavigateToCheckout,
}) => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    syncProductData,
    getEstimatedTotal,
  } = useCartStore();

  const [invalidMap, setInvalidMap] = useState<Record<string, string>>({});
  const [revalidating, setRevalidating] = useState<boolean>(false);

  useEffect(() => {
    if (items.length === 0) {
      setInvalidMap({});
      return;
    }

    let mounted = true;

    async function revalidateStock() {
      setRevalidating(true);
      const productIds = items.map((i) => i.product.id);

      try {
        const { data, error } = await fetchCartProducts(productIds);
        if (!mounted) return;

        const newInvalidMap: Record<string, string> = {};

        if (error || !data) {
          for (const item of items) {
            if (!item.product.is_active) {
              newInvalidMap[item.product.id] = 'Este producto ya no está activo';
            } else if (item.product.stock <= 0) {
              newInvalidMap[item.product.id] = 'Este producto está agotado';
            } else if (item.quantity > item.product.stock) {
              newInvalidMap[item.product.id] = `Stock insuficiente: quedan ${item.product.stock} unidades`;
            }
          }
        } else {
          syncProductData(data);
          for (const freshProduct of data) {
            const inCart = items.find((i) => i.product.id === freshProduct.id);
            if (!inCart) continue;

            if (!freshProduct.is_active) {
              newInvalidMap[freshProduct.id] = 'Este producto ya no se encuentra activo';
            } else if (freshProduct.stock <= 0) {
              newInvalidMap[freshProduct.id] = 'Este producto se agotó recientemente';
            } else if (inCart.quantity > freshProduct.stock) {
              newInvalidMap[freshProduct.id] = `Stock disponible superado: solo quedan ${freshProduct.stock} unidades`;
            }
          }
        }

        setInvalidMap(newInvalidMap);
      } catch {
        // Fallback silencioso sin romper la pantalla
      } finally {
        if (mounted) setRevalidating(false);
      }
    }

    revalidateStock();

    return () => {
      mounted = false;
    };
  }, [items.length]);

  const estimatedTotal = getEstimatedTotal();
  const hasInvalidItems = Object.keys(invalidMap).length > 0;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#3E2723]/5 flex items-center justify-center text-[#8D6E63]">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#3E2723] mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-sm text-[#6B6B6B] max-w-md mx-auto mb-8">
          Aún no has añadido ningún chocolate a tu selección. Descubre nuestras barras de origen, trufas y bombones artesanales.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={onNavigateToCatalog}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Explorar catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={onNavigateToCatalog}
            className="inline-flex items-center gap-1 text-xs text-[#8D6E63] hover:text-[#3E2723] font-medium transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Continuar comprando
          </button>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#3E2723]">
            Carrito de Compras
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-[#8D6E63] hover:text-[#D84315] underline transition-colors"
        >
          Vaciar carrito
        </button>
      </div>

      {hasInvalidItems && (
        <div className="mb-6 p-4 bg-[#D84315]/10 border border-[#D84315]/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#D84315] shrink-0 mt-0.5" />
          <div className="text-xs text-[#1E1E1E]">
            <p className="font-semibold text-[#D84315] mb-1">
              Atención en tu pedido
            </p>
            <p className="text-[#6B6B6B]">
              Algunos productos tienen ajustes de stock o disponibilidad. Por favor revisa las cantidades antes de continuar.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Lista de productos */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#3E2723]/10 p-6 shadow-sm divide-y divide-[#3E2723]/5">
          {items.map((item) => (
            <div key={item.product.id} className="py-4 first:pt-0 last:pb-0">
              <CartLine
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={() => removeItem(item.product.id)}
              />
              {invalidMap[item.product.id] && (
                <p className="mt-2 text-xs text-[#D84315] font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {invalidMap[item.product.id]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Resumen del pedido */}
        <div className="bg-white rounded-2xl border border-[#3E2723]/10 p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-[#3E2723] pb-3 border-b border-[#3E2723]/10">
            Resumen de compra
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-[#6B6B6B]">
              <span>Subtotal</span>
              <Money amount={estimatedTotal} className="font-semibold text-[#1E1E1E]" />
            </div>
            <div className="flex justify-between text-base font-bold text-[#3E2723] pt-3 border-t border-[#3E2723]/10">
              <span>Total a Pagar</span>
              <Money amount={estimatedTotal} className="text-xl text-[#D84315]" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              disabled={hasInvalidItems || revalidating}
              onClick={onNavigateToCheckout}
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continuar al checkout
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={onNavigateToCatalog}
              className="w-full"
            >
              Explorar más chocolates
            </Button>
          </div>

          <div className="pt-4 border-t border-[#3E2723]/10 flex items-center justify-center gap-2 text-xs text-[#6B6B6B]">
            <ShieldCheck className="w-4 h-4 text-[#558B2F]" />
            <span>Pago seguro garantizado con Nequi</span>
          </div>
        </div>
      </div>
    </div>
  );
};
