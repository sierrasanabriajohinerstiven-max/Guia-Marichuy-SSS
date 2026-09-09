import React from 'react';
import { Button } from '../../../components/ui/Button';
import { CheckCircle2, PackageCheck, ArrowRight, ShoppingBag, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export interface OrderConfirmedViewProps {
  orderId: string | null;
  onGoToMyOrders: () => void;
  onContinueShopping: () => void;
}

export const OrderConfirmedView: React.FC<OrderConfirmedViewProps> = ({
  orderId,
  onGoToMyOrders,
  onContinueShopping,
}) => {
  const displayId = orderId || 'ORD-NUEVO';

  const copyId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      toast.success('Número de orden copiado');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-16 px-4">
      <div className="bg-white rounded-2xl border border-[#3E2723]/10 p-8 sm:p-12 text-center shadow-sm space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#558B2F] bg-[#F1F8E9] px-3 py-1 rounded-full">
            ¡Orden Registrada con Éxito!
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3E2723] mt-3 tracking-tight">
            Gracias por elegir Chocolates Marichuy
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-2 max-w-md mx-auto leading-relaxed">
            Hemos recibido los detalles de tu compra artesanal. Tu orden ha ingresado a nuestra línea de verificación y empaque con cacaos finos de origen.
          </p>
        </div>

        {/* Order ID box */}
        <div className="p-4 rounded-xl bg-[#F9F6F0] border border-[#3E2723]/10 max-w-sm mx-auto flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-[#6B6B6B] block">
              Número de Pedido
            </span>
            <span className="text-sm font-mono font-bold text-[#3E2723]">
              #{displayId.substring(0, 8)}...
            </span>
          </div>
          {orderId && (
            <button
              type="button"
              onClick={copyId}
              className="p-2 text-[#6B6B6B] hover:text-[#3E2723] rounded-lg hover:bg-white transition-colors"
              title="Copiar ID completo"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-4 rounded-xl bg-[#FFF3E0]/60 border border-[#ED6C02]/20 text-xs text-[#3E2723] max-w-md mx-auto flex items-start gap-3 text-left">
          <PackageCheck className="w-5 h-5 text-[#ED6C02] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Próximos pasos:</p>
            <p className="text-[#6B6B6B] mt-0.5">
              Si pagaste con Nequi, nuestro equipo moderará tu comprobante en breve. Si elegiste contra entrega, alista el valor exacto para recibir al mensajero.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            variant="primary"
            size="lg"
            onClick={onGoToMyOrders}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Ver Mis Pedidos
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onContinueShopping}
            leftIcon={<ShoppingBag className="w-4 h-4" />}
          >
            Seguir Explorando Catálogo
          </Button>
        </div>
      </div>
    </div>
  );
};
