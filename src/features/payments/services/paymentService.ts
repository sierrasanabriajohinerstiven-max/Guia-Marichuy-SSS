import { supabase } from '../../../lib/supabaseClient';
import { ServiceResult } from '../../../types/db';

const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function uploadPaymentProof(
  file: File,
  userId: string
): Promise<ServiceResult<{ storagePath: string }>> {
  try {
    if (!userId) {
      return { data: null, error: 'Usuario no autenticado para subir el comprobante.' };
    }

    // Validación de tamaño < 5MB
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        data: null,
        error: `El archivo supera el tamaño máximo permitido de 5MB (Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
      };
    }

    // Validación de extensión .png/.jpg/.webp
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        data: null,
        error: `Formato de archivo no permitido (.${extension}). Solo se aceptan imágenes .png, .jpg o .webp.`,
      };
    }

    // Parche quirúrgico AI Studio:
    // Asegura que la carga al bucket payment-proofs use la ruta ${userId}/${crypto.randomUUID()}.${extension}
    const safeExt = extension === 'jpeg' ? 'jpg' : extension;
    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const storagePath = `${userId}/${uniqueId}.${safeExt}`;

    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      return { data: null, error: `Error al subir el comprobante: ${uploadError.message}` };
    }

    return { data: { storagePath }, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado al subir el archivo.';
    return { data: null, error: message };
  }
}

export async function getPaymentProofSignedUrl(
  storagePath: string,
  expiresIn = 300
): Promise<ServiceResult<{ signedUrl: string }>> {
  try {
    const { data, error } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(storagePath, expiresIn);

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data?.signedUrl) {
      return { data: null, error: 'No se pudo generar la URL firmada.' };
    }

    return { data: { signedUrl: data.signedUrl }, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al obtener la URL del comprobante.';
    return { data: null, error: message };
  }
}
