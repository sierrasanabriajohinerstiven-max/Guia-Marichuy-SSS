import React from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { usePaymentProof } from '../hooks/usePaymentProof';
import { NequiInstructions } from './NequiInstructions';
import { ProofUploader } from './ProofUploader';
import { Button } from '../../../components/ui/Button';
import { Money } from '../../../components/ui/Money';
import { CartLineItem, EnvioPayload } from '../../../types/db';
import { ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export interface NequiPaymentViewProps {
  payload: {
    items: CartLineItem[];
    envio: EnvioPayload;
  };
  onOrderSuccess: (orderId: string) => void;
  onBackToCheckout: () => void;
}

export const NequiPaymentView: React.FC<NequiPaymentViewProps> = ({
  payload,
  onOrderSuccess,
  onBackToCheckout,
}) => {
  const { user } = useAuth();
  const {
    selectedFile,
    previewUrl,
    loading,
    error,
    handleSelectFile,
    processNequiOrder,
  } = usePaymentProof();

  const totalAmount = payload.items.reduce(
    (acc, item) => acc + item.product.price_cop * item.quantity,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Debes tener una sesión activa para completar el pedido');
      return;
    }

    if (!selectedFile) {
      toast.error('Por favor adjunta la captura de tu comprobante Nequi');
      return;
    }

    const res = await processNequiOrder(payload.items, payload.envio, user.id);
    if (res.success && res.orderId) {
      onOrderSuccess(res.orderId);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToCheckout}
          type="button"
          className="inline-flex items-center text-xs font-bold text-[#3E2723] hover:text-[#D84315] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Volver a datos de envío
        </button>

        <span className="text-xs font-semibold text-[#558B2F] bg-[#F1F8E9] px-3 py-1 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Paso 2 de 2: Pago Nequi
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#3E2723]">
          Finaliza tu compra artesanal por Nequi
        </h1>
        <p className="text-xs text-[#6B6B6B] mt-1">
          Realiza la transferencia manual y carga la imagen del recibo para que nuestro equipo valide tu pago y comience la preparación.
        </p>
      </div>

      {/* Instructions Card */}
      <NequiInstructions amount={totalAmount} />

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#3E2723]/10 p-6 shadow-xs space-y-6">
        <ProofUploader
          selectedFile={selectedFile}
          previewUrl={previewUrl}
          error={error}
          onFileChange={handleSelectFile}
          disabled={loading}
        />

        <div className="p-4 bg-[#F9F6F0] rounded-xl border border-[#3E2723]/10 text-xs text-[#6B6B6B] space-y-1">
          <p className="font-bold text-[#3E2723]">Aviso de seguridad y moderación:</p>
          <p>
            Tu comprobante es almacenado de forma cifrada en nuestro almacenamiento seguro. Un moderador de Marichuy verificará el importe de <Money amount={totalAmount} className="font-bold text-[#1E1E1E]" /> en los próximos minutos para pasar tu orden a estado de preparación.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBackToCheckout}
            disabled={loading}
          >
            Modificar datos de entrega
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            disabled={!selectedFile || loading}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirmar Pago y Enviar Pedido
          </Button>
        </div>
      </form>
    </div>
  );
};
