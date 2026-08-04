-- =============================================================
-- 2026-08-04 — Carrusel, lanzamientos y video pasan a la base
--
-- PROBLEMA
-- El panel guardaba estas tres secciones en localStorage, de modo que
-- solo existian en el navegador del administrador. Un visitante veia
-- el carrusel con los textos por defecto del codigo y la seccion de
-- noticias completamente vacia. Los archivos si se subian bien al
-- servidor, pero la configuracion que los referenciaba no salia de
-- ese navegador.
--
-- SOLUCION
-- Tres tablas para que el contenido sea del sitio y no del navegador.
-- Los comentarios ya vivian en tbl_comentarios_noticias, asi que no
-- se tocan.
-- =============================================================

CREATE TABLE IF NOT EXISTS tbl_carrusel (
  id         INT(11)      NOT NULL AUTO_INCREMENT,
  orden      INT(3)       NOT NULL DEFAULT 0,
  label      VARCHAR(120) DEFAULT NULL,
  titulo     VARCHAR(200) DEFAULT NULL,
  subtitulo  VARCHAR(300) DEFAULT NULL,
  btn1       VARCHAR(80)  DEFAULT NULL,
  btn2       VARCHAR(80)  DEFAULT NULL,
  imagen     TEXT         DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS tbl_lanzamientos (
  id          INT(11)      NOT NULL AUTO_INCREMENT,
  orden       INT(3)       NOT NULL DEFAULT 0,
  nombre      VARCHAR(200) DEFAULT NULL,
  descripcion VARCHAR(500) DEFAULT NULL,
  badge       VARCHAR(60)  DEFAULT NULL,
  imagen      TEXT         DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Una sola fila: el video destacado de la seccion de noticias.
CREATE TABLE IF NOT EXISTS tbl_video_noticias (
  id             INT(11)      NOT NULL AUTO_INCREMENT,
  url            TEXT         DEFAULT NULL,
  titulo         VARCHAR(200) DEFAULT NULL,
  descripcion    VARCHAR(500) DEFAULT NULL,
  nombre_archivo VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Fila inicial vacia para que el endpoint siempre tenga algo que leer.
INSERT INTO tbl_video_noticias (id, url, titulo, descripcion, nombre_archivo)
SELECT 1, '', '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM tbl_video_noticias WHERE id = 1);

-- Slides por defecto, los mismos que traia el codigo, para que el
-- carrusel no aparezca vacio tras la migracion.
INSERT INTO tbl_carrusel (orden, label, titulo, subtitulo, btn1, btn2, imagen)
SELECT * FROM (
  SELECT 1, 'Perfumería Nicho',   'Tesoros\nOlfativos',  'Las más exclusivas casas de nicho en un solo lugar', 'Descubrir Nicho',     'Ver Catálogo',    '' UNION ALL
  SELECT 2, 'Colección Oriental', 'Aromas\ndel Oriente', 'Oud, Ambar, Sándalo y Musk en su máxima expresión',  'Explorar Colección',  'Ver Novedades',   '' UNION ALL
  SELECT 3, 'Alta Perfumería',    'Firmas\nde Autor',    'Chanel, Dior, Tom Ford, Creed y las grandes maisons','Ver Diseñadores',    'Nuestras Marcas', ''
) AS base
WHERE NOT EXISTS (SELECT 1 FROM tbl_carrusel);
