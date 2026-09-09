# syntax=docker/dockerfile:1

# ============================================================================
#  Marichuy · Chocolatería Artesanal — imagen de producción
#  SPA estática (React + Vite) servida por Nginx sin privilegios.
#  Build multi-stage: la imagen final NO contiene Node ni node_modules.
# ============================================================================

# ---------- Etapa 1: build ----------
FROM node:22-alpine AS build
WORKDIR /app

# Vite incrusta las variables VITE_* EN TIEMPO DE BUILD.
# Coolify las inyecta como "Build Variables" y aquí se reciben como ARG.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Dependencias primero (capa cacheable si no cambia el lockfile)
COPY package.json package-lock.json ./
RUN npm ci

# Código y compilación (corre "tsc --noEmit && vite build")
COPY . .
RUN npm run build

# ---------- Etapa 2: runtime ----------
# nginx-unprivileged: corre como uid 101 (no root) y escucha en 8080.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

# Config propia: fallback de SPA + cabeceras de seguridad + gzip + healthcheck
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Solo los estáticos compilados
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

# Healthcheck para que Coolify sepa si el contenedor está sano
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/healthz || exit 1
