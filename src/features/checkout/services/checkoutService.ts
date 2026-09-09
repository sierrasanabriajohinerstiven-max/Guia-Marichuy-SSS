import { supabase } from '../../../lib/supabaseClient';
import { CartLineItem, EnvioPayload, ServiceResult, RpcCrearPedidoItem } from '../../../types/db';

export async function invokeCrearPedido(
  items: CartLineItem[],
  envio: EnvioPayload,
  metodo: 'nequi' | 'efectivo',
  comprobantePath: string | null
): Promise<ServiceResult<string>> {
  try {
    const rpcItems: RpcCrearPedidoItem[] = items.map((i) => ({
      product_id: i.product.id,
      quantity: i.quantity,
    }));

    const { data, error } = await supabase.rpc('crear_pedido', {
      p_items: rpcItems,
      p_envio: envio,
      p_metodo: metodo,
      p_comprobante_path: comprobantePath,
    });

    if (error) {
      // Capturamos cualquier error de Postgres o RLS o EXCEPTION de stock / producto
      let message = error.message;
      if (error.code === '42501' || message.toLowerCase().includes('row-level security')) {
        message = 'No tienes permisos para realizar esta acción. Por favor verifica tu sesión.';
      } else if (message.toLowerCase().includes('stock')) {
        message = `Disponibilidad agotada o insuficiente: ${message}`;
      } else if (message.toLowerCase().includes('inactivo')) {
        message = 'Uno de los productos en tu carrito ya no está a la venta.';
      }
      return { data: null, error: message };
    }

    if (!data) {
      return { data: null, error: 'No se recibió el identificador de la orden creada.' };
    }

    return { data: data as string, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado al procesar la orden.';
    return { data: null, error: message };
  }
}
