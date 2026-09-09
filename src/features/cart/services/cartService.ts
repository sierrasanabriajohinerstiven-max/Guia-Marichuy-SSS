import { supabase } from '../../../lib/supabaseClient';
import { Product, ServiceResult } from '../../../types/db';

/**
 * Revalidates stock and active status of products currently in cart.
 */
export async function fetchCartProducts(productIds: string[]): Promise<ServiceResult<Product[]>> {
  try {
    if (productIds.length === 0) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data as Product[]) || [], error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al consultar productos del carrito';
    return { data: null, error: message };
  }
}
