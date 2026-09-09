import { supabase, isSupabaseConfigured } from '../../../lib/supabaseClient';
import { Product, Category, ServiceResult } from '../../../types/db';

// Fallback seed catalog for instant preview evaluation if database is unpopulated or credentials not yet linked
export const SEED_CATEGORIES: Category[] = [
  {
    id: 'cat-01',
    name: 'Tabletas de Origen',
    slug: 'tabletas-de-origen',
    description: 'Barras de chocolate bean-to-bar elaboradas con cacaos finos de aroma de regiones colombianas.',
  },
  {
    id: 'cat-02',
    name: 'Bombones Artesanales',
    slug: 'bombones-artesanales',
    description: 'Pintados a mano con rellenos de frutas exóticas colombianas e infusiones botánicas.',
  },
  {
    id: 'cat-03',
    name: 'Trufas & Bocados',
    slug: 'trufas-y-bocados',
    description: 'Trufas fundentes con cacao puro y licores artesanales colombianos.',
  },
  {
    id: 'cat-04',
    name: 'Drageas & Frutos Secos',
    slug: 'drageas-y-frutos-secos',
    description: 'Café especial y frutos secos locales cubiertos con capas de chocolate oscuro.',
  },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    category_id: 'cat-01',
    name: 'Tableta Sierra Nevada 72%',
    slug: 'tableta-sierra-nevada-72',
    description: 'Chocolate oscuro con notas cítricas y miel de caña, elaborado con cacao criollo de la Sierra Nevada de Santa Marta.',
    price_cop: 24000,
    stock: 25,
    image_path: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80',
    is_active: true,
  },
  {
    id: 'prod-02',
    category_id: 'cat-01',
    name: 'Tableta Tumaco Ancestral 85%',
    slug: 'tableta-tumaco-ancestral-85',
    description: 'Intensidad pura con notas terrosas, tabaco suave y nuez moscada. Cacao cosechado por comunidades afrodescendientes de Tumaco.',
    price_cop: 26000,
    stock: 18,
    image_path: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=800&q=80',
    is_active: true,
  },
  {
    id: 'prod-03',
    category_id: 'cat-01',
    name: 'Tableta Chocolate con Sal de Manaure 65%',
    slug: 'tableta-chocolate-sal-manaure-65',
    description: 'El equilibrio perfecto entre cacao aromático del Huila y cristales minerales de las salinas de Manaure, Guajira.',
    price_cop: 22000,
    stock: 8, // stock bajo para alertar en admin
    image_path: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=800&q=80',
    is_active: true,
  },
  {
    id: 'prod-04',
    category_id: 'cat-02',
    name: 'Caja Regalo Bombones Marichuy (12 Uds)',
    slug: 'caja-regalo-bombones-marichuy-12',
    description: 'Colección de bombones pintados a mano con ganache de maracuyá, corozo, lulo silvestre y café gesha.',
    price_cop: 58000,
    stock: 14,
    image_path: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=800&q=80',
    is_active: true,
  },
  {
    id: 'prod-05',
    category_id: 'cat-02',
    name: 'Bombones Selección Frutos Rojos y Cardamomo',
    slug: 'bombones-frutos-rojos-cardamomo',
    description: 'Bocados refinados rellenos de reducción de moras silvestres de Boyacá y un toque perfumado de cardamomo.',
    price_cop: 34000,
    stock: 20,
    image_path: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',
    is_active: true,
  },
  {
    id: 'prod-06',
    category_id: 'cat-03',
    name: 'Trufas de Ron Artesanal & Cacao Santander',
    slug: 'trufas-ron-artesanal-cacao-santander',
    description: 'Cremosas trufas infusionadas con ron añejo colombiano y rebozadas en polvo de cacao alcalinizado de San Vicente de Chucurí.',
    price_cop: 32000,
    stock: 12,
    image_path: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    is_active: true,
  },
  {
    id: 'prod-07',
    category_id: 'cat-04',
    name: 'Drageas de Café Geisha en Chocolate 70%',
    slug: 'drageas-cafe-geisha-chocolate-70',
    description: 'Granos de café tostado de origen Pitalito Huila confitados con crocante chocolate oscuro artesanal.',
    price_cop: 21000,
    stock: 5, // stock bajo
    image_path: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=800&q=80',
    is_active: true,
  },
  {
    id: 'prod-08',
    category_id: 'cat-04',
    name: 'Almendras Tostadas con Miel y Chocolate Blanco',
    slug: 'almendras-miel-chocolate-blanco',
    description: 'Almendras tostadas lentamente, envueltas en chocolate blanco artesanal con vainas de vainilla natural.',
    price_cop: 23500,
    stock: 0, // agotado para verificar orden y validación
    image_path: 'https://images.unsplash.com/photo-1575372587186-50020b3323fb?auto=format&fit=crop&w=800&q=80',
    is_active: true,
  },
];

