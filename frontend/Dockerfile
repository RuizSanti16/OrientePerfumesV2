# =============================================================
# Frontend de OrientPerfumes (React + Vite) servido con nginx.
#
# IMPORTANTE: Vite sustituye import.meta.env.VITE_API_URL en tiempo de
# COMPILACION, no de ejecucion. Por eso la URL de la API entra como
# build arg y no como variable de entorno del contenedor: definirla
# solo en runtime no tendria ningun efecto.
#
# Build:
#   docker build -f frontend/Dockerfile \
#     --build-arg VITE_API_URL=https://mi-api.up.railway.app \
#     -t orientperfumes-web ./frontend
# =============================================================

# ── Etapa 1: compilar ────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ── Etapa 2: servir ──────────────────────────────────────────
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# La configuracion va en un archivo aparte en lugar de generarse con
# printf: el escapado de $uri, \. y las comillas dentro de un RUN es
# muy fragil y rompia el build.
# El entrypoint de nginx resuelve ${PORT} con envsubst al arrancar,
# que es como Railway inyecta el puerto.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

ENV PORT=80
EXPOSE 80
