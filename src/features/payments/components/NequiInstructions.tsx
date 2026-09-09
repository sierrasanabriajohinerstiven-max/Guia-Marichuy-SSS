import React from 'react';
import { Money } from '../../../components/ui/Money';
import { Copy, CheckCircle2, QrCode, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

export interface NequiInstructionsProps {
  amount: number;
}

export const NequiInstructions: React.FC<NequiInstructionsProps> = ({ amount }) => {
  const nequiNumber = '3152849012';
  const titular = 'Chocolatería Marichuy S.A.S.';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  return (
    <div className="bg-white rounded-xl border border-[#3E2723]/10 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#3E2723]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#200020] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
            N
          </div>
          <div>
            <h3 className="text-base font-bold text-[#3E2723]">Pago con Nequi</h3>
            <p className="text-xs text-[#6B6B6B]">Transferencia manual inmediata</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-[#6B6B6B] block">
            Monto a transferir
          </span>
          <Money amount={amount} className="text-lg font-bold text-[#D84315]" />
        </div>
      </div>

      {/* Account Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Account Number */}
        <div className="p-4 rounded-xl bg-[#F9F6F0] border border-[#3E2723]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-[#3E2723]" />
            <div>
              <span className="text-[10px] uppercase font-bold text-[#6B6B6B] block">
                Número de Celular Nequi
              </span>
              <span className="text-sm font-bold text-[#1E1E1E] tracking-wide">
                315 284 9012
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(nequiNumber, 'Número Nequi')}
            className="p-2 text-[#6B6B6B] hover:text-[#3E2723] rounded-lg hover:bg-white transition-colors"
            title="Copiar número"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        {/* Titular */}
        <div className="p-4 rounded-xl bg-[#F9F6F0] border border-[#3E2723]/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6B6B] block">
              Titular de la Cuenta
            </span>
            <span className="text-sm font-bold text-[#1E1E1E] truncate block">
              {titular}
            </span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-[#558B2F]" />
        </div>
      </div>

      {/* QR Code Section */}
      <div className="p-5 rounded-xl bg-[#F9F6F0]/60 border border-[#3E2723]/10 flex flex-col sm:flex-row items-center gap-5">
        <div className="w-28 h-28 bg-white p-2 rounded-lg border border-[#3E2723]/15 shadow-xs flex flex-col items-center justify-center shrink-0">
          <QrCode className="w-20 h-20 text-[#3E2723]" />
          <span className="text-[9px] font-bold text-[#6B6B6B] mt-0.5">Escanea con Nequi</span>
        </div>

        <div className="space-y-1 text-xs text-[#6B6B6B]">
          <p className="font-bold text-[#3E2723]">Pasos para completar tu compra:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Abre tu App Nequi y selecciona <strong>Envía</strong> o escanea el código.</li>
            <li>Digita el número <strong>315 284 9012</strong>.</li>
            <li>Ingresa el valor exacto: <Money amount={amount} className="font-bold text-[#1E1E1E]" />.</li>
            <li>Guarda o toma captura de pantalla del comprobante de transferencia.</li>
            <li>Sube la imagen a continuación para validar y despachar tu pedido.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
