import React from 'react';
import { EstadoPedido } from '../../../types/db';
import { Check, Clock, Package, Truck, CheckCircle2, XCircle } from 'lucide-react';

export interface OrderStatusTrackerProps {
  status: EstadoPedido;
  rejectionReason?: string | null;
}

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  status,
  rejectionReason,
}) => {
  if (status === 'cancelado') {
    return (
      <div className="p-4 rounded-xl bg-[#FFEBEE] border border-[#C62828]/20 flex items-start gap-3">
        <XCircle className="w-5 h-5 text-[#C62828] shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold text-[#C62828]">Pedido Cancelado</p>
          <p className="text-[#6B6B6B] mt-0.5">
            {rejectionReason
              ? `Motivo del rechazo: ${rejectionReason}`
              : 'Este pedido ha sido cancelado y los productos han regresado al inventario.'}
          </p>
        </div>
      </div>
    );
  }

  // Flujo secuencial canónico
  const steps: { key: EstadoPedido; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'verificando_pago', label: 'Verificando', icon: Clock },
    { key: 'preparando', label: 'En Preparación', icon: Package },
    { key: 'en_camino', label: 'En Camino', icon: Truck },
    { key: 'entregado', label: 'Entregado', icon: CheckCircle2 },
  ];

  // Helper para determinar el índice activo
  const getStepIndex = (s: EstadoPedido): number => {
    switch (s) {
      case 'verificando_pedido':
      case 'verificando_pago':
        return 0;
      case 'preparando':
        return 1;
      case 'en_camino':
        return 2;
      case 'entregado':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full py-3">
      <div className="relative flex items-center justify-between">
        {/* Connector Line */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-[#3E2723]/10 -z-0" />
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 h-0.5 bg-[#558B2F] transition-all duration-300 -z-0"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 90}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                  isCompleted
                    ? 'bg-[#558B2F] text-white'
                    : isCurrent
                    ? 'bg-[#D84315] text-white ring-4 ring-[#D84315]/20'
                    : 'bg-white border border-[#3E2723]/20 text-[#6B6B6B]'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${
                  isCurrent
                    ? 'text-[#D84315] font-bold'
                    : isCompleted
                    ? 'text-[#558B2F]'
                    : 'text-[#6B6B6B]'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
