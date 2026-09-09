# Marichuy · Chocolatería Artesanal

Tienda en línea y panel de administración para **Marichuy**, chocolatería artesanal
colombiana. SPA en React + TypeScript sobre Supabase (Auth, PostgreSQL con RLS, Storage).

- **Cliente:** catálogo público, carrito local, checkout con pago Nequi (subida de
  comprobante) o efectivo contra entrega, seguimiento de pedidos.
- **Admin:** dashboard de KPIs, CRUD de productos y categorías, moderación de
  comprobantes Nequi, gestión de pedidos y directorio de clientes.

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19, TypeScript (strict), Vite 6, Tailwind CSS 4 |
| Estado | Zustand (carrito, persistido en `localStorage`) |
| Backend | Supabase — PostgreSQL 15+, Auth (JWT), Storage, **RLS al 100%** |
| Router | Estado interno (`currentView`), sin librería de routing |

## Requisitos

- Node.js 20 o superior
- Un proyecto de Supabase con el esquema aplicado (ver `HARDENING_SUPABASE.md`)

## Configuración

```bash
cp .env.example .env
# edita .env con tu VITE_SUPABASE_URL y tu clave publicable (anon)
npm install
```

> La clave publicable (`sb_publishable_…` / anon) es segura para el navegador:
> **toda la seguridad de datos la imponen las políticas RLS de Supabase.**
> Nunca pongas la clave `service_role` / secret en el frontend.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en `http://localhost:3000` |
| `npm run build` | `tsc --noEmit` + build de producción a `dist/` |
| `npm run preview` | Sirve el build de producción |
| `npm run typecheck` | Solo chequeo de tipos |
| `npm run audit:prod` | `npm audit` de dependencias de producción |

## Despliegue

Es un sitio estático (SPA). El build genera `dist/`.

- **Vercel:** detecta `vercel.json` (cabeceras de seguridad + rewrite SPA).
- **Netlify / Cloudflare Pages:** usa `netlify.toml` + `public/_headers`.
- **Coolify / Docker (autohospedado):** usa el `Dockerfile` (build multi-stage
  Node → Nginx sin privilegios en el puerto `8080`). Las cabeceras de seguridad
  y el fallback de SPA van en `nginx.conf`. Healthcheck en `/healthz`.
  Las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` deben pasarse como
  **build args / "Build Variables"** (Vite las incrusta en tiempo de build, no de runtime).
- **Otro host / Nginx:** publica `dist/`, redirige todas las rutas a `index.html`
  y replica las cabeceras de `public/_headers`.

### Probar la imagen en local

```bash
docker build -t marichuy \
  --build-arg VITE_SUPABASE_URL="https://TU-PROYECTO.supabase.co" \
  --build-arg VITE_SUPABASE_ANON_KEY="sb_publishable_..." .
docker run --rm -p 8080:8080 marichuy
# http://localhost:8080
```

Antes de subir a producción, sigue la lista de `HARDENING_SUPABASE.md` (Site URL,
protección de contraseñas filtradas, límites de tasa, etc.).

## Estructura

```
src/
  app/          App.tsx (router por estado), AuthProvider, ShellTienda, ShellAdmin
  components/ui Button, Input, Modal, Badge, Skeleton, EmptyState, ErrorState, Money
  lib/          supabaseClient, format, cn, validation
  types/        db.ts (contratos del esquema y de los RPC)
  features/     auth · catalog · cart · checkout · payments · orders · admin
                (cada feature: components / hooks / services — regla de 3 capas)
```

Los componentes nunca llaman a Supabase directamente: pasan por un *hook* que a su
vez usa un *service*. Toda escritura crítica (crear pedido, revisar comprobante,
cambiar estado) va por un RPC `SECURITY DEFINER` que valida y recalcula en el servidor.
