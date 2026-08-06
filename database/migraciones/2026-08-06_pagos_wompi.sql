-- =============================================================
-- 2026-08-06 — Estado de pago en los pedidos y registro de pagos
--
-- Hasta ahora tbl_pedidos solo tenia `estado`, que describe el envio
-- (pendiente, preparacion, enviado, entregado, cancelado) y lo mueve el
-- administrador a mano. Con una pasarela cobrando hacen falta dos ejes
-- distintos: un pedido puede estar pagado y sin enviar, o enviado y sin
-- pagar si se despacha contraentrega. Mezclarlos en una sola columna
-- obligaria a inventar estados como "pagado_pero_no_enviado".
--
-- Por eso se anade `estado_pago` aparte, y `referencia_pago`, que es el
-- identificador que viaja a Wompi y vuelve en la confirmacion.
--
-- tbl_pagos guarda cada evento recibido. No es un lujo de auditoria:
-- las pasarelas reintentan el aviso si no responden 200 a la primera, y
-- sin un registro con el id de transaccion como clave unica el mismo
-- pago podria aplicarse dos veces. Ademas deja rastro de lo que enviaron
-- cuando algo no cuadre, que con dinero de por medio importa.
-- =============================================================

ALTER TABLE tbl_pedidos
  ADD COLUMN referencia_pago VARCHAR(40) NULL DEFAULT NULL AFTER metodo_pago;

-- Unica: la referencia identifica al pedido frente a la pasarela y dos
-- pedidos no pueden compartirla. Se permite NULL porque los pedidos
-- contraentrega no pasan por la pasarela, y en MySQL varios NULL no se
-- consideran duplicados.
ALTER TABLE tbl_pedidos
  ADD UNIQUE KEY uq_referencia_pago (referencia_pago);

-- pendiente:  creado, sin intentar cobrar todavia
-- iniciado:   el cliente fue enviado a la pasarela
-- aprobado:   dinero confirmado
-- rechazado:  la entidad rechazo el pago
-- anulado:    el cliente desistio o expiro el intento
-- error:      la pasarela informo un fallo
-- no_aplica:  contraentrega, no hay cobro en linea
ALTER TABLE tbl_pedidos
  ADD COLUMN estado_pago ENUM('pendiente','iniciado','aprobado','rechazado','anulado','error','no_aplica')
      NOT NULL DEFAULT 'pendiente' AFTER referencia_pago;

ALTER TABLE tbl_pedidos
  ADD COLUMN fecha_pago DATETIME NULL DEFAULT NULL AFTER estado_pago;

CREATE TABLE IF NOT EXISTS tbl_pagos (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido         INT NOT NULL,
    referencia        VARCHAR(40)  NOT NULL,
    -- El id que asigna la pasarela. Unico: es lo que evita que un
    -- reintento del aviso aplique el mismo pago dos veces.
    transaccion_id    VARCHAR(64)  NULL DEFAULT NULL,
    estado            VARCHAR(30)  NOT NULL,
    metodo            VARCHAR(30)  NULL DEFAULT NULL,
    -- En centavos y como entero, que es como lo maneja la pasarela.
    -- Un decimal invitaria a comparar importes con redondeos de por
    -- medio, justo donde no conviene.
    monto_centavos    BIGINT       NOT NULL DEFAULT 0,
    moneda            VARCHAR(8)   NOT NULL DEFAULT 'COP',
    -- El evento completo tal como llego, por si hay que reconstruir
    -- que dijo la pasarela exactamente.
    evento            LONGTEXT     NULL DEFAULT NULL,
    fecha             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_transaccion (transaccion_id),
    KEY idx_pedido (id_pedido),
    KEY idx_referencia (referencia),
    CONSTRAINT tbl_pagos_ibfk_1 FOREIGN KEY (id_pedido)
        REFERENCES tbl_pedidos (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
