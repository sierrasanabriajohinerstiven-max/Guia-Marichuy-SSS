export type EstadoPedido =
  | 'verificando_pedido'
  | 'verificando_pago'
  | 'preparando'
  | 'en_camino'
  | 'entregado'
  | 'cancelado';

export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cop: number;
  stock: number;
  image_path: string | null;
  is_active: boolean;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  product_name: string;
  unit_price_cop: number;
  created_at: string;
}

export interface PaymentProof {
  id: string;
  order_id: string;
  storage_path: string;
  review_status: 'pendiente' | 'aprobado' | 'rechazado';
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export interface OrderShippingAddress {
  address: string;
  city: string;
  notes?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  status: EstadoPedido;
  payment_method: 'nequi' | 'efectivo';
  subtotal_cop: number;
  total_cop: number;
  customer_name: string;
  customer_email: string;
  phone_number: string;
  shipping_address: OrderShippingAddress;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  payment_proofs?: PaymentProof[];
}

export interface CartLineItem {
  product: Product;
  quantity: number;
}

export interface EnvioPayload {
  nombre: string;
  email: string;
  telefono: string;
  direccion: OrderShippingAddress;
}

export type CanonicalView =
  | 'auth'
  | 'catalogo'
  | 'producto'
  | 'carrito'
  | 'checkout'
  | 'pago-nequi'
  | 'pedido-confirmado'
  | 'mis-pedidos'
  | 'perfil'
  | 'admin-dashboard'
  | 'admin-productos'
  | 'admin-pedidos'
  | 'admin-clientes'
  | 'recuperar-clave';

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

export interface RpcCrearPedidoItem {
  product_id: string;
  quantity: number;
}
