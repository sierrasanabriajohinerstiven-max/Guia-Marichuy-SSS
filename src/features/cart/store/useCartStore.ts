import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartLineItem, Product } from '../../../types/db';

export interface CartStoreState {
  items: CartLineItem[];
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  syncProductData: (latestProducts: Product[]) => void;
  getTotalCount: () => number;
  getEstimatedTotal: () => number;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            const currentItem = updated[existingIndex];
            const newQuantity = Math.min(
              currentItem.quantity + quantity,
              product.stock
            );
            updated[existingIndex] = {
              ...currentItem,
              product, // keep fresh product data
              quantity: newQuantity,
            };
            return { items: updated, isDrawerOpen: true };
          }

          const safeQuantity = Math.min(Math.max(1, quantity), product.stock);
          return {
            items: [...state.items, { product, quantity: safeQuantity }],
            isDrawerOpen: true,
          };
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.product.id !== productId),
            };
          }
          return {
            items: state.items.map((item) => {
              if (item.product.id === productId) {
                const maxQty = item.product.stock;
                return {
                  ...item,
                  quantity: Math.min(quantity, maxQty),
                };
              }
              return item;
            }),
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      syncProductData: (latestProducts: Product[]) => {
        set((state) => {
          const map = new Map(latestProducts.map((p) => [p.id, p]));
          const updatedItems = state.items.map((item) => {
            const fresh = map.get(item.product.id);
            if (!fresh) return item;
            return {
              ...item,
              product: fresh,
              // don't exceed latest stock
              quantity: Math.min(item.quantity, fresh.stock > 0 ? fresh.stock : 1),
            };
          });
          return { items: updatedItems };
        });
      },

      getTotalCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },

      getEstimatedTotal: () => {
        return get().items.reduce(
          (acc, item) => acc + item.product.price_cop * item.quantity,
          0
        );
      },
    }),
    {
      name: 'marichuy-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
