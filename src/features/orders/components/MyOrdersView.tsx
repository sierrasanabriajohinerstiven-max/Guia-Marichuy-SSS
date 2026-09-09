import React from 'react';
import { useMyOrders } from '../hooks/useMyOrders';
import { OrderCard } from './OrderCard';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { Button } from '../../../components/ui/Button';
import { Package, RefreshCw, ShoppingBag } from 'lucide-react';

export interface MyOrdersViewProps {
  onExploreCatalog: () => void;
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({ onExploreCatalog }) => {
  const { orders, loading, error, refetch } = useMyOrders();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-6 space-y-4">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="card" className="h-28 w-full rounded-xl" />
        <Skeleton variant="card" className="h-28 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <ErrorState
          title="Error al consultar tus pedidos"
          message={error}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3E2723]/10">
        <div>
          <h1 className="text-2xl font-bold text-[#3E2723] tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#D84315]" />
            Mis Pedidos Artesanales
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Consulta el estado de preparación, ruta de entrega y comprobantes de tus compras
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Actualizar
        </Button>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="Aún no tienes pedidos registrados"
          description="Explora nuestra colección de tabletas finas de cacao de origen, bombones artesanales y trufas."
          actionLabel="Explorar Catálogo"
          onAction={onExploreCatalog}
          icon={<ShoppingBag className="w-12 h-12" />}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};
