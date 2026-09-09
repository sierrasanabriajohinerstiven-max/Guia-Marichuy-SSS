# Política de seguridad — Marichuy

## Modelo de seguridad

La aplicación es una SPA estática. **No hay backend propio**: el navegador habla
directamente con Supabase usando la clave publicable (anon), que está diseñada para
ser pública.

La protección real vive en la base de datos:

- **Row Level Security (RLS) activo en el 100 % de las tablas.** Un cliente solo ve
  y modifica sus propios pedidos, comprobantes y perfil.
- **RPC transaccionales `SECURITY DEFINER`** para toda operación crítica:
  - `crear_pedido` — recalcula subtotal y total en el servidor (el frontend nunca
    envía el precio), valida stock con bloqueo de fila y descuenta inventario.
  - `revisar_comprobante` — aprobar/rechazar; el rechazo cancela el pedido y repone
    stock, todo en una transacción; el motivo de rechazo es obligatorio.
  - `cambiar_estado_pedido` — valida transiciones; no deja salir de estados terminales.
- **Trigger `preserve_profile_role`** — impide que un usuario cambie su propio `role`.
- **Storage privado** para comprobantes Nequi; solo el dueño (por ruta `{uid}/…`) o
  un admin pueden leerlos, y siempre vía URL firmada de corta duración (300 s).

## Cabeceras HTTP

El sitio se sirve con: `Content-Security-Policy` estricta, `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`,
`Strict-Transport-Security` y políticas cross-origin. Ver `public/_headers` y `vercel.json`.

## Endurecimiento del proyecto Supabase

Pasos obligatorios antes de producción: ver `HARDENING_SUPABASE.md`.

## Reporte de vulnerabilidades

Si encuentras un problema de seguridad, **no abras un issue público**. Escribe a
`contacto@marichuychocolate.co` con el detalle y los pasos para reproducirlo.
Respondemos en un plazo de 5 días hábiles.

## Alcance

- Fuera de alcance: ataques de fuerza bruta contra Supabase (mitigados por sus
  límites de tasa), ingeniería social, y el uso legítimo de la clave publicable
  (es pública por diseño).
- En alcance: bypass de RLS, escalada de privilegios, XSS, exposición de datos de
  otros usuarios, manipulación de precios o de estados de pedido.