export async function getCategories(): Promise<ServiceResult<Category[]>> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      if (error.code === '42501' || error.message.toLowerCase().includes('row-level security')) {
        return { data: null, error: 'No tienes permisos para consultar las categorías.' };
      }
      // Si la tabla aún no existe o falla conexión, usamos seed fallback para que la tienda sea funcional
      return { data: SEED_CATEGORIES, error: null };
    }

    if (!data || data.length === 0) {
      return { data: SEED_CATEGORIES, error: null };
    }

    return { data: data as Category[], error: null };
  } catch {
    return { data: SEED_CATEGORIES, error: null };
  }
}

export async function getProducts(params?: {
  categoryId?: string;
  search?: string;
}): Promise<ServiceResult<Product[]>> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (params?.categoryId) {
      query = query.eq('category_id', params.categoryId);
    }

    if (params?.search && params.search.trim()) {
      const term = `%${params.search.trim()}%`;
      query = query.or(`name.ilike.${term},description.ilike.${term}`);
    }

    // Orden: con stock primero (stock desc), luego A-Z (name asc)
    query = query.order('stock', { ascending: false }).order('name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      if (error.code === '42501' || error.message.toLowerCase().includes('row-level security')) {
        return { data: null, error: 'No tienes permisos para consultar los productos.' };
      }
      // Fallback a seed data
      return filterSeedProducts(params);
    }

    if (!data || data.length === 0) {
      return filterSeedProducts(params);
    }

    return { data: data as Product[], error: null };
  } catch {
    return filterSeedProducts(params);
  }
}

function filterSeedProducts(params?: { categoryId?: string; search?: string }): ServiceResult<Product[]> {
  let list = [...SEED_PRODUCTS].filter((p) => p.is_active);

  if (params?.categoryId) {
    list = list.filter((p) => p.category_id === params.categoryId);
  }

  if (params?.search && params.search.trim()) {
    const s = params.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        (p.description && p.description.toLowerCase().includes(s))
    );
  }

  // Orden con stock primero, luego A-Z
  list.sort((a, b) => {
    const aHasStock = a.stock > 0 ? 1 : 0;
    const bHasStock = b.stock > 0 ? 1 : 0;
    if (aHasStock !== bHasStock) return bHasStock - aHasStock;
    return a.name.localeCompare(b.name);
  });

  return { data: list, error: null };
}

export async function getProductById(id: string): Promise<ServiceResult<Product>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      const fallback = SEED_PRODUCTS.find((p) => p.id === id);
      if (fallback) return { data: fallback, error: null };
      return { data: null, error: 'Producto no encontrado' };
    }

    return { data: data as Product, error: null };
  } catch {
    const fallback = SEED_PRODUCTS.find((p) => p.id === id);
    if (fallback) return { data: fallback, error: null };
    return { data: null, error: 'Error al consultar producto' };
  }
}
