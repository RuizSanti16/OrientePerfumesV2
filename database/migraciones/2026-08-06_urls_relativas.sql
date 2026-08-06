-- =============================================================
-- 2026-08-06 — Volver relativas las URL de imagenes y videos
--
-- Las subidas se guardaron con la URL absoluta del dominio de Railway:
--   https://orienteperfumesv2-production.up.railway.app/uploads/img_xxx.jpg
--
-- Eso ata el contenido al dominio donde se subio. Al mudar el sitio a
-- otro hosting las imagenes seguirian pidiendose a Railway, y dejarian
-- de verse en cuanto ese servicio se apague. Guardar la ruta relativa
-- (/uploads/img_xxx.jpg) hace que cada instalacion sirva sus propios
-- archivos, sea cual sea el dominio.
--
-- REPLACE solo actua si encuentra la cadena, de modo que las filas ya
-- relativas y las vacias quedan intactas y volver a ejecutar esto no
-- cambia nada. La condicion LIKE evita reescribir filas que no lo
-- necesitan.
--
-- Si el dominio de origen es otro, sustituirlo en las seis sentencias.
-- =============================================================

UPDATE tbl_productos
   SET imagen = REPLACE(imagen, 'https://orienteperfumesv2-production.up.railway.app', '')
 WHERE imagen LIKE 'https://orienteperfumesv2-production.up.railway.app%';

UPDATE tbl_producto_imagenes
   SET imagen = REPLACE(imagen, 'https://orienteperfumesv2-production.up.railway.app', '')
 WHERE imagen LIKE 'https://orienteperfumesv2-production.up.railway.app%';

UPDATE tbl_producto_dupes
   SET imagen = REPLACE(imagen, 'https://orienteperfumesv2-production.up.railway.app', '')
 WHERE imagen LIKE 'https://orienteperfumesv2-production.up.railway.app%';

UPDATE tbl_carrusel
   SET imagen = REPLACE(imagen, 'https://orienteperfumesv2-production.up.railway.app', '')
 WHERE imagen LIKE 'https://orienteperfumesv2-production.up.railway.app%';

UPDATE tbl_lanzamientos
   SET imagen = REPLACE(imagen, 'https://orienteperfumesv2-production.up.railway.app', '')
 WHERE imagen LIKE 'https://orienteperfumesv2-production.up.railway.app%';

-- El video de noticias puede apuntar a YouTube o a un archivo propio.
-- El LIKE deja fuera los enlaces externos.
UPDATE tbl_video_noticias
   SET url = REPLACE(url, 'https://orienteperfumesv2-production.up.railway.app', '')
 WHERE url LIKE 'https://orienteperfumesv2-production.up.railway.app%';
