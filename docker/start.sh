#!/bin/sh
# =============================================================
# Arranque del contenedor del backend.
#
# Se separa del CMD porque hacia falta mas logica de la que cabe
# comodamente en una linea, y sobre todo para dejar el arranque a
# prueba de configuraciones heredadas.
# =============================================================
set -e

# ── Un unico MPM ─────────────────────────────────────────────
# Apache aborta con "AH00534: More than one MPM loaded" si hay dos
# modulos MPM activos. La imagen base solo trae mpm_prefork, pero si
# la plataforma o una capa previa habilita ademas mpm_event o
# mpm_worker, el contenedor muere en bucle. Aqui se fuerza el estado
# correcto en cada arranque en lugar de confiar en como quedo la
# imagen.
a2dismod -f mpm_event  >/dev/null 2>&1 || true
a2dismod -f mpm_worker >/dev/null 2>&1 || true
a2enmod  mpm_prefork   >/dev/null 2>&1 || true

MPMS=$(ls /etc/apache2/mods-enabled/ 2>/dev/null | grep -c '^mpm_.*\.load$' || echo 0)
echo "[inicio] MPM activos: $MPMS ($(ls /etc/apache2/mods-enabled/ | grep '^mpm_.*\.load$' | tr '\n' ' '))"

# ── Puerto ───────────────────────────────────────────────────
# Railway inyecta el puerto en $PORT; Apache escucha en 80 por defecto.
PUERTO="${PORT:-80}"
sed -i "s/^Listen .*/Listen ${PUERTO}/" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:[0-9]*>/<VirtualHost *:${PUERTO}>/" /etc/apache2/sites-available/000-default.conf
echo "[inicio] Apache escuchara en el puerto ${PUERTO}"

# Evita el aviso AH00558 al no poder resolver el nombre del host.
if ! grep -q '^ServerName' /etc/apache2/apache2.conf; then
    echo "ServerName localhost" >> /etc/apache2/apache2.conf
fi

# ── Carpeta de subidas ───────────────────────────────────────
# Si hay un volumen persistente montado en uploads, tapa el contenido
# que venia en la imagen: la carpeta aparece vacia y sin el .htaccess
# que impide ejecutar scripts subidos. Se restaura en cada arranque y
# se corrigen los permisos, porque un volumen recien creado pertenece
# a root y Apache no podria escribir en el.
SUBIDAS=/var/www/html/uploads
mkdir -p "$SUBIDAS"

if [ ! -f "$SUBIDAS/.htaccess" ] && [ -f /usr/local/share/uploads-htaccess ]; then
    cp /usr/local/share/uploads-htaccess "$SUBIDAS/.htaccess"
    echo "[inicio] .htaccess restaurado en la carpeta de subidas"
fi

chown -R www-data:www-data "$SUBIDAS" 2>/dev/null || true

if [ -f "$SUBIDAS/.htaccess" ]; then
    echo "[inicio] subidas protegidas ($(ls -1 "$SUBIDAS" | wc -l) archivos)"
else
    echo "[inicio] AVISO: la carpeta de subidas no tiene .htaccess"
fi

# ── Comprobacion de configuracion ────────────────────────────
# Si algo quedo mal, el mensaje aparece aqui en lugar de en un bucle
# de reinicios sin contexto.
apache2ctl configtest || {
    echo "[inicio] ERROR: la configuracion de Apache no es valida"
    exit 1
}

exec apache2-foreground
