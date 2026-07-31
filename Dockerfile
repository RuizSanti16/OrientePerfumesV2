# =============================================================
# Backend PHP de OrientPerfumes
# Sirve backend/api sobre Apache. Compatible con Render, Railway,
# Fly.io o cualquier plataforma que acepte un contenedor.
#
# Build:  docker build -t orientperfumes-api .
# Run:    docker run -p 8080:80 --env-file backend/.env orientperfumes-api
# =============================================================
FROM php:8.2-apache

# pdo_mysql para la base de datos.
#
# fileinfo NO se instala aqui: viene compilada de serie en las imagenes
# oficiales de PHP, asi que no existe ningun fileinfo.so que habilitar y
# `docker-php-ext-enable fileinfo` aborta el build. La usan
# subir_imagen.php y subir_video.php (finfo_open) y ya esta disponible.
RUN docker-php-ext-install pdo_mysql

# El .htaccess de uploads bloquea la ejecucion de scripts; sin
# AllowOverride las reglas se ignorarian silenciosamente.
RUN a2enmod rewrite headers
RUN printf '<Directory /var/www/html>\n\
    Options -Indexes +FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>\n' > /etc/apache2/conf-available/orientperfumes.conf \
    && a2enconf orientperfumes

# Limites de subida acordes a los endpoints de imagen y video.
RUN printf 'upload_max_filesize = 64M\n\
post_max_size = 64M\n\
memory_limit = 256M\n\
expose_php = Off\n' > /usr/local/etc/php/conf.d/orientperfumes.ini

WORKDIR /var/www/html
COPY backend/ /var/www/html/

# Apache necesita poder escribir las subidas.
RUN mkdir -p /var/www/html/uploads \
    && chown -R www-data:www-data /var/www/html/uploads

# Render y Railway inyectan el puerto en $PORT; Apache escucha en 80
# por defecto, asi que se ajusta al arrancar.
CMD ["sh", "-c", "sed -i \"s/^Listen 80$/Listen ${PORT:-80}/\" /etc/apache2/ports.conf && sed -i \"s/:80>/:${PORT:-80}>/\" /etc/apache2/sites-available/000-default.conf && apache2-foreground"]
