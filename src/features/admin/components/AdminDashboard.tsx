import React from 'react';
import { useAdminStats } from '../hooks/useAdminStats';
import { Money } from '../../../components/ui/Money';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ErrorState } from '../../../components/ui/ErrorState';
import {
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  ArrowRight,
  Plus,
} from 'lucide-react';

export interface AdminDashboardProps {
  onNavigateToProducts: () => void;
  onNavigateToOrders: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToProducts,
  onNavigateToOrders,
}) => {
  const { stats, loading, error, refetch } = useAdminStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton variant="card" className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Error al cargar métricas de administración"
        message={error}
        onRetry={refetch}
      />
    );
  }

  const kpis = stats || {
    monthlyRevenue: 0,
    activeOrdersCount: 0,
    lowStockProductsCount: 0,
    totalOrdersCount: 0,
    lowStockProducts: [],
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#3E2723] tracking-tight">
            Panel de Control · Chocolatería Marichuy
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Resumen de desempeño comercial, logística y control de existencias de cacao
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToOrders}
            leftIcon={<Package className="w-4 h-4" />}
          >
            Revisar Pedidos
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onNavigateToProducts}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Gestionar Catálogo
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: Ventas Mes */}
        <div className="bg-white p-5 rounded-xl border border-[#3E2723]/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">
              Ventas Mes (Excl. Cancelados)
            </span>
            <div className="mt-1">
              <Money amount={kpis.monthlyRevenue} className="text-2xl font-extrabold text-[#3E2723]" />
            </div>
            <span className="text-[11px] text-[#558B2F] font-semibold mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Mes en curso
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FFF3E0] text-[#D84315] flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Pedidos Activos */}
        <div className="bg-white p-5 rounded-xl border border-[#3E2723]/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">
              Pedidos en Proceso
            </span>
            <div className="mt-1 text-2xl font-extrabold text-[#3E2723]">
              {kpis.activeOrdersCount}
            </div>
            <span className="text-[11px] text-[#0288D1] font-semibold mt-0.5">
              Pendientes o en ruta
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#E1F5FE] text-[#0288D1] flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Alerta de Inventario */}
        <div className="bg-white p-5 rounded-xl border border-[#3E2723]/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">
              Alerta Stock (&lt; 10 Uds)
            </span>
            <div className="mt-1 text-2xl font-extrabold text-[#ED6C02]">
              {kpis.lowStockProductsCount}
            </div>
            <span className="text-[11px] text-[#ED6C02] font-semibold mt-0.5">
              Requieren reposición
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FFF3E0] text-[#ED6C02] flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Total Pedidos */}
        <div className="bg-white p-5 rounded-xl border border-[#3E2723]/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">
              Total Histórico Órdenes
            </span>
            <div className="mt-1 text-2xl font-extrabold text-[#3E2723]">
              {kpis.totalOrdersCount}
            </div>
            <span className="text-[11px] text-[#6B6B6B] font-semibold mt-0.5">
              Canal web Marichuy
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#EFEBE9] text-[#3E2723] flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Low Stock Warning Panel */}
      <div className="bg-white rounded-xl border border-[#3E2723]/10 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#ED6C02]" />
            <h2 className="text-base font-bold text-[#3E2723]">
              Variedades con Inventario Crítico
            </h2>
          </div>
          <button
            onClick={onNavigateToProducts}
            type="button"
            className="text-xs font-semibold text-[#D84315] hover:underline flex items-center gap-1"
          >
            Ver todos los productos <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {kpis.lowStockProducts.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#558B2F] bg-[#F1F8E9] rounded-lg">
            ✓ ¡Todo el inventario está en niveles óptimos (más de 10 unidades por variedad)!
          </div>
        ) : (
          <div className="divide-y divide-[#3E2723]/5">
            {kpis.lowStockProducts.map((prod) => (
              <div
                key={prod.id}
                className="py-3 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#3E2723]/5 overflow-hidden shrink-0">
                    {prod.image_path ? (
                      <img
                        src={prod.image_path}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] text-[#6B6B6B]">
                        Cacao
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-[#3E2723]">{prod.name}</p>
                    <p className="text-[#6B6B6B]">
                      Precio: <Money amount={prod.price_cop} className="text-xs" />
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                      prod.stock === 0
                        ? 'bg-[#FFEBEE] text-[#C62828]'
                        : 'bg-[#FFF3E0] text-[#ED6C02]'
                    }`}
                  >
                    {prod.stock === 0 ? 'Agotado (0)' : `${prod.stock} disponibles`}
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onNavigateToProducts}
                  >
                    Ajustar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
