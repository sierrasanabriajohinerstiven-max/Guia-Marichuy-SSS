import React from 'react';
import { Input } from '../../../components/ui/Input';
import { OrderShippingAddress } from '../../../types/db';
import { MapPin, Building, FileText } from 'lucide-react';

export interface AddressInputsProps {
  address: OrderShippingAddress;
  onChange: (address: OrderShippingAddress) => void;
  disabled?: boolean;
}

export const AddressInputs: React.FC<AddressInputsProps> = ({
  address,
  onChange,
  disabled,
}) => {
  const handleChange = (field: keyof OrderShippingAddress, value: string) => {
    onChange({
      ...address,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Dirección de Entrega *"
          placeholder="Ej. Calle 127 # 15 - 45, Apto 402"
          required
          disabled={disabled}
          value={address.address}
          onChange={(e) => handleChange('address', e.target.value)}
          leftIcon={<MapPin className="w-4 h-4" />}
        />

        <Input
          label="Ciudad / Municipio *"
          placeholder="Ej. Bogotá D.C."
          required
          disabled={disabled}
          value={address.city}
          onChange={(e) => handleChange('city', e.target.value)}
          leftIcon={<Building className="w-4 h-4" />}
        />
      </div>

      <div className="w-full flex flex-col gap-1.5">
        <label
          htmlFor="shipping-notes"
          className="text-xs font-semibold uppercase tracking-wider text-[#3E2723]/80 flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-[#6B6B6B]" />
          Indicaciones adicionales de entrega (Opcional)
        </label>
        <textarea
          id="shipping-notes"
          rows={2}
          disabled={disabled}
          value={address.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Ej. Dejar en portería, torre 2, timbre azul"
          className="w-full px-3.5 py-2 text-sm bg-white border border-[#3E2723]/20 rounded-lg transition-colors text-[#1E1E1E] placeholder:text-[#6B6B6B]/60 focus:outline-none focus:ring-2 focus:ring-[#D84315]/20 focus:border-[#D84315] disabled:bg-[#F9F6F0]"
        />
      </div>
    </div>
  );
};
