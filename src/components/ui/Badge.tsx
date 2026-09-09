import React from 'react';
import { cn } from '../../lib/cn';
import { EstadoPedido, UserRole } from '../../types/db';

export interface BadgeProps {
  children?: React.ReactNode;
  status?: EstadoPedido;
  role?: UserRole;
  variant?: 'amber' | 'olive' | 'blue' | 'green' | 'red' | 'neutral';
  className?: string;
}

export const statusLabels: Record<EstadoPedido, string> = {
  verificando_pedido: 'Verificando Pedido',
  verificando_pago: 'Verificando Pago',
  preparando: 'Preparando',
  en_camino: 'En Camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  status,
  role,
  variant,
  className,
}) => {
  let colorClasses = 'bg-[#EFEBE9] text-[#3E2723]';
  let content = children;

  if (status) {
    content = statusLabels[status] || status;
    switch (status) {
      case 'verificando_pedido':
      case 'verificando_pago':
        colorClasses = 'bg-[#FFF3E0] text-[#ED6C02] border border-[#ED6C02]/20';
        break;
      case 'preparando':
        colorClasses = 'bg-[#F1F8E9] text-[#558B2F] border border-[#558B2F]/20';
        break;
      case 'en_camino':
        colorClasses = 'bg-[#E1F5FE] text-[#0288D1] border border-[#0288D1]/20';
        break;
      case 'entregado':
        colorClasses = 'bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/20';
        break;
      case 'cancelado':
        colorClasses = 'bg-[#FFEBEE] text-[#C62828] border border-[#C62828]/20';
        break;
    }
  } else if (role) {
    if (role === 'admin') {
      colorClasses = 'bg-[#3E2723] text-[#F9F6F0] font-semibold';
      content = 'Administrador';
    } else {
      colorClasses = 'bg-[#F9F6F0] text-[#6B6B6B] border border-[#3E2723]/10';
      content = 'Cliente';
    }
  } else if (variant) {
    switch (variant) {
      case 'amber':
        colorClasses = 'bg-[#FFF3E0] text-[#ED6C02] border border-[#ED6C02]/20';
        break;
      case 'olive':
        colorClasses = 'bg-[#F1F8E9] text-[#558B2F] border border-[#558B2F]/20';
        break;
      case 'blue':
        colorClasses = 'bg-[#E1F5FE] text-[#0288D1] border border-[#0288D1]/20';
        break;
      case 'green':
        colorClasses = 'bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/20';
        break;
      case 'red':
        colorClasses = 'bg-[#FFEBEE] text-[#C62828] border border-[#C62828]/20';
        break;
      case 'neutral':
      default:
        colorClasses = 'bg-[#EFEBE9] text-[#3E2723] border border-[#3E2723]/10';
        break;
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap select-none',
        colorClasses,
        className
      )}
    >
      {content}
    </span>
  );
};
