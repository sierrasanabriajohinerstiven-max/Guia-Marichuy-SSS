/**
 * Validacion y saneamiento de entradas del lado del cliente.
 *
 * Esto es DEFENSA EN PROFUNDIDAD, no la barrera principal: la seguridad real
 * la imponen las politicas RLS de Supabase, los CHECK de la base de datos y los
 * RPC SECURITY DEFINER (que recalculan totales y validan stock en el servidor).
 * Aqui solo mejoramos la UX y reducimos entradas basura o abusivas.
 */

/** Longitudes maximas razonables por campo (evita payloads gigantes). */
export const MAX = {
  name: 120,
  email: 254,
  phone: 25,
  address: 200,
  city: 80,
  notes: 400,
  productName: 120,
  description: 2000,
  rejectionReason: 500,
} as const;

/** true si el codepoint es un caracter de control C0/C1 (no imprimible). */
function isControlChar(code: number): boolean {
  return (code >= 0 && code <= 31) || (code >= 127 && code <= 159);
}

/** Quita caracteres de control, colapsa espacios, recorta y limita longitud. */
export function sanitizeText(value: string, max: number): string {
  let cleaned = '';
  for (const ch of value) {
    if (!isControlChar(ch.codePointAt(0) ?? 0)) cleaned += ch;
  }
  return cleaned.replace(/\s{3,}/g, '  ').trim().slice(0, max);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s-]{7,20}$/;

export function isValidEmail(value: string): boolean {
  const v = value.trim();
  return v.length <= MAX.email && EMAIL_RE.test(v);
}

export function isValidPhone(value: string): boolean {
  const v = value.trim();
  const digits = v.replace(/\D/g, '');
  return PHONE_RE.test(v) && digits.length >= 7 && digits.length <= 15;
}

export function normalizePhone(value: string): string {
  return sanitizeText(value, MAX.phone).replace(/[^\d+\s-]/g, '');
}

/** Slug ASCII seguro a partir de un nombre (para categorias/productos). */
export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\x20-\x7E]/g, '') // fuera de ASCII imprimible (incluye diacriticos ya separados)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

/** Valida una URL de imagen aceptada por la CSP (solo https o data:image). */
export function isSafeImageUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  return /^https:\/\//i.test(v) || /^data:image\//i.test(v);
}

/** Entero dentro de un rango [min, max]. */
export function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(Math.round(value), min), max);
}
