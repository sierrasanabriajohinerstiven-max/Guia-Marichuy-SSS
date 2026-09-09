import React, { useState, useEffect } from 'react';
import { Order, EstadoPedido } from '../../../types/db';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { Money } from '../../../components/ui/Money';
import { Button } from '../../../components/ui/Button';
import { formatDateBogota } from '../../../lib/format';
import { getPaymentProofSignedUrl } from '../../payments/services/paymentService';
import {
  CheckCircle2,
  XCircle,
  ZoomIn,
  ZoomOut,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Banknote,
  Package,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface OrderReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onReviewProof: (orderId: string, decision: 'aprobado' | 'rechazado', motivo?: string) => Promise<boolean>;
  onChangeStatus: (orderId: string, newStatus: EstadoPedido) => Promise<boolean>;
}

export const OrderReviewModal: React.FC<OrderReviewModalProps> = ({
  isOpen,
  onClose,
  order,
  onReviewProof,
  onChangeStatus,
}) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState<boolean>(false);
  const [zoomInImage, setZoomInImage] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<EstadoPedido>('verificando_pago');
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  const proof = order?.payment_proofs && order.payment_proofs.length > 0 ? order.payment_proofs[0] : null;

  // Parche quirúrgico AI Studio:
  // Usa createSignedUrl sobre payment-proofs con expiración 300s para renderizar la vista previa del comprobante
  useEffect(() => {
    if (!order || !proof?.storage_path || !isOpen) {
      setSignedUrl(null);
      return;
    }

    let isMounted = true;
    async function fetchProofUrl() {
      setLoadingUrl(true);
      const res = await getPaymentProofSignedUrl(proof!.storage_path, 300);
      if (isMounted) {
        if (res.data?.signedUrl) {
          setSignedUrl(res.data.signedUrl);
        } else {
          setSignedUrl(null);
        }
        setLoadingUrl(false);
      }
    }

    fetchProofUrl();
    setRejectionReason('');
    setSelectedStatus(order.status);

    return () => {
      isMounted = false;
    };
  }, [order, proof?.storage_path, isOpen]);

  if (!order) return null;

  const isTerminal = order.status === 'entregado' || order.status === 'cancelado';

  const handleApprove = async () => {
    setSubmittingAction(true);
    const ok = await onReviewProof(order.id, 'aprobado');
    setSubmittingAction(false);
    if (ok) onClose();
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Debes especificar un motivo para rechazar el comprobante.');
      return;
    }

    setSubmittingAction(true);
    const ok = await onReviewProof(order.id, 'rechazado', rejectionReason);
    setSubmittingAction(false);
    if (ok) onClose();
  };

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.status) {
      toast('El pedido ya se encuentra en este estado');
      return;
    }

    setSubmittingAction(true);
    const ok = await onChangeStatus(order.id, selectedStatus);
    setSubmittingAction(false);
    if (ok) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Moderación de Orden #${order.id.substring(0, 8)}`}
      maxWidth="xl"
    >
      <div className="space-y-6 text-xs text-[#1E1E1E]">
        {/* Status bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#F9F6F0] rounded-xl border border-[#3E2723]/10">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6B6B] block">
              Estado Actual
            </span>
            <div className="mt-0.5">
              <Badge status={order.status} />
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6B6B] block">
              Fecha de Registro
            </span>
            <p className="font-semibold text-[#3E2723] mt-0.5">
              {formatDateBogota(order.created_at)}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6B6B] block">
              Monto Liquidado
            </span>
            <Money amount={order.total_cop} className="text-base font-bold text-[#D84315]" />
          </div>
        </div>

        {/* Customer and shipping details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer info */}
          <div className="p-4 bg-white rounded-xl border border-[#3E2723]/10 space-y-1.5">
            <h4 className="font-bold text-[#3E2723] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#D84315]" /> Cliente
            </h4>
            <p className="font-bold">{order.customer_name}</p>
            <p className="text-[#6B6B6B]">{order.customer_email}</p>
            <p className="text-[#6B6B6B] flex items-center gap-1">
              <Phone className="w-3 h-3" /> {order.phone_number}
            </p>
          </div>

          {/* Shipping address */}
          <div className="p-4 bg-white rounded-xl border border-[#3E2723]/10 space-y-1.5">
            <h4 className="font-bold text-[#3E2723] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#558B2F]" /> Dirección de Entrega
            </h4>
            <p className="font-bold">{order.shipping_address?.address}</p>
            <p className="text-[#6B6B6B]">{order.shipping_address?.city}</p>
            {order.shipping_address?.notes && (
              <p className="text-[10px] text-[#6B6B6B] italic">
                Indicaciones: {order.shipping_address.notes}
              </p>
            )}
          </div>
        </div>

        {/* Items list */}
        <div className="space-y-2">
          <h4 className="font-bold text-[#3E2723] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-[#3E2723]" /> Artículos del Pedido
          </h4>
          <div className="border border-[#3E2723]/10 rounded-xl overflow-hidden divide-y divide-[#3E2723]/5">
            {order.items?.map((it) => (
              <div key={it.id} className="p-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#3E2723]">{it.product_name}</span>
                  <span className="text-[#6B6B6B] ml-2">
                    {it.quantity} × <Money amount={it.unit_price_cop} />
                  </span>
                </div>
                <Money amount={it.unit_price_cop * it.quantity} className="font-bold" />
              </div>
            ))}
          </div>
        </div>

        {/* NEQUI PROOF SECTION */}
        {order.payment_method === 'nequi' && (
          <div className="p-5 bg-white rounded-xl border border-[#3E2723]/15 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#3E2723]/10">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#D84315]" />
                <h4 className="font-bold text-sm text-[#3E2723]">Comprobante de Transferencia Nequi</h4>
              </div>
              <span className="text-[11px] text-[#6B6B6B] font-mono">
                {proof?.storage_path ? proof.storage_path.split('/').pop() : 'Sin comprobante'}
              </span>
            </div>

            {loadingUrl ? (
              <div className="py-8 text-center text-[#6B6B6B]">
                Cargando comprobante firmado (URL segura 300s)...
              </div>
            ) : signedUrl ? (
              <div className="space-y-3">
                <div
                  className={`relative rounded-xl overflow-hidden border border-[#3E2723]/15 bg-black/5 flex items-center justify-center transition-all ${
                    zoomInImage ? 'h-96' : 'h-52'
                  }`}
                >
                  <img
                    src={signedUrl}
                    alt="Comprobante Nequi"
                    className={`transition-transform duration-200 ${
                      zoomInImage ? 'max-h-full max-w-full object-contain cursor-zoom-out' : 'h-full w-full object-cover cursor-zoom-in'
                    }`}
                    onClick={() => setZoomInImage(!zoomInImage)}
                  />
                  <button
                    type="button"
                    onClick={() => setZoomInImage(!zoomInImage)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-black transition-colors"
                    title={zoomInImage ? 'Reducir zoom' : 'Ampliar zoom'}
                  >
                    {zoomInImage ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                  </button>
                </div>

                {order.status === 'verificando_pago' && (
                  <div className="space-y-3 pt-2">
                    <div className="w-full flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-[#3E2723]">
                        Motivo de Rechazo (Obligatorio únicamente si vas a rechazar el comprobante):
                      </label>
                      <textarea
                        rows={2}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Ej. Valor transferido incompleto, captura no legible o referencia no coincide..."
                        className="w-full px-3 py-2 text-xs bg-[#F9F6F0] border border-[#3E2723]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828]"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        disabled={!rejectionReason.trim() || submittingAction}
                        onClick={handleReject}
                        leftIcon={<XCircle className="w-4 h-4" />}
                      >
                        Rechazar Comprobante
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={submittingAction}
                        onClick={handleApprove}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Aprobar Comprobante (Pasar a Preparación)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-[#FFEBEE] border border-[#C62828]/20 rounded-lg text-xs text-[#C62828]">
                No se pudo cargar la vista previa del comprobante. Puede que no se haya subido correctamente al storage o el archivo fue borrado.
              </div>
            )}
          </div>
        )}

        {/* STATUS TRANSITION CONTROLS */}
        <div className="p-4 bg-[#F9F6F0] rounded-xl border border-[#3E2723]/10 space-y-3">
          <h4 className="font-bold text-[#3E2723] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-[#558B2F]" />
            Transición Canónica de Estado
          </h4>

          {isTerminal ? (
            <div className="p-3 bg-white rounded-lg border border-[#3E2723]/10 text-xs text-[#6B6B6B] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#ED6C02]" />
              <span>
                Esta orden está en estado terminal (<strong>{order.status}</strong>). La base de datos no permite modificaciones posteriores.
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as EstadoPedido)}
                disabled={submittingAction}
                className="w-full sm:flex-1 min-h-[40px] px-3 py-1.5 text-xs bg-white border border-[#3E2723]/20 rounded-lg text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#558B2F]/20"
              >
                <option value="verificando_pedido">verificando_pedido</option>
                <option value="verificando_pago">verificando_pago</option>
                <option value="preparando">preparando</option>
                <option value="en_camino">en_camino</option>
                <option value="entregado">entregado</option>
                <option value="cancelado">cancelado</option>
              </select>

              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={submittingAction || selectedStatus === order.status}
                onClick={handleUpdateStatus}
                isLoading={submittingAction}
              >
                Actualizar Estado
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
