import { useState } from 'react';
import { CartLineItem, EnvioPayload } from '../../../types/db';
import { invokeCrearPedido } from '../services/checkoutService';
import { useCartStore } from '../../cart/store/useCartStore';
import toast from 'react-hot-toast';

export function useCheckout() {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const clearCart = useCartStore((state) => state.clearCart);

  const processCashOrder = async (
    items: CartLineItem[],
    envio: EnvioPayload
  ): Promise<{ success: boolean; orderId?: string }> => {
    setLoading(true);
    setErrorBanner(null);

    const res = await invokeCrearPedido(items, envio, 'efectivo', null);

    if (res.error) {
      // Interceptamos la excepción de Postgres (stock insuficiente, producto inactivo, etc.)
      // NO vaciamos el carrito y pintamos en el banner rojo
      setErrorBanner(res.error);
      toast.error('Error al procesar el pedido. Revisa los detalles.');
      setLoading(false);
      return { success: false };
    }

    // Éxito: vaciamos el carrito y retornamos el orderId
    clearCart();
    toast.success('¡Pedido en efectivo registrado con éxito!');
    setLoading(false);
    return { success: true, orderId: res.data || undefined };
  };

  return {
    loading,
    errorBanner,
    setErrorBanner,
    processCashOrder,
  };
}
