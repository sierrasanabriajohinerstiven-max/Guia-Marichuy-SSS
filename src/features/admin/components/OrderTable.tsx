import React, { useState } from 'react';
import { useAdminOrders } from '../hooks/useAdminOrders';
import { OrderReviewModal } from './OrderReviewModal';
import { Order, EstadoPedido } from '../../../types/db';
import { Money } from '../../../components/ui/Money';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatDateBogota } from '../../../lib/format';
import {
  Package,
  CreditCard,
  Banknote,
  Search,
  Eye,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export const OrderTable: React.FC = () => {
  const {
    orders,
    statusFilter,
    setStatusFilter,
    daysLimit,
    setDaysLimit,
    loading,
    error,
    refetch,
    handleReviewProof,
    handleChangeStatus,
  } = useAdminOrders();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    const idMatch = o.id.toLowerCase().includes(term);
    const nameMatch = (o.customer_name || '').toLowerCase().includes(term);
    const emailMatch = (o.customer_email || '').toLowerCase().includes(term);
    return idMatch || nameMatch || emailMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3E2723]/10">
        <div>
          <h2 className="text-xl font-bold text-[#3E2723] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#D84315]" />
            Moderación de Pedidos
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Gestiona pagos Nequi, transiciones logísticas y despacho de chocolates
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Actualizar
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#3E2723]/10 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            placeholder="Buscar por ID, cliente o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full min-h-[44px] pl-10 pr-4 py-2 text-xs bg-[#F9F6F0] border border-[#3E2723]/20 rounded-lg text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#D84315]/20"
          />
          <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={daysLimit}
            onChange={(e) => setDaysLimit(Number(e.target.value))}
            className="w-full min-h-[44px] px-3.5 py-2 text-xs bg-[#F9F6F0] border border-[#3E2723]/20 rounded-lg text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#D84315]/20"
            aria-label="Rango de fecha de pedidos"
          >
            <option value={30}>Últimos 30 días (por defecto)</option>
            <option value={60}>Últimos 60 días</option>
            <option value={90}>Últimos 90 días</option>
            <option value={0}>Todo el histórico</option>
          </select>
        </div>

        <div className="w-full sm:w-56">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EstadoPedido | 'todas')}
            className="w-full min-h-[44px] px-3.5 py-2 text-xs bg-[#F9F6F0] border border-[#3E2723]/20 rounded-lg text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#D84315]/20"
          >
            <option value="todas">Todos los estados</option>
            <option value="verificando_pago">Verificando Pago (Nequi)</option>
            <option value="verificando_pedido">Verificando Pedido (Efectivo)</option>
            <option value="preparando">En Preparación</option>
            <option value="en_camino">En Camino</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#D84315]/10 border border-[#D84315]/30 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#D84315] font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Error al cargar pedidos: {error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={refetch}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-[#3E2723]/10 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9F6F0] border-b border-[#3E2723]/10 text-[#3E2723] uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">ID Pedido</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4">Método</th>
                <th className="py-3.5 px-4">Total COP</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3E2723]/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8">
                    <Skeleton variant="card" className="h-24 w-full" />
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#6B6B6B]">
                    No se encontraron pedidos con el criterio seleccionado.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#F9F6F0]/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#3E2723]">
                      #{order.id.substring(0, 8)}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#1E1E1E]">{order.customer_name}</p>
                      <p className="text-[10px] text-[#6B6B6B]">{order.customer_email}</p>
                    </td>

                    <td className="py-3.5 px-4 text-[#6B6B6B]">
                      {formatDateBogota(order.created_at)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-[#3E2723]">
                        {order.payment_method === 'nequi' ? (
                          <>
                            <CreditCard className="w-3.5 h-3.5 text-[#D84315]" />
                            Nequi
                          </>
                        ) : (
                          <>
                            <Banknote className="w-3.5 h-3.5 text-[#558B2F]" />
                            Efectivo
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-[#3E2723]">
                      <Money amount={order.total_cop} />
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={order.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Revisar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Review Modal */}
      <OrderReviewModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onReviewProof={handleReviewProof}
        onChangeStatus={handleChangeStatus}
      />
    </div>
  );
};
