-- =============================================================
-- Costo del envio en el pedido
--
-- El envio se cobra aparte de los productos: 15.000 en el Valle de
-- Aburra y el Oriente cercano, 20.000 fuera, y gratis a partir del
-- minimo que marque el panel. Hasta ahora el total eran solo los
-- productos menos el cupon.
--
-- Se guarda en el pedido y no se recalcula al consultarlo: las
-- tarifas cambian con el tiempo, y un pedido de hace tres meses
-- tiene que seguir diciendo lo que costo entonces.
--
-- Los pedidos que ya existen quedan en 0, que es lo que se les
-- cobro.
--
-- CUIDADO AL APLICARLA
-- En local corre MariaDB y en Hostinger MySQL 8, que es mas
-- estricto. Aqui solo se anade una columna, que ambos aceptan igual.
-- =============================================================

ALTER TABLE tbl_pedidos
    ADD COLUMN envio DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER descuento;
