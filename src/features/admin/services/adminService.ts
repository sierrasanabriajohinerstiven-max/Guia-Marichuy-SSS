import { supabase } from '../../../lib/supabaseClient';
import {
  Order,
  Product,
  Category,
  Profile,
  EstadoPedido,
  ServiceResult,
} from '../../../types/db';
import { normalizeOrder } from '../../orders/services/orderService';

export interface AdminStats {
  monthlyRevenue: number;
  activeOrdersCount: number;
  lowStockProductsCount: number;
  totalOrdersCount: number;
  lowStockProducts: Product[];
}

export async function getAdminStats(): Promise<ServiceResult<AdminStats>> {
  try {
    // 1. Consultar pedidos
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      if (ordersError.code === '42501' || ordersError.message.toLowerCase().includes('row-level security')) {
        return { data: null, error: 'No tienes permisos de administrador.' };
      }
      return { data: null, error: ordersError.message };
    }

    // 2. Consultar productos para alerta de inventario < 10
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*');

    if (productsError) {
      return { data: null, error: productsError.message };
    }

    const orders = (ordersData as Order[]) || [];
    const products = (productsData as Product[]) || [];

    // Agregación en frontend de ventas del mes excluyendo cancelado
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyOrders = orders.filter((o) => {
      const orderDate = new Date(o.created_at);
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    });

    const monthlyRevenue = monthlyOrders
      .filter((o) => o.status !== 'cancelado')
      .reduce((sum, o) => sum + (o.total_cop || 0), 0);

    const activeOrdersCount = orders.filter(
      (o) =>
        o.status === 'verificando_pedido' ||
        o.status === 'verificando_pago' ||
        o.status === 'preparando' ||
        o.status === 'en_camino'
    ).length;

    const lowStockProducts = products.filter((p) => p.stock < 10);

    return {
      data: {
        monthlyRevenue,
        activeOrdersCount,
        lowStockProductsCount: lowStockProducts.length,
        totalOrdersCount: orders.length,
        lowStockProducts,
      },
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al calcular estadísticas.';
    return { data: null, error: message };
  }
}

export async function getAdminProducts(): Promise<ServiceResult<Product[]>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: (data as Product[]) || [], error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar productos';
    return { data: null, error: message };
  }
}

export async function getAdminCategories(): Promise<ServiceResult<Category[]>> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data: (data as Category[]) || [], error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar categorías';
    return { data: null, error: message };
  }
}

export async function createProduct(productData: Omit<Product, 'id'>): Promise<ServiceResult<Product>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as Product, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al crear producto';
    return { data: null, error: message };
  }
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<ServiceResult<Product>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as Product, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al actualizar producto';
    return { data: null, error: message };
  }
}

export async function deleteProduct(id: string): Promise<ServiceResult<boolean>> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return { data: null, error: error.message };
    return { data: true, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al eliminar producto';
    return { data: null, error: message };
  }
}

export async function uploadProductImage(file: File): Promise<ServiceResult<{ publicUrl: string }>> {
  try {
    if (file.size > 5 * 1024 * 1024) {
      return { data: null, error: 'La imagen del producto no debe exceder 5MB' };
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
      return { data: null, error: 'Solo se permiten imágenes en formato .jpg, .png o .webp' };
    }

    const uniquePath = `products/${Date.now()}-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(uniquePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      return { data: null, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(uniquePath);

    return { data: { publicUrl: publicUrlData.publicUrl }, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al subir imagen del producto';
    return { data: null, error: message };
  }
}

export async function createCategory(name: string, description?: string): Promise<ServiceResult<Category>> {
  try {
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: name.trim(), slug, description: description?.trim() || null }])
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as Category, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al crear categoría';
    return { data: null, error: message };
  }
}

export async function updateCategory(id: string, name: string, description?: string): Promise<ServiceResult<Category>> {
  try {
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { data, error } = await supabase
      .from('categories')
      .update({ name: name.trim(), slug, description: description?.trim() || null })
      .eq('id', id)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as Category, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al actualizar categoría';
    return { data: null, error: message };
  }
}

export async function deleteCategory(id: string): Promise<ServiceResult<boolean>> {
  try {
    // Validación: no permite eliminar una categoría con productos asociados
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countError) return { data: null, error: countError.message };

    if (count && count > 0) {
      return {
        data: null,
        error: `No se puede eliminar esta categoría porque contiene ${count} producto(s) asociado(s). Reasigna o elimina los productos primero.`,
      };
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return { data: null, error: error.message };
    return { data: true, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al eliminar categoría';
    return { data: null, error: message };
  }
}

export async function getAdminOrders(
  statusFilter?: EstadoPedido | 'todas',
  daysLimit: number = 30
): Promise<ServiceResult<Order[]>> {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        payment_proofs(*)
      `)
      .order('created_at', { ascending: false });

    if (daysLimit > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysLimit);
      query = query.gte('created_at', cutoff.toISOString());
    }

    if (statusFilter && statusFilter !== 'todas') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) return { data: null, error: error.message };
    return { data: (data || []).map(normalizeOrder), error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar pedidos de admin';
    return { data: null, error: message };
  }
}

export async function revisarComprobante(
  orderId: string,
  decision: 'aprobado' | 'rechazado',
  motivo?: string
): Promise<ServiceResult<boolean>> {
  try {
    if (decision === 'rechazado' && (!motivo || !motivo.trim())) {
      return { data: null, error: 'El motivo del rechazo es obligatorio.' };
    }

    const { error } = await supabase.rpc('revisar_comprobante', {
      p_order_id: orderId,
      p_decision: decision,
      p_motivo: motivo?.trim() || '',
    });

    if (error) return { data: null, error: error.message };
    return { data: true, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al moderar comprobante';
    return { data: null, error: message };
  }
}

export async function cambiarEstadoPedido(
  orderId: string,
  nuevoEstado: EstadoPedido
): Promise<ServiceResult<boolean>> {
  try {
    const { error } = await supabase.rpc('cambiar_estado_pedido', {
      p_order_id: orderId,
      p_nuevo_estado: nuevoEstado,
    });

    if (error) return { data: null, error: error.message };
    return { data: true, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al cambiar estado del pedido';
    return { data: null, error: message };
  }
}

export async function getAdminClients(): Promise<ServiceResult<Profile[]>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: (data as Profile[]) || [], error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar clientes';
    return { data: null, error: message };
  }
}
