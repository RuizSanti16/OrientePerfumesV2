-- =============================================================
-- 2026-08-10 — Corregir las rutas de las imagenes ya subidas
--
-- subir_imagen.php y subir_video.php leian UPLOADS_BASE_URL con
-- getenv(), que en hosting compartido no ve lo que hay en entorno.php.
-- El resultado es que en produccion caian siempre al valor por defecto
-- y guardaban la ruta del XAMPP local:
--
--   /OrientPerfumesV2/backend/uploads/img_xxx.jpg
--
-- Esa ruta no existe en el servidor. El archivo se subio bien y sigue
-- en su sitio; lo que quedo mal es la direccion guardada en la base, y
-- por eso la imagen no se veia.
--
-- Esto reescribe esas rutas al prefijo correcto. Solo toca las filas
-- afectadas, asi que se puede ejecutar mas de una vez sin problema.
--
-- El codigo ya esta corregido: las subidas nuevas guardan la ruta buena.
-- =============================================================

SET NAMES utf8mb4;

UPDATE tbl_productos
   SET imagen = REPLACE(imagen, '/OrientPerfumesV2/backend/uploads/', '/uploads/')
 WHERE imagen LIKE '%/OrientPerfumesV2/backend/uploads/%';

UPDATE tbl_producto_imagenes
   SET imagen = REPLACE(imagen, '/OrientPerfumesV2/backend/uploads/', '/uploads/')
 WHERE imagen LIKE '%/OrientPerfumesV2/backend/uploads/%';

UPDATE tbl_producto_dupes
   SET imagen = REPLACE(imagen, '/OrientPerfumesV2/backend/uploads/', '/uploads/')
 WHERE imagen LIKE '%/OrientPerfumesV2/backend/uploads/%';

UPDATE tbl_carrusel
   SET imagen = REPLACE(imagen, '/OrientPerfumesV2/backend/uploads/', '/uploads/')
 WHERE imagen LIKE '%/OrientPerfumesV2/backend/uploads/%';

UPDATE tbl_lanzamientos
   SET imagen = REPLACE(imagen, '/OrientPerfumesV2/backend/uploads/', '/uploads/')
 WHERE imagen LIKE '%/OrientPerfumesV2/backend/uploads/%';

UPDATE tbl_video_noticias
   SET url = REPLACE(url, '/OrientPerfumesV2/backend/uploads/', '/uploads/')
 WHERE url LIKE '%/OrientPerfumesV2/backend/uploads/%';

-- Cuantas quedaron mal (deberia dar 0 en todas)
SELECT 'productos' t, COUNT(*) n FROM tbl_productos        WHERE imagen LIKE '%OrientPerfumesV2%'
UNION ALL SELECT 'producto_imagenes', COUNT(*) FROM tbl_producto_imagenes WHERE imagen LIKE '%OrientPerfumesV2%'
UNION ALL SELECT 'producto_dupes',    COUNT(*) FROM tbl_producto_dupes    WHERE imagen LIKE '%OrientPerfumesV2%'
UNION ALL SELECT 'carrusel',          COUNT(*) FROM tbl_carrusel          WHERE imagen LIKE '%OrientPerfumesV2%'
UNION ALL SELECT 'lanzamientos',      COUNT(*) FROM tbl_lanzamientos      WHERE imagen LIKE '%OrientPerfumesV2%'
UNION ALL SELECT 'video_noticias',    COUNT(*) FROM tbl_video_noticias    WHERE url    LIKE '%OrientPerfumesV2%';
