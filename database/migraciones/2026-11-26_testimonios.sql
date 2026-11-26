-- =============================================================
-- Testimonios de clientes, separados de los comentarios
--
-- La portada pedia los testimonios a noticias.php, de modo que lo
-- que un cliente escribia sobre la tienda acababa en la misma tabla
-- que los comentarios de las entradas de noticias. Eran la misma
-- cosa con dos nombres: moderarlos juntos mezclaba "que buena
-- descripcion del perfume" con la opinion de alguien que compro, y
-- cualquier comentario aprobado en una noticia aparecia en la
-- portada como testimonio.
--
-- Los comentarios que ya existen se quedan donde estan. Son de las
-- noticias, y moverlos a testimonios seria inventarse que lo eran.
--
-- CUIDADO AL APLICARLA
-- En local corre MariaDB y en Hostinger MySQL 8, que es mas
-- estricto. Aqui solo se crea una tabla, que ambos aceptan igual.
-- =============================================================

CREATE TABLE IF NOT EXISTS tbl_testimonios (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT          NULL DEFAULT NULL,
    nombre     VARCHAR(120) NOT NULL,
    texto      VARCHAR(500) NOT NULL,
    estrellas  TINYINT      NOT NULL DEFAULT 5,
    estado     ENUM('pendiente','aprobado','rechazado') NOT NULL DEFAULT 'pendiente',
    fecha      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_testimonio_estado (estado),
    KEY idx_testimonio_cliente (id_cliente),
    -- Si se borra la cuenta, el testimonio se queda sin autor pero no
    -- desaparece de la portada sin avisar.
    CONSTRAINT fk_testimonio_cliente FOREIGN KEY (id_cliente)
        REFERENCES tbl_clientes (id_cliente) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
