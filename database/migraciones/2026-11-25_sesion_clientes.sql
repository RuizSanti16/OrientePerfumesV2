-- =============================================================
-- Sesion de clientes y pedidos ligados a la cuenta
--
-- El login de clientes no emitia token: devolvia los datos y el
-- navegador los guardaba en localStorage, de modo que el servidor no
-- tenia forma de saber quien llamaba. Exigir la cuenta solo en React
-- seria una cortina, porque la API es publica. Estas columnas son las
-- mismas que ya usa tbl_administrador.
--
-- tbl_pedidos gana id_cliente para el historial de compras. Queda
-- NULL-able a proposito: los pedidos ya hechos son anonimos y no hay
-- a quien atribuirlos.
--
-- CUIDADO AL APLICARLA
-- En local corre MariaDB y en Hostinger MySQL 8, que es mas estricto.
-- Aqui solo se anaden columnas e indices, que es lo que ambos
-- aceptan igual. Lo que MySQL 8 rechaza es MODIFY sobre una columna
-- con clave foranea, y eso no se hace en ningun paso.
-- =============================================================

-- ── Sesion de clientes ───────────────────────────────────────
ALTER TABLE tbl_clientes
    ADD COLUMN token        VARCHAR(64) NULL DEFAULT NULL,
    ADD COLUMN token_expiry DATETIME    NULL DEFAULT NULL;

-- Se busca por token en cada peticion autenticada. Unico, porque dos
-- cuentas no pueden compartir sesion.
ALTER TABLE tbl_clientes
    ADD UNIQUE KEY uq_cliente_token (token);

-- ── Pedidos ligados a la cuenta ──────────────────────────────
ALTER TABLE tbl_pedidos
    ADD COLUMN id_cliente INT NULL DEFAULT NULL AFTER codigo_seguimiento;

ALTER TABLE tbl_pedidos
    ADD KEY idx_pedido_cliente (id_cliente);

-- ON DELETE SET NULL y no CASCADE: si se borra una cuenta, el pedido
-- tiene que seguir existiendo. Es un registro de venta, con su
-- importe y su estado de pago, y perderlo descuadraria las cuentas.
ALTER TABLE tbl_pedidos
    ADD CONSTRAINT fk_pedido_cliente
        FOREIGN KEY (id_cliente) REFERENCES tbl_clientes (id_cliente)
        ON DELETE SET NULL ON UPDATE CASCADE;
