-- =============================================================
-- Recoger en la tienda
--
-- El pedido guarda si se envia a domicilio o lo recoge el cliente.
-- Recoger no paga envio y permite pagar en efectivo viva donde viva,
-- porque se paga en mano al retirarlo.
--
-- Los pedidos que ya existen quedan como 'domicilio', que es lo que
-- eran.
--
-- CUIDADO AL APLICARLA
-- En local corre MariaDB y en Hostinger MySQL 8. Aqui solo se anade
-- una columna, que ambos aceptan igual.
-- =============================================================

ALTER TABLE tbl_pedidos
    ADD COLUMN entrega VARCHAR(20) NOT NULL DEFAULT 'domicilio' AFTER ciudad;
