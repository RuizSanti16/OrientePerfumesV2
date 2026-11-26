-- =============================================================
-- Logo de cada casa de perfumeria
--
-- La pantalla de Logos del panel guardaba en localStorage, repartidos
-- ademas en cuatro colecciones, asi que lo que subia el cliente se
-- quedaba en su navegador. Y daba igual: el unico componente que los
-- leia, CategoryCard.jsx, no lo importaba ningun archivo, de modo que
-- los logos no se mostraban en ninguna parte de la tienda.
--
-- El logo va en tbl_marcas y no en una tabla aparte porque la marca
-- ya existe: la usan los productos y el filtro por casa del
-- buscador. Una tabla de logos al lado seria un segundo sitio donde
-- vive el mismo concepto, con sus nombres sueltos sin relacion con
-- los de la base.
--
-- VARCHAR(500) porque guarda una ruta o una URL, no la imagen.
--
-- CUIDADO AL APLICARLA
-- En local corre MariaDB y en Hostinger MySQL 8, que es mas
-- estricto. Aqui solo se anade una columna, que ambos aceptan igual.
-- =============================================================

ALTER TABLE tbl_marcas
    ADD COLUMN logo VARCHAR(500) NULL DEFAULT NULL AFTER nombre;
