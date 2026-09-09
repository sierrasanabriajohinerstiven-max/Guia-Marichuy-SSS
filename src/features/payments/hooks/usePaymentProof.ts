import { useState, useCallback } from 'react';
import { uploadPaymentProof } from '../services/paymentService';
import { invokeCrearPedido } from '../../checkout/services/checkoutService';
import { CartLineItem, EnvioPayload } from '../../../types/db';
import { useCartStore } from '../../cart/store/useCartStore';
import toast from 'react-hot-toast';

export function usePaymentProof() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearCart = useCartStore((state) => state.clearCart);

  const handleSelectFile = useCallback((file: File | null) => {
    setError(null);
    if (!file) {
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }

    // Pre-validaciones
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
      const msg = 'Solo se admiten imágenes en formato .jpg, .png o .webp';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const msg = 'El comprobante debe pesar menos de 5MB';
      setError(msg);
      toast.error(msg);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }, [previewUrl]);

  const processNequiOrder = async (
    items: CartLineItem[],
    envio: EnvioPayload,
    userId: string
  ): Promise<{ success: boolean; orderId?: string }> => {
    if (!selectedFile) {
      const msg = 'Por favor adjunta la fotografía o captura de tu comprobante Nequi.';
      setError(msg);
      toast.error(msg);
      return { success: false };
    }

    setLoading(true);
    setError(null);

    // 1. Subir comprobante al storage
    const uploadRes = await uploadPaymentProof(selectedFile, userId);
    if (uploadRes.error || !uploadRes.data?.storagePath) {
      const msg = uploadRes.error || 'No se pudo subir el comprobante';
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return { success: false };
    }

    const comprobantePath = uploadRes.data.storagePath;

    // 2. Invocar RPC crear_pedido
    const orderRes = await invokeCrearPedido(items, envio, 'nequi', comprobantePath);
    if (orderRes.error || !orderRes.data) {
      const msg = orderRes.error || 'Error al registrar el pedido con comprobante';
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return { success: false };
    }

    // 3. Éxito: vaciamos carrito
    clearCart();
    toast.success('¡Comprobante recibido y orden generada con éxito!');
    setLoading(false);
    return { success: true, orderId: orderRes.data };
  };

  return {
    selectedFile,
    previewUrl,
    loading,
    error,
    setError,
    handleSelectFile,
    processNequiOrder,
  };
}
