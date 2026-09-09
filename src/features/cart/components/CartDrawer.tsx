import React, { useEffect, useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { CartLine } from './CartLine';
import { Money } from '../../../components/ui/Money';
import { Button } from '../../../components/ui/Button';
import { fetchCartProducts } from '../services/cartService';
import { Product } from '../../../types/db';
import { X, ShoppingBag, ArrowRight, ShieldCheck, AlertOctagon } from 'lucide-react';

export interface CartDrawerProps {
  onGoToCheckout: () => void;
  onExploreCatalog: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onGoToCheckout,
  onExploreCatalog,
}) => {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    clearCart,
    syncProductData,
    getEstimatedTotal,
  } = useCartStore();

  const [invalidMap, setInvalidMap] = useState<Record<string, string>>({});
  const [revalidating, setRevalidating] = useState<boolean>(false);

  // EFECTO DE MONTAJE: Revalida contra products por los IDs del useCartStore
  // Si un ítem quedó inactivo o supera el stock, deshabilita el avance y marca la línea
  useEffect(() => {
    if (!isDrawerOpen || items.length === 0) {
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
          // Si no pudimos conectar a la BD, validamos con los datos locales del producto
          for (const item of items) {
            if (!item.product.is_active) {
              newInvalidMap[item.product.id] = 'Este producto ya no está activo';
            } else if (item.product.stock <= 0) {
              newInvalidMap[item.product.id] = 'Este producto ya no está disponible (Agotado)';
            } else if (item.quantity > item.product.stock) {
              newInvalidMap[item.product.id] = `Stock insuficiente: solo quedan ${item.product.stock} unidades`;
            }
          }
        } else {
          syncProductData(data as Product[]);
          const freshMap = new Map((data as Product[]).map((p) => [p.id, p]));

          for (const item of items) {
            const fresh = freshMap.get(item.product.id);
            if (!fresh || !fresh.is_active) {
              newInvalidMap[item.product.id] = 'Este producto ya no está disponible';
            } else if (fresh.stock <= 0) {
              newInvalidMap[item.product.id] = 'Producto agotado';
            } else if (item.quantity > fresh.stock) {
              newInvalidMap[item.product.id] = `Stock insuficiente: solo quedan ${fresh.stock} unidades`;
            }
          }
        }

        setInvalidMap(newInvalidMap);
      } catch (err) {
        console.warn('Error revalidando stock en carrito:', err);
      } finally {
        if (mounted) setRevalidating(false);
      }
    }

    revalidateStock();

    return () => {
      mounted = false;
    };
  }, [isDrawerOpen, items.length, syncProductData]);

  if (!isDrawerOpen) return null;

  const hasInvalidItems = Object.keys(invalidMap).length > 0;
  const estimatedTotal = getEstimatedTotal();

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#F9F6F0] shadow-2xl flex flex-col border-l border-[#3E2723]/15">
          {/* Drawer Header */}
          <div className="p-5 bg-white border-b border-[#3E2723]/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#3E2723]" />
              <h2 className="text-lg font-bold text-[#3E2723]">Cesta de Compras</h2>
              <span className="text-xs font-semibold text-[#6B6B6B] bg-[#F9F6F0] px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? 'ítem' : 'ítems'}
              </span>
            </div>
            <button
              onClick={closeDrawer}
              type="button"
              className="p-2 text-[#6B6B6B] hover:text-[#1E1E1E] rounded-lg hover:bg-[#F9F6F0] transition-colors"
              aria-label="Cerrar cesta"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white border border-[#3E2723]/10 flex items-center justify-center text-[#3E2723]/40">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#3E2723]">Tu cesta está vacía</h3>
                  <p className="text-xs text-[#6B6B6B] mt-1 max-w-xs">
                    Descubre nuestras tabletas bean-to-bar, bombones pintados a mano y trufas artesanales.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    closeDrawer();
                    onExploreCatalog();
                  }}
                >
                  Explorar Catálogo
                </Button>
              </div>
            ) : (
              <>
                {hasInvalidItems && (
                  <div className="p-3 bg-[#FFEBEE] border border-[#C62828]/20 rounded-lg text-xs text-[#C62828] flex items-start gap-2">
                    <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Hay productos no disponibles</p>
                      <p className="text-[11px] mt-0.5">
                        Por favor retira o ajusta las unidades señaladas en rojo para poder continuar al pago.
                      </p>
                    </div>
                  </div>
                )}

                {items.map((line) => (
                  <CartLine
                    key={line.product.id}
                    item={line}
                    isInvalid={Boolean(invalidMap[line.product.id])}
                    invalidReason={invalidMap[line.product.id]}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </>
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-5 bg-white border-t border-[#3E2723]/10 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#6B6B6B]">
                  <span>Subtotal</span>
                  <Money amount={estimatedTotal} className="text-sm font-semibold text-[#1E1E1E]" />
                </div>
                <div className="flex items-center justify-between text-base font-bold text-[#3E2723] pt-2 border-t border-[#3E2723]/5">
                  <span>Total (COP)</span>
                  <Money amount={estimatedTotal} className="text-lg text-[#D84315]" />
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="lg"
                  disabled={hasInvalidItems || revalidating}
                  onClick={() => {
                    closeDrawer();
                    onGoToCheckout();
                  }}
                  className="w-full"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {hasInvalidItems ? 'Ajustar Productos para Pagar' : 'Ir a Pagar'}
                </Button>

                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full text-center text-xs text-[#6B6B6B] hover:text-[#C62828] py-1 transition-colors"
                >
                  Vaciar cesta
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#6B6B6B]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#558B2F]" />
                <span>Pago manual verificado: Nequi o Efectivo contra entrega</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
