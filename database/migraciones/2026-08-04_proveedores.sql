-- =============================================================
-- 2026-08-04 — Arreglar tbl_proovedores: id sin auto_increment y
-- telefono como entero
--
-- PROBLEMA 1: id_proovedor sin AUTO_INCREMENT
-- El unico proveedor existente quedo guardado con id_proovedor = 0.
-- Cualquier alta nueva enviaba id_proovedor = 0 por defecto y chocaba
-- contra ese registro:
--   SQLSTATE[23000]: Integrity constraint violation: 1062
--   Duplicate entry '0' for key 'PRIMARY'
-- No se podia crear ningun proveedor.
--
-- PROBLEMA 2: telefono declarado INT(15)
-- Un numero de telefono no es una cantidad con la que se opere
-- aritmeticamente y puede llevar un + inicial o superar el rango de
-- un entero de 32 bits (2147483647). El proveedor existente lo
-- demuestra: su telefono real quedo recortado exactamente a ese
-- limite, 2147483647, en lugar de guardarse el numero verdadero. Se
-- limpia ese valor porque no es recuperable; hay que volver a
-- ingresarlo desde el panel una vez aplicado el cambio.
--
-- tbl_compras.id_proovedor referencia esta tabla por clave foranea.
-- La tabla esta vacia, asi que renumerar el id existente es seguro,
-- pero MySQL 8 rechaza modificar una columna con una FK apuntandola
-- aunque no haya filas (MariaDB, con la que se probo primero en
-- local, si lo permite). Hay que quitar la FK, hacer el cambio y
-- volver a crearla igual.
-- =============================================================

-- 0) Nombre real de la restriccion, por si difiere del que trae este
--    volcado (tbl_compras_ibfk_1). Ejecutar antes si el paso 1 falla
--    con "foreign key constraint fails" o "unknown constraint":
--      SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
--      WHERE TABLE_NAME = 'tbl_compras' AND CONSTRAINT_TYPE = 'FOREIGN KEY';

ALTER TABLE tbl_compras DROP FOREIGN KEY tbl_compras_ibfk_1;

-- 1) El id 0 es legal en MySQL pero inusual como valor real de fila,
--    y en JavaScript `if (!id)` lo trata como vacio. Se pasa a 1 antes
--    de activar el auto_increment.
UPDATE tbl_proovedores SET id_proovedor = 1 WHERE id_proovedor = 0;

-- 2) Auto_increment para que los altas futuras obtengan un id propio.
--    MySQL fija el siguiente valor en MAX(id_proovedor)+1 al aplicar
--    esto, asi que no hace falta indicarlo aparte.
ALTER TABLE tbl_proovedores
  MODIFY id_proovedor INT(11) NOT NULL AUTO_INCREMENT;

-- 2b) Restaurar la clave foranea, identica a como estaba.
ALTER TABLE tbl_compras
  ADD CONSTRAINT tbl_compras_ibfk_1
  FOREIGN KEY (id_proovedor) REFERENCES tbl_proovedores (id_proovedor)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 3) El telefono pasa a texto, como ya esta en tbl_clientes y
--    tbl_pedidos. Primero se hace la columna nullable y despues se
--    limpia el valor truncado: haciendolo al reves, con la columna
--    todavia INT NOT NULL, MariaDB no rechaza el NULL sino que lo
--    convierte en silencio a 0, dejando el dato igual de erroneo.
ALTER TABLE tbl_proovedores
  MODIFY telefono VARCHAR(20) NULL DEFAULT NULL;

UPDATE tbl_proovedores SET telefono = NULL WHERE telefono = '2147483647';
