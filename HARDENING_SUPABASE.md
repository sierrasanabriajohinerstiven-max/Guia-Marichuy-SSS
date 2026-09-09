# Endurecimiento del proyecto Supabase — Marichuy

Checklist para dejar el backend listo para producción. El esquema base
(`05_ESQUEMA_SUPABASE_COMPLETO.sql`) ya trae RLS al 100 %, RPC `SECURITY DEFINER`
con `SET search_path`, y buckets privados. Lo de abajo es lo que falta configurar
en el Dashboard + un par de parches SQL.

---

## 1. Dashboard → Authentication → URL Configuration

- **Site URL:** la URL final de producción (p. ej. `https://marichuy.example.com`).
  Sin esto, los enlaces de recuperación de contraseña apuntan a `localhost`.
- **Redirect URLs (allowlist):** añade **solo** tus dominios reales:
  - `https://marichuy.example.com/**`
  - `http://localhost:3000/**` (déjalo solo mientras desarrollas; quítalo en prod).
  Esto evita *open redirect* en el flujo de reseteo de contraseña.

## 2. Dashboard → Authentication → Providers → Email

- **Confirm email:** actívalo en producción (se desactivó solo para pruebas).
  Si lo activas, configura un SMTP propio (Auth → SMTP Settings) — el SMTP
  compartido de Supabase tiene límite y suele caer en spam.
- **Secure email change** y **Secure password change:** activados.

## 3. Dashboard → Authentication → Attack Protection

- **Leaked password protection:** ACTÍVALO (comprueba contra HaveIBeenPwned).
- **Rate limits:** revisa/baja los límites de `Token`, `Sign up`, `OTP` y
  `Password recovery` a valores razonables para una tienda pequeña.
- Considera **CAPTCHA** (hCaptcha/Turnstile) en signup si recibes abuso.
- **MFA:** ofrécelo al menos para la cuenta de administración.

## 4. Dashboard → Authentication → Sessions / JWT

- Access token: 3600 s (1 h) con refresh automático. Suficiente.
- **Refresh token rotation:** activado. **Reuse interval:** 10 s.

## 5. Parche SQL — validar la ruta del comprobante en `crear_pedido`

El RPC guarda `p_comprobante_path` tal cual. Aunque la política de Storage impide
subir fuera de `{auth.uid()}/…`, conviene que el RPC también lo exija:

```sql
CREATE OR REPLACE FUNCTION public.crear_pedido(
  p_items jsonb, p_envio jsonb, p_metodo text, p_comprobante_path text DEFAULT NULL
) RETURNS uuid
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_customer_id uuid := auth.uid();
  -- ... (resto de variables igual que en 05) ...
BEGIN
  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  IF p_metodo = 'nequi' THEN
    IF p_comprobante_path IS NULL THEN
      RAISE EXCEPTION 'Pago por Nequi requiere ruta de comprobante';
    END IF;
    -- NUEVO: la ruta debe empezar por el uid del usuario
    IF split_part(p_comprobante_path, '/', 1) <> v_customer_id::text THEN
      RAISE EXCEPTION 'Ruta de comprobante no válida';
    END IF;
  END IF;

  -- ... (resto del cuerpo igual que en 05) ...
END;
$$ LANGUAGE plpgsql;
```

## 6. Parche SQL — endurecer `handle_new_user` contra metadata maliciosa

El nombre viene de `raw_user_meta_data` (lo controla el cliente en el signup).
Limita longitud y quita saltos de línea:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    left(regexp_replace(
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Cliente'),
      '[[:cntrl:]]', '', 'g'
    ), 120),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 7. Dashboard → Advisors → Security

Corre el **Security Advisor** y resuelve lo que marque. Con el esquema `05` debería
salir limpio (RLS, `search_path`, sin tablas expuestas). Si sale algo, corrígelo
antes de publicar.

## 8. Storage

- Confirma que `payment-proofs` es **privado** (`public = false`) y
  `product-images` es público.
- En Storage → Configuration, pon un **límite de tamaño de archivo** (p. ej. 5 MB)
  y restringe **MIME types** a `image/png,image/jpeg,image/webp` en ambos buckets.

## 9. Backups y logs

- Plan gratis: exporta un dump manual periódico (`pg_dump`) o sube el plan.
- Revisa Logs → Auth/Postgres tras el lanzamiento por si hay intentos raros.

## 10. Crear el primer admin (una sola vez)

```sql
ALTER TABLE public.profiles DISABLE TRIGGER force_preserve_role;
UPDATE public.profiles p SET role = 'admin'
FROM auth.users u
WHERE p.id = u.id AND u.email = 'TU_CORREO_ADMIN@ejemplo.com';
ALTER TABLE public.profiles ENABLE TRIGGER force_preserve_role;
```

> Nunca insertes usuarios directamente en `auth.users` por SQL: rompe GoTrue.
> Registra siempre por la app.
