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

# La app es una SPA con React Router: cualquier ruta desconocida debe
# devolver index.html o al recargar en /coleccion nginx daria un 404.
# El puerto lo inyecta Railway en $PORT, asi que la plantilla se
# resuelve al arrancar.
RUN printf 'server {\n\
    listen       ${PORT};\n\
    server_name  _;\n\
    root         /usr/share/nginx/html;\n\
    index        index.html;\n\
\n\
    gzip on;\n\
    gzip_types text/css application/javascript image/svg+xml;\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    location ~* \\.(js|css|png|jpg|jpeg|gif|svg|woff2?)$ {\n\
        expires 30d;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
}\n' > /etc/nginx/templates/default.conf.template

ENV PORT=80
EXPOSE 80
