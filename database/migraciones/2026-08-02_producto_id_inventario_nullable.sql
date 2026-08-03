-- =============================================================
-- 2026-08-02 — tbl_productos.id_inventario pasa a admitir NULL
--
-- PROBLEMA
-- Crear un producto fallaba en produccion con:
--
--   SQLSTATE[HY000]: General error: 1364
--   Field 'id_inventario' doesn't have a default value
--
-- La tabla arrastra una columna id_inventario declarada INT(10)
-- NOT NULL sin valor por defecto que ningun INSERT rellena. Es una
-- columna vestigial: la relacion entre producto e inventario se
-- modela en sentido contrario, con tbl_inventario.id_producto. Se
-- comprobo que no se usa en ninguna consulta del backend ni en el
-- frontend.
--
-- POR QUE SOLO FALLABA EN PRODUCCION
-- MariaDB, que es lo que trae XAMPP, no aplica modo estricto por
-- defecto y rellenaba la columna con un 0 en silencio. MySQL 8, que
-- es lo que corre en Railway, si lo aplica y rechaza la insercion.
-- De ahi que el alta funcionara en local y fallara en la web.
--
-- SOLUCION
-- Permitir NULL. Se deja la columna en lugar de eliminarla para no
-- alterar consultas que hagan SELECT *; si mas adelante se confirma
-- que sobra, puede retirarse.
-- =============================================================

ALTER TABLE tbl_productos
  MODIFY id_inventario INT(10) NULL DEFAULT NULL;
