-- =============================================================
-- 2026-08-02 — tbl_clientes.edad pasa a admitir NULL
--
-- PROBLEMA
-- La columna estaba declarada como INT(3) NOT NULL sin valor por
-- defecto, y era la unica de la tabla que no admitia nulos. Como el
-- formulario de registro no pide la edad (no hace falta para crear
-- una cuenta), el INSERT la omitia y MySQL rechazaba el alta con:
--
--   SQLSTATE[HY000]: General error: 1364
--   Field 'edad' doesn't have a default value
--
-- El alta desde el panel de administracion fallaba igual, porque
-- clientes.php envia NULL cuando el campo se deja vacio.
--
-- SOLUCION
-- La edad es un dato opcional: su ausencia se representa con NULL,
-- no con un cero que ensuciaria los datos.
-- =============================================================

ALTER TABLE tbl_clientes
  MODIFY edad INT(3) NULL DEFAULT NULL;
