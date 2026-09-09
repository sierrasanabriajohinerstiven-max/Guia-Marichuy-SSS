import React, { useState } from 'react';
import { Order } from '../../../types/db';
import { Badge } from '../../../components/ui/Badge';
import { Money } from '../../../components/ui/Money';
import { formatDateBogota } from '../../../lib/format';
import { OrderStatusTracker } from './OrderStatusTracker';
import { ChevronDown, ChevronUp, Package, MapPin, CreditCard, Banknote, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const copyOrderId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(order.id);
    toast.success('ID de orden copiado');
  };

  // Extraer notas de comprobante si fue cancelado
  const latestProof = order.payment_proofs && order.payment_proofs.length > 0 ? order.payment_proofs[0] : null;
  const rejectionReason = latestProof?.review_notes || null;

  return (
    <div className="bg-white rounded-xl border border-[#3E2723]/10 shadow-xs hover:border-[#3E2723]/20 transition-all overflow-hidden">
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none hover:bg-[#F9F6F0]/40 transition-colors"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#3E2723]">
              #{order.id.substring(0, 8)}
            </span>
            <button
              type="button"
              onClick={copyOrderId}
              className="text-[#6B6B6B] hover:text-[#3E2723] p-0.5"
              title="Copiar ID completo"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <Badge status={order.status} />
          </div>

          <p className="text-xs text-[#6B6B6B]">
            Fecha: {formatDateBogota(order.created_at)}
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-5">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#6B6B6B] block">
              Total
            </span>
            <Money amount={order.total_cop} className="text-base font-bold text-[#D84315]" />
          </div>

          <div className="p-1.5 rounded-lg bg-[#F9F6F0] text-[#3E2723]">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="px-5 pb-5 pt-2 border-t border-[#3E2723]/10 space-y-5 bg-[#F9F6F0]/20">
          {/* Tracker visual */}
          <OrderStatusTracker status={order.status} rejectionReason={rejectionReason} />

          {/* Items breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#3E2723] flex items-center gap-1.5">
              <Package className="w-4 h-4 text-[#D84315]" />
              Artículos del Pedido
            </h4>

            <div className="bg-white rounded-lg border border-[#3E2723]/10 divide-y divide-[#3E2723]/5 p-2">
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => (
                  <div key={item.id} className="py-2 px-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#3E2723]">{item.product_name}</p>
                      <p className="text-[#6B6B6B]">
                        {item.quantity} × <Money amount={item.unit_price_cop} className="text-xs" />
                      </p>
                    </div>
                    <Money
                      amount={item.unit_price_cop * item.quantity}
                      className="font-bold text-[#1E1E1E]"
                    />
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#6B6B6B] p-2">Detalles del artículo procesados en orden.</p>
              )}
            </div>
          </div>

          {/* Shipping & Payment Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-white rounded-lg border border-[#3E2723]/10 space-y-1">
              <span className="font-bold text-[#3E2723] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#558B2F]" />
                Datos de Entrega
              </span>
              <p className="text-[#1E1E1E] font-medium">{order.customer_name}</p>
              <p className="text-[#6B6B6B]">
                {order.shipping_address?.address}, {order.shipping_address?.city}
              </p>
              {order.shipping_address?.notes && (
                <p className="text-[11px] text-[#6B6B6B] italic mt-1">
                  Nota: {order.shipping_address.notes}
                </p>
              )}
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#3E2723]/10 space-y-1">
              <span className="font-bold text-[#3E2723] flex items-center gap-1">
                {order.payment_method === 'nequi' ? (
                  <CreditCard className="w-3.5 h-3.5 text-[#D84315]" />
                ) : (
                  <Banknote className="w-3.5 h-3.5 text-[#558B2F]" />
                )}
                Método de Pago
              </span>
              <p className="text-[#1E1E1E] font-medium">
                {order.payment_method === 'nequi' ? 'Transferencia Nequi' : 'Efectivo contra Entrega'}
              </p>
              <p className="text-[#6B6B6B]">Teléfono: {order.phone_number}</p>
              <p className="text-[#6B6B6B]">Correo: {order.customer_email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
