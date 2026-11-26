-- =============================================================
-- Color del texto de cada slide del carrusel
--
-- El titulo iba siempre en dorado y el subtitulo en crema, fijos en
-- el CSS. Segun la foto de fondo eso se lee bien o no se lee, y el
-- administrador no tenia forma de ajustarlo sin tocar codigo.
--
-- Va por slide y no uno general porque cada slide lleva su propia
-- imagen: lo que se lee sobre una foto oscura se pierde sobre una
-- clara.
--
-- NULL significa "el de siempre", asi que los slides que ya existen
-- siguen viendose igual sin tocarlos.
--
-- CUIDADO AL APLICARLA
-- En local corre MariaDB y en Hostinger MySQL 8, que es mas
-- estricto. Aqui solo se anaden columnas, que ambos aceptan igual.
-- =============================================================

ALTER TABLE tbl_carrusel
    ADD COLUMN color_titulo   VARCHAR(20) NULL DEFAULT NULL,
    ADD COLUMN color_subtitulo VARCHAR(20) NULL DEFAULT NULL;
