import { supabase } from '../../../lib/supabaseClient';
import { Order, OrderItem, PaymentProof, ServiceResult } from '../../../types/db';

// PostgREST devuelve payment_proofs como objeto (no array) porque order_id es UNIQUE.
// Normalizamos para que la app siempre reciba arrays.
export function normalizeOrder(raw: unknown): Order {
  const o = raw as Record<string, unknown>;
  const rawProofs = o.payment_proofs;
  const rawItems = o.items;
  return {
    ...(o as unknown as Order),
    items: Array.isArray(rawItems) ? (rawItems as OrderItem[]) : rawItems ? [rawItems as OrderItem] : [],
    payment_proofs: Array.isArray(rawProofs)
      ? (rawProofs as PaymentProof[])
      : rawProofs
      ? [rawProofs as PaymentProof]
      : [],
  };
}

export async function getMyOrders(userId: string): Promise<ServiceResult<Order[]>> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        payment_proofs(*)
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42501' || error.message.toLowerCase().includes('row-level security')) {
        return { data: null, error: 'No tienes permisos para ver estos pedidos.' };
      }
      return { data: null, error: error.message };
    }

    return { data: (data || []).map(normalizeOrder), error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar pedidos.';
    return { data: null, error: message };
  }
}

export async function getOrderById(orderId: string): Promise<ServiceResult<Order>> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        payment_proofs(*)
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: normalizeOrder(data), error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar la orden.';
    return { data: null, error: message };
  }
}
