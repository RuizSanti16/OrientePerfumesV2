-- =============================================================
-- Ajustes de la tienda en el servidor
--
-- Hasta ahora la pantalla de Ajustes del panel guardaba con
-- localStorage.setItem y nada mas: los datos se quedaban en el
-- navegador de quien los escribia. El cliente ponia sus redes
-- sociales en su portatil, las veia, y no las veia nadie mas, ni
-- siquiera los visitantes de la tienda. Al borrar la cache se
-- perdian.
--
-- Clave y valor en vez de una columna por ajuste: la lista crece
-- cada vez que se anade un campo al panel, y asi no hace falta una
-- migracion nueva por cada uno.
--
-- CUIDADO AL APLICARLA
-- En local corre MariaDB y en Hostinger MySQL 8, que es mas
-- estricto. Aqui solo se crea una tabla, que ambos aceptan igual.
-- =============================================================

CREATE TABLE IF NOT EXISTS tbl_ajustes (
    clave       VARCHAR(60)  NOT NULL PRIMARY KEY,
    valor       TEXT         NULL DEFAULT NULL,
    actualizado DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
