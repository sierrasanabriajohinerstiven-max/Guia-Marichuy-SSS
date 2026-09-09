import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCartStore } from '../../cart/store/useCartStore';
import { useCheckout } from '../hooks/useCheckout';
import { AddressInputs } from './AddressInputs';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Money } from '../../../components/ui/Money';
import { CartLineItem, EnvioPayload, OrderShippingAddress } from '../../../types/db';
import { isValidEmail, isValidPhone, sanitizeText, MAX } from '../../../lib/validation';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  AlertCircle,
  Truck,
  CreditCard,
  Banknote,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface CheckoutFormProps {
  onOrderSuccess: (orderId: string) => void;
  onProceedToNequi: (payload: { items: CartLineItem[]; envio: EnvioPayload }) => void;
  onBackToCart: () => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onOrderSuccess,
  onProceedToNequi,
  onBackToCart,
}) => {
  const { user, profile } = useAuth();
  const { items, getEstimatedTotal } = useCartStore();
  const { loading, errorBanner, setErrorBanner, processCashOrder } = useCheckout();

  // Contact state prefilled from session/profile
  const [nombre, setNombre] = useState<string>(profile?.full_name || user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [telefono, setTelefono] = useState<string>(profile?.phone || '');

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState<OrderShippingAddress>({
    address: '',
    city: 'Bogotá D.C.',
    notes: '',
  });

  // Payment method selection
  const [metodo, setMetodo] = useState<'nequi' | 'efectivo'>('nequi');

  // Prellenar datos de contacto cuando la sesión/perfil terminan de cargar
  useEffect(() => {
    setNombre((prev) => prev || profile?.full_name || (user?.user_metadata?.full_name as string) || '');
    setEmail((prev) => prev || user?.email || '');
    setTelefono((prev) => prev || profile?.phone || '');
  }, [user, profile]);

  const estimatedTotal = getEstimatedTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (items.length === 0) {
      toast.error('Tu cesta está vacía');
      return;
    }

    if (!nombre.trim()) {
      setErrorBanner('Por favor ingresa el nombre de quien recibe.');
      return;
    }

    if (!isValidEmail(email)) {
      setErrorBanner('Ingresa un correo electrónico válido.');
      return;
    }

    if (!isValidPhone(telefono)) {
      setErrorBanner('Ingresa un número de teléfono válido (7 a 15 dígitos).');
      return;
    }

    if (!shippingAddress.address.trim()) {
      setErrorBanner('Por favor ingresa la dirección de entrega.');
      return;
    }

    if (!shippingAddress.city.trim()) {
      setErrorBanner('Por favor ingresa la ciudad de entrega.');
      return;
    }

    const envio: EnvioPayload = {
      nombre: sanitizeText(nombre, MAX.name),
      email: email.trim().toLowerCase(),
      telefono: sanitizeText(telefono, MAX.phone),
      direccion: {
        address: sanitizeText(shippingAddress.address, MAX.address),
        city: sanitizeText(shippingAddress.city, MAX.city),
        notes: sanitizeText(shippingAddress.notes || '', MAX.notes) || undefined,
      },
    };

    if (metodo === 'efectivo') {
      const res = await processCashOrder(items, envio);
      if (res.success && res.orderId) {
        onOrderSuccess(res.orderId);
      }
    } else {
      // Método Nequi: NO llamamos el RPC aquí. Guardamos checkoutPayload y pasamos a la vista pago-nequi
      onProceedToNequi({
        items,
        envio,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBackToCart}
          type="button"
          className="inline-flex items-center text-xs font-bold text-[#3E2723] hover:text-[#D84315] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Volver a la tienda
        </button>

        <span className="text-xs font-semibold text-[#558B2F] bg-[#F1F8E9] px-3 py-1 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Checkout Seguro
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Form inputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-xl border border-[#3E2723]/10 shadow-xs">
            <h2 className="text-lg font-bold text-[#3E2723] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#D84315]" />
              Datos de Contacto y Entrega
            </h2>

            {errorBanner && (
              <div className="mb-5 p-4 bg-[#FFEBEE] border border-[#C62828]/20 rounded-lg text-xs font-medium text-[#C62828] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Error en la validación:</p>
                  <p className="mt-0.5">{errorBanner}</p>
                </div>
              </div>
            )}

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nombre de quien recibe *"
                placeholder="Nombre y Apellido"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Correo Electrónico *"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <Input
                  label="Teléfono Celular *"
                  type="tel"
                  placeholder="310 123 4567"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </div>

              <div className="pt-3 border-t border-[#3E2723]/10">
                <AddressInputs
                  address={shippingAddress}
                  onChange={setShippingAddress}
                  disabled={loading}
                />
              </div>

              {/* Payment Method Selector */}
              <div className="pt-4 border-t border-[#3E2723]/10 space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#3E2723]/80 block">
                  Método de Pago *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Nequi option */}
                  <label
                    className={`relative p-4 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                      metodo === 'nequi'
                        ? 'border-[#D84315] bg-[#FFF3E0]/30'
                        : 'border-[#3E2723]/10 hover:border-[#3E2723]/30 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="nequi"
                      checked={metodo === 'nequi'}
                      onChange={() => setMetodo('nequi')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#3E2723] text-white flex items-center justify-center font-bold text-xs">
                        N
                      </div>
                      <CreditCard className="w-4 h-4 text-[#D84315]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#3E2723]">Transferencia Nequi</p>
                      <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                        Transfiere a nuestra cuenta Nequi y adjunta el comprobante.
                      </p>
                    </div>
                  </label>

                  {/* Efectivo contra entrega option */}
                  <label
                    className={`relative p-4 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                      metodo === 'efectivo'
                        ? 'border-[#D84315] bg-[#FFF3E0]/30'
                        : 'border-[#3E2723]/10 hover:border-[#3E2723]/30 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="efectivo"
                      checked={metodo === 'efectivo'}
                      onChange={() => setMetodo('efectivo')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#558B2F] text-white flex items-center justify-center">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <Truck className="w-4 h-4 text-[#558B2F]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#3E2723]">Efectivo contra Entrega</p>
                      <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                        Paga en efectivo al recibir el paquete en tu puerta.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right column: Order Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-[#3E2723]/10 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#3E2723] pb-3 border-b border-[#3E2723]/10">
              Resumen de la Orden ({items.length} {items.length === 1 ? 'producto' : 'productos'})
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 divide-y divide-[#3E2723]/5">
              {items.map((line) => (
                <div key={line.product.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#3E2723] truncate">{line.product.name}</p>
                    <p className="text-[#6B6B6B]">
                      {line.quantity} × <Money amount={line.product.price_cop} className="text-xs" />
                    </p>
                  </div>
                  <Money
                    amount={line.product.price_cop * line.quantity}
                    className="font-bold text-[#1E1E1E]"
                  />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#3E2723]/10 space-y-2 text-xs">
              <div className="flex justify-between text-[#6B6B6B]">
                <span>Subtotal</span>
                <Money amount={estimatedTotal} className="text-xs font-semibold text-[#1E1E1E]" />
              </div>
              <div className="flex justify-between text-base font-bold text-[#3E2723] pt-2 border-t border-[#3E2723]/10">
                <span>Total a Pagar</span>
                <Money amount={estimatedTotal} className="text-xl text-[#D84315]" />
              </div>
              <p className="text-[10px] text-[#6B6B6B] italic">
                * El valor definitivo es verificado y liquidado 100% por el servidor de la base de datos.
              </p>
            </div>

            <Button
              form="checkout-form"
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {metodo === 'efectivo' ? 'Confirmar Pedido en Efectivo' : 'Continuar al Pago con Nequi'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
