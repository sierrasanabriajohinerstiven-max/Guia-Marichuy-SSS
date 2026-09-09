import React from 'react';
import { Product } from '../../../types/db';
import { ProductCard } from './ProductCard';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';

export interface ProductGridProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onViewDetail: (productId: string) => void;
  onResetFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  error,
  onRetry,
  onViewDetail,
  onResetFilters,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-[#3E2723]/10 space-y-3">
            <Skeleton variant="card" className="h-48 rounded-lg" />
            <Skeleton variant="text" className="h-5 w-3/4" />
            <Skeleton variant="text" className="h-4 w-full" />
            <div className="flex justify-between pt-2">
              <Skeleton variant="text" className="h-6 w-20" />
              <Skeleton variant="text" className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Error al cargar productos"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No encontramos productos"
        description="No hay variedades disponibles con los criterios de búsqueda o categoría seleccionados."
        actionLabel={onResetFilters ? 'Ver todo el catálogo' : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onViewDetail={onViewDetail}
        />
      ))}
    </div>
  );
};
