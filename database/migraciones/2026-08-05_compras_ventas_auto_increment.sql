-- =============================================================
-- 2026-08-05 — Auto_increment en la cadena de compras y ventas
--
-- Mismo fallo que ya aparecio en tbl_proovedores, repetido en cinco
-- tablas. Sus claves primarias son int(11) NOT NULL sin AUTO_INCREMENT
-- y sin valor por defecto, pero ningun INSERT del backend las envia:
--
--   tbl_compras          id_compra
--   tbl_detalle_compra   id_detalle_compra
--   tbl_ventas           id_venta
--   tbl_detalle_venta    id_detalle_venta
--   tbl_ventas_clientes  id_venta_cliente
--
-- En MySQL 8 (Railway) eso corta la operacion en seco:
--   SQLSTATE[HY000]: General error: 1364 Field 'id_venta' doesn't
--   have a default value
-- MariaDB (el XAMPP local) la rellena en silencio con 0, asi que la
-- primera venta parece funcionar y la segunda choca contra la primaria
-- duplicada. Por eso conviene aplicar esto tambien en local.
--
-- Ademas $pdo->lastInsertId() devuelve 0 sin auto_increment, asi que el
-- detalle de la venta se colgaria de un id_venta = 0 inexistente.
--
-- Las cinco tablas estan vacias, de modo que no hay ids que renumerar
-- (a diferencia de tbl_proovedores, que tenia una fila con id = 0).
--
-- Tres claves foraneas apuntan a las columnas que hay que modificar y
-- MySQL 8 no deja tocarlas mientras existan, aunque las tablas esten
-- vacias. Se quitan, se hace el cambio y se recrean identicas. Las
-- primarias de las tres tablas de detalle no las referencia nadie, asi
-- que esas se modifican directamente.
--
-- Si algun nombre de restriccion difiere de este volcado:
--   SELECT CONSTRAINT_NAME, TABLE_NAME FROM information_schema.KEY_COLUMN_USAGE
--   WHERE REFERENCED_TABLE_NAME IN ('tbl_compras','tbl_ventas');
-- =============================================================

-- 1) Soltar las claves foraneas que apuntan a id_compra e id_venta.
ALTER TABLE tbl_detalle_compra  DROP FOREIGN KEY tbl_detalle_compra_ibfk_2;
ALTER TABLE tbl_detalle_venta   DROP FOREIGN KEY tbl_detalle_venta_ibfk_1;
ALTER TABLE tbl_ventas_clientes DROP FOREIGN KEY tbl_ventas_clientes_ibfk_2;

-- 2) Activar el auto_increment en las cinco primarias.
ALTER TABLE tbl_compras
  MODIFY id_compra INT(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE tbl_ventas
  MODIFY id_venta INT(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE tbl_detalle_compra
  MODIFY id_detalle_compra INT(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE tbl_detalle_venta
  MODIFY id_detalle_venta INT(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE tbl_ventas_clientes
  MODIFY id_venta_cliente INT(11) NOT NULL AUTO_INCREMENT;

-- 3) Recrear las claves foraneas tal y como estaban.
ALTER TABLE tbl_detalle_compra
  ADD CONSTRAINT tbl_detalle_compra_ibfk_2
  FOREIGN KEY (id_compra) REFERENCES tbl_compras (id_compra)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE tbl_detalle_venta
  ADD CONSTRAINT tbl_detalle_venta_ibfk_1
  FOREIGN KEY (id_venta) REFERENCES tbl_ventas (id_venta)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE tbl_ventas_clientes
  ADD CONSTRAINT tbl_ventas_clientes_ibfk_2
  FOREIGN KEY (id_venta) REFERENCES tbl_ventas (id_venta)
  ON DELETE CASCADE ON UPDATE CASCADE;
