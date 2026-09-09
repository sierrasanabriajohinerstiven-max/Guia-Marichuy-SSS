import { useEffect, useState, useCallback } from 'react';
import { Order, EstadoPedido } from '../../../types/db';
import { getAdminOrders, revisarComprobante, cambiarEstadoPedido } from '../services/adminService';
import toast from 'react-hot-toast';

export function useAdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<EstadoPedido | 'todas'>('todas');
  const [daysLimit, setDaysLimit] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getAdminOrders(statusFilter, daysLimit);
    if (res.error) {
      setError(res.error);
    } else {
      setOrders(res.data || []);
    }
    setLoading(false);
  }, [statusFilter, daysLimit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleReviewProof = async (
    orderId: string,
    decision: 'aprobado' | 'rechazado',
    motivo?: string
  ): Promise<boolean> => {
    setActionLoading(true);
    const res = await revisarComprobante(orderId, decision, motivo);
    setActionLoading(false);

    if (res.error) {
      toast.error(`Error: ${res.error}`);
      return false;
    }

    toast.success(
      decision === 'aprobado'
        ? 'Comprobante APROBADO: el pedido pasó a Preparación.'
        : 'Comprobante RECHAZADO: pedido cancelado y stock restablecido.'
    );
    await fetchOrders();
    return true;
  };

  const handleChangeStatus = async (
    orderId: string,
    newStatus: EstadoPedido
  ): Promise<boolean> => {
    setActionLoading(true);
    const res = await cambiarEstadoPedido(orderId, newStatus);
    setActionLoading(false);

    if (res.error) {
      toast.error(`No se pudo cambiar estado: ${res.error}`);
      return false;
    }

    toast.success('Estado del pedido actualizado correctamente');
    await fetchOrders();
    return true;
  };

  return {
    orders,
    statusFilter,
    setStatusFilter,
    daysLimit,
    setDaysLimit,
    loading,
    error,
    actionLoading,
    refetch: fetchOrders,
    handleReviewProof,
    handleChangeStatus,
  };
}
