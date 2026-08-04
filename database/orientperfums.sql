-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: orientperfums
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `tbl_administrador`
--

DROP TABLE IF EXISTS `tbl_administrador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_administrador` (
  `id_administrador` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) DEFAULT NULL,
  `usuario` varchar(200) DEFAULT NULL,
  `contrasena` varchar(255) DEFAULT NULL,
  `telefono` int(15) NOT NULL,
  `correo` varchar(120) DEFAULT NULL,
  `token` varchar(64) DEFAULT NULL,
  `token_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`id_administrador`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_administrador`
--

LOCK TABLES `tbl_administrador` WRITE;
/*!40000 ALTER TABLE `tbl_administrador` DISABLE KEYS */;
INSERT INTO `tbl_administrador` VALUES (7,'Administrador','admin','$2y$10$l720pilBC/u5evqn35vQYeQ0wrK47tPoGRxhluYTV3TupIp02KcW.',0,'admin@orientperfumes.com','cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc','2026-08-04 16:25:26');
/*!40000 ALTER TABLE `tbl_administrador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_carrusel`
--

DROP TABLE IF EXISTS `tbl_carrusel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_carrusel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orden` int(3) NOT NULL DEFAULT 0,
  `label` varchar(120) DEFAULT NULL,
  `titulo` varchar(200) DEFAULT NULL,
  `subtitulo` varchar(300) DEFAULT NULL,
  `btn1` varchar(80) DEFAULT NULL,
  `btn2` varchar(80) DEFAULT NULL,
  `imagen` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_carrusel`
--

LOCK TABLES `tbl_carrusel` WRITE;
/*!40000 ALTER TABLE `tbl_carrusel` DISABLE KEYS */;
INSERT INTO `tbl_carrusel` VALUES (6,1,'Perfumería Nicho','Tesoros\nOlfativos','Las más exclusivas casas de nicho en un solo lugar','Descubrir Nicho','Ver Catálogo',''),(7,2,'Colección Oriental','Aromas\ndel Oriente','Oud, Ambar, Sándalo y Musk en su máxima expresión','Explorar Colección','Ver Novedades',''),(8,3,'Alta Perfumería','Firmas\nde Autor','Chanel, Dior, Tom Ford, Creed y las grandes maisons','Ver Diseñadores','Nuestras Marcas','');
/*!40000 ALTER TABLE `tbl_carrusel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_categorias`
--

DROP TABLE IF EXISTS `tbl_categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_categorias` (
  `id_categoria` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_categorias`
--

LOCK TABLES `tbl_categorias` WRITE;
/*!40000 ALTER TABLE `tbl_categorias` DISABLE KEYS */;
INSERT INTO `tbl_categorias` VALUES (7,'Nicho','Perfumería de autor y casas independientes exclusivas'),(8,'Oriental','Fragancias con notas de oud, ámbar, sándalo y musk'),(9,'Diseñador','Grandes maisons y firmas de moda internacionales'),(10,'Exclusivos','Ediciones limitadas y fragancias de colección');
/*!40000 ALTER TABLE `tbl_categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_clientes`
--

DROP TABLE IF EXISTS `tbl_clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_clientes` (
  `id_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) DEFAULT NULL,
  `correo` varchar(120) DEFAULT NULL,
  `genero` varchar(40) DEFAULT NULL,
  `edad` int(3) DEFAULT NULL,
  `usuario` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_clientes`
--

LOCK TABLES `tbl_clientes` WRITE;
/*!40000 ALTER TABLE `tbl_clientes` DISABLE KEYS */;
INSERT INTO `tbl_clientes` VALUES (5,'santi1','ruiz.santiago1622@gmail.com',NULL,0,'santi1','$2y$10$0KwdaZx1iT3qLuSRn0jDAeigEQ5M2slD4UNqQxlHkClGXHx78F9DK','+573136633209'),(6,'Santiago16','ruiz.santiago12@gmail.com',NULL,0,'Santiago16','$2y$10$QbL33uObzlryYUpbi5UbveknLuCiiZYWeIjEcNpiGUeBNdP6wJttG','3136655555'),(9,'Luis Perez','luis@correo.com','M',NULL,'luisp',NULL,'3009876543');
/*!40000 ALTER TABLE `tbl_clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_comentarios_noticias`
--

DROP TABLE IF EXISTS `tbl_comentarios_noticias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_comentarios_noticias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `texto` text NOT NULL,
  `estado` enum('pendiente','aprobado','rechazado') NOT NULL DEFAULT 'pendiente',
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `id_cliente` int(11) DEFAULT NULL,
  `estrellas` tinyint(4) NOT NULL DEFAULT 5,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_comentarios_noticias`
--

LOCK TABLES `tbl_comentarios_noticias` WRITE;
/*!40000 ALTER TABLE `tbl_comentarios_noticias` DISABLE KEYS */;
INSERT INTO `tbl_comentarios_noticias` VALUES (1,'Santiago','Que buena descripcion del perfume!!!!','aprobado','2026-05-18 18:02:17',NULL,5),(2,'santiago','hola','aprobado','2026-05-19 18:32:25',NULL,5),(3,'Santiago','Hola','aprobado','2026-06-26 17:21:40',NULL,5);
/*!40000 ALTER TABLE `tbl_comentarios_noticias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_compras`
--

DROP TABLE IF EXISTS `tbl_compras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_compras` (
  `id_compra` int(11) NOT NULL,
  `fecha` date DEFAULT NULL,
  `total` int(20) NOT NULL,
  `id_proovedor` int(11) NOT NULL,
  PRIMARY KEY (`id_compra`),
  KEY `id_proovedor` (`id_proovedor`),
  CONSTRAINT `tbl_compras_ibfk_1` FOREIGN KEY (`id_proovedor`) REFERENCES `tbl_proovedores` (`id_proovedor`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_compras`
--

LOCK TABLES `tbl_compras` WRITE;
/*!40000 ALTER TABLE `tbl_compras` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_compras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_cupones`
--

DROP TABLE IF EXISTS `tbl_cupones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_cupones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `tipo` enum('porcentaje','fijo') NOT NULL DEFAULT 'porcentaje',
  `valor` decimal(10,2) NOT NULL DEFAULT 0.00,
  `min_compra` decimal(10,2) DEFAULT 0.00,
  `usos_max` int(11) DEFAULT NULL,
  `usos_actuales` int(11) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_vencimiento` date DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT '',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_cupones`
--

LOCK TABLES `tbl_cupones` WRITE;
/*!40000 ALTER TABLE `tbl_cupones` DISABLE KEYS */;
INSERT INTO `tbl_cupones` VALUES (2,'DESCUENTO10','fijo',40000.00,0.00,NULL,0,0,'2026-05-21','','2026-05-21 23:38:21');
/*!40000 ALTER TABLE `tbl_cupones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_destacados`
--

DROP TABLE IF EXISTS `tbl_destacados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_destacados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_producto` int(11) NOT NULL,
  `orden` int(11) DEFAULT 0,
  `badge` varchar(20) DEFAULT 'none',
  `precio_oferta` bigint(20) DEFAULT NULL,
  `precio_anterior` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `tbl_destacados_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `tbl_productos` (`id_producto`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_destacados`
--

LOCK TABLES `tbl_destacados` WRITE;
/*!40000 ALTER TABLE `tbl_destacados` DISABLE KEYS */;
INSERT INTO `tbl_destacados` VALUES (34,10,0,'new',NULL,NULL),(35,12,1,'sale',290000,350000),(36,14,2,'excl',NULL,NULL);
/*!40000 ALTER TABLE `tbl_destacados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_detalle_compra`
--

DROP TABLE IF EXISTS `tbl_detalle_compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_detalle_compra` (
  `id_detalle_compra` int(11) NOT NULL,
  `cantidad` int(100) NOT NULL,
  `costo` int(20) NOT NULL,
  `id_producto` int(10) NOT NULL,
  `id_compra` int(11) NOT NULL,
  PRIMARY KEY (`id_detalle_compra`),
  KEY `id_producto` (`id_producto`),
  KEY `id_compra` (`id_compra`),
  CONSTRAINT `tbl_detalle_compra_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `tbl_productos` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tbl_detalle_compra_ibfk_2` FOREIGN KEY (`id_compra`) REFERENCES `tbl_compras` (`id_compra`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_detalle_compra`
--

LOCK TABLES `tbl_detalle_compra` WRITE;
/*!40000 ALTER TABLE `tbl_detalle_compra` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_detalle_compra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_detalle_venta`
--

DROP TABLE IF EXISTS `tbl_detalle_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_detalle_venta` (
  `id_detalle_venta` int(11) NOT NULL,
  `cantidad` int(100) NOT NULL,
  `precio` int(10) NOT NULL,
  `id_producto` int(10) NOT NULL,
  `id_venta` int(11) NOT NULL,
  PRIMARY KEY (`id_detalle_venta`),
  KEY `id_producto` (`id_producto`),
  KEY `id_venta` (`id_venta`),
  CONSTRAINT `tbl_detalle_venta_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `tbl_ventas` (`id_venta`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tbl_detalle_venta_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `tbl_productos` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_detalle_venta`
--

LOCK TABLES `tbl_detalle_venta` WRITE;
/*!40000 ALTER TABLE `tbl_detalle_venta` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_detalle_venta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_inventario`
--

DROP TABLE IF EXISTS `tbl_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_inventario` (
  `id_inventario` int(11) NOT NULL AUTO_INCREMENT,
  `stock` int(100) NOT NULL,
  `ubicacion` varchar(80) DEFAULT NULL,
  `id_producto` int(11) NOT NULL,
  PRIMARY KEY (`id_inventario`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `tbl_inventario_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `tbl_productos` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_inventario`
--

LOCK TABLES `tbl_inventario` WRITE;
/*!40000 ALTER TABLE `tbl_inventario` DISABLE KEYS */;
INSERT INTO `tbl_inventario` VALUES (1,2,'',14),(2,1,'Bodega 1 ',15);
/*!40000 ALTER TABLE `tbl_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_lanzamientos`
--

DROP TABLE IF EXISTS `tbl_lanzamientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_lanzamientos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orden` int(3) NOT NULL DEFAULT 0,
  `nombre` varchar(200) DEFAULT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `badge` varchar(60) DEFAULT NULL,
  `imagen` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_lanzamientos`
--

LOCK TABLES `tbl_lanzamientos` WRITE;
/*!40000 ALTER TABLE `tbl_lanzamientos` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_lanzamientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_marcas`
--

DROP TABLE IF EXISTS `tbl_marcas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_marcas` (
  `id_marca` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `pais_origen` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_marca`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_marcas`
--

LOCK TABLES `tbl_marcas` WRITE;
/*!40000 ALTER TABLE `tbl_marcas` DISABLE KEYS */;
INSERT INTO `tbl_marcas` VALUES (2,'Tom Ford','Lujo americano contemporáneo','EE.UU.'),(3,'Creed','Casa de perfumería desde 1760','Reino Unido'),(4,'Xerjoff','Perfumería nicho italiana','Italia'),(9,'Matai','Perfumeria Colombiana ','Colombia '),(10,'Armaf','Perfumeria oriental','Emiratos arabes unidos '),(11,'Lataffa','Perfumeria arebe ','Emiratos'),(12,'Orto Parisi','',''),(13,'Lorenzo Pazzaglia','Creaciones desde la cicina hasta  la perfumeria ','Italiano'),(14,'French Avenue','','');
/*!40000 ALTER TABLE `tbl_marcas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_pedido_items`
--

DROP TABLE IF EXISTS `tbl_pedido_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_pedido_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_pedido` int(11) NOT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `nombre_producto` varchar(200) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `precio_unitario` decimal(12,2) NOT NULL DEFAULT 0.00,
  `presentacion` varchar(80) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_pedido` (`id_pedido`),
  CONSTRAINT `tbl_pedido_items_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `tbl_pedidos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_pedido_items`
--

LOCK TABLES `tbl_pedido_items` WRITE;
/*!40000 ALTER TABLE `tbl_pedido_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_pedido_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_pedidos`
--

DROP TABLE IF EXISTS `tbl_pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_pedidos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_seguimiento` varchar(12) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `correo` varchar(120) NOT NULL,
  `telefono` varchar(30) DEFAULT '',
  `direccion` text NOT NULL,
  `ciudad` varchar(80) DEFAULT '',
  `notas` text DEFAULT NULL,
  `estado` enum('pendiente','preparacion','enviado','entregado','cancelado') NOT NULL DEFAULT 'pendiente',
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `descuento` decimal(12,2) NOT NULL DEFAULT 0.00,
  `cupon` varchar(30) DEFAULT NULL,
  `metodo_pago` varchar(40) DEFAULT 'contraentrega',
  `fecha_pedido` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_seguimiento` (`codigo_seguimiento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_pedidos`
--

LOCK TABLES `tbl_pedidos` WRITE;
/*!40000 ALTER TABLE `tbl_pedidos` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_producto_dupes`
--

DROP TABLE IF EXISTS `tbl_producto_dupes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_producto_dupes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_producto` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `imagen` text DEFAULT NULL,
  `id_referencia` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `tbl_producto_dupes_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `tbl_productos` (`id_producto`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_producto_dupes`
--

LOCK TABLES `tbl_producto_dupes` WRITE;
/*!40000 ALTER TABLE `tbl_producto_dupes` DISABLE KEYS */;
INSERT INTO `tbl_producto_dupes` VALUES (2,12,'Megamare','','',13);
/*!40000 ALTER TABLE `tbl_producto_dupes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_producto_imagenes`
--

DROP TABLE IF EXISTS `tbl_producto_imagenes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_producto_imagenes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_producto` int(11) NOT NULL,
  `imagen` text NOT NULL,
  `orden` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `tbl_producto_imagenes_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `tbl_productos` (`id_producto`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_producto_imagenes`
--

LOCK TABLES `tbl_producto_imagenes` WRITE;
/*!40000 ALTER TABLE `tbl_producto_imagenes` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_producto_imagenes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_producto_notas`
--

DROP TABLE IF EXISTS `tbl_producto_notas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_producto_notas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_producto` int(11) NOT NULL,
  `tipo` enum('salida','corazon','fondo') NOT NULL,
  `nota` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `tbl_producto_notas_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `tbl_productos` (`id_producto`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=190 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_producto_notas`
--

LOCK TABLES `tbl_producto_notas` WRITE;
/*!40000 ALTER TABLE `tbl_producto_notas` DISABLE KEYS */;
INSERT INTO `tbl_producto_notas` VALUES (7,11,'salida','bergamora'),(8,11,'corazon','bergamota'),(9,11,'fondo','bergamota'),(181,14,'salida','Guayaba'),(182,14,'salida','Maracuyá'),(183,14,'salida','Anis'),(184,14,'corazon','Tabaco dulce'),(185,14,'corazon','Haba tonka'),(186,14,'corazon','Rosa damascena'),(187,14,'fondo','Cedro'),(188,14,'fondo','Sándalo'),(189,14,'fondo','Pachulí');
/*!40000 ALTER TABLE `tbl_producto_notas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_producto_ratings`
--

DROP TABLE IF EXISTS `tbl_producto_ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_producto_ratings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_producto` int(11) NOT NULL,
  `nombre_usuario` varchar(80) NOT NULL,
  `estrellas` tinyint(4) NOT NULL CHECK (`estrellas` between 1 and 5),
  `comentario` text DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `tbl_producto_ratings_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `tbl_productos` (`id_producto`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_producto_ratings`
--

LOCK TABLES `tbl_producto_ratings` WRITE;
/*!40000 ALTER TABLE `tbl_producto_ratings` DISABLE KEYS */;
INSERT INTO `tbl_producto_ratings` VALUES (1,12,'Santiago',5,'EL mejor dupe de megamare','2026-05-03 18:24:30'),(2,10,'santi',5,'melo','2026-05-05 17:11:31');
/*!40000 ALTER TABLE `tbl_producto_ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_productos`
--

DROP TABLE IF EXISTS `tbl_productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_productos` (
  `id_producto` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) DEFAULT NULL,
  `marca` varchar(120) DEFAULT NULL,
  `precio` bigint(20) DEFAULT 0,
  `id_inventario` int(10) DEFAULT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `imagen` longtext DEFAULT NULL,
  `presentaciones` text DEFAULT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `id_inventario` (`id_inventario`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_productos`
--

LOCK TABLES `tbl_productos` WRITE;
/*!40000 ALTER TABLE `tbl_productos` DISABLE KEYS */;
INSERT INTO `tbl_productos` VALUES (10,'Odyssay Artisto','Armaf',250000,0,8,'','','[{\"etiqueta\":\"100ml\",\"precio\":\"250000\"},{\"etiqueta\":\"10ml\",\"precio\":\"50000\"},{\"etiqueta\":\"5ml\",\"precio\":\"25000\"}]'),(11,'Odyssay Aqua ','Armaf',280000,0,8,'nuevo de ody','','[{\"etiqueta\":\"100ml\",\"precio\":\"280000\"},{\"etiqueta\":\"10ml\",\"precio\":\"50000\"},{\"etiqueta\":\"5ml\",\"precio\":\"25000\"}]'),(12,'Atlas ','Lataffa',350000,0,8,'Dupe de megamare de  ortoparisi','','[{\"etiqueta\":\"100ml\",\"precio\":\"350000\"},{\"etiqueta\":\"10ml\",\"precio\":\"70000\"},{\"etiqueta\":\"5ml\",\"precio\":\"40000\"}]'),(13,'Megamare ','Orto Parisi',700000,0,7,'','','[{\"etiqueta\":\"100ml\",\"precio\":\"700000\"},{\"etiqueta\":\"10ml\",\"precio\":\"110000\"},{\"etiqueta\":\"5ml\",\"precio\":\"80000\"}]'),(14,'¡Que chimba!','Lorenzo Pazzaglia',870000,0,9,'Que Chimba! de Lorenzo Pazzaglia es una fragancia de la familia olfativa Oriental Floral para Hombres y Mujeres. Esta fragrancia es nueva. Que Chimba! se lanzó en 2025. La Nariz detrás de esta fragrancia es Lorenzo Pazzaglia. Las Notas de Salida son guayaba, anís estrellado, clavos de olor, maracuyá (fruta de la pasión), durazno (melocotón), jengibre y canela; las Notas de Corazón son haba tonka, tabaco, heliotropo, rosa de Damasco y orquídea; las Notas de Fondo son cedro, sándalo, pachulí, vain','/OrientPerfumesV2/backend/uploads/img_6a6d86a1579a76.80319632.jpg','[{\"etiqueta\":\"50ml\",\"precio\":\"870000\"},{\"etiqueta\":\"10ml\",\"precio\":\"190000\"},{\"etiqueta\":\"5ml\",\"precio\":\"100000\"}]'),(15,'Vulcan Feu','French Avenue',280000,0,8,'','/OrientPerfumesV2/backend/uploads/img_6a6d823b1ab115.70727112.jpg','[{\"etiqueta\":\"100ml\",\"precio\":\"280000\"},{\"etiqueta\":\"10ml\",\"precio\":\"55000\"},{\"etiqueta\":\"5ml\",\"precio\":\"30000\"}]');
/*!40000 ALTER TABLE `tbl_productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_proovedores`
--

DROP TABLE IF EXISTS `tbl_proovedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_proovedores` (
  `id_proovedor` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) DEFAULT NULL,
  `contacto` varchar(60) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(120) DEFAULT NULL,
  PRIMARY KEY (`id_proovedor`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_proovedores`
--

LOCK TABLES `tbl_proovedores` WRITE;
/*!40000 ALTER TABLE `tbl_proovedores` DISABLE KEYS */;
INSERT INTO `tbl_proovedores` VALUES (1,'Fragancia1','Fragancia1',NULL,'fragancia1@gmail.com');
/*!40000 ALTER TABLE `tbl_proovedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_ventas`
--

DROP TABLE IF EXISTS `tbl_ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_ventas` (
  `id_venta` int(11) NOT NULL,
  `fecha` date DEFAULT NULL,
  `total` int(30) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  PRIMARY KEY (`id_venta`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `tbl_ventas_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `tbl_clientes` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_ventas`
--

LOCK TABLES `tbl_ventas` WRITE;
/*!40000 ALTER TABLE `tbl_ventas` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_ventas_clientes`
--

DROP TABLE IF EXISTS `tbl_ventas_clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_ventas_clientes` (
  `id_venta_cliente` int(11) NOT NULL,
  `fecha` date DEFAULT NULL,
  `total` int(15) NOT NULL,
  `id_venta` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  PRIMARY KEY (`id_venta_cliente`),
  KEY `id_venta` (`id_venta`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `tbl_ventas_clientes_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `tbl_clientes` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tbl_ventas_clientes_ibfk_2` FOREIGN KEY (`id_venta`) REFERENCES `tbl_ventas` (`id_venta`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_ventas_clientes`
--

LOCK TABLES `tbl_ventas_clientes` WRITE;
/*!40000 ALTER TABLE `tbl_ventas_clientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_ventas_clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_video_noticias`
--

DROP TABLE IF EXISTS `tbl_video_noticias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_video_noticias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `url` text DEFAULT NULL,
  `titulo` varchar(200) DEFAULT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `nombre_archivo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_video_noticias`
--

LOCK TABLES `tbl_video_noticias` WRITE;
/*!40000 ALTER TABLE `tbl_video_noticias` DISABLE KEYS */;
INSERT INTO `tbl_video_noticias` VALUES (1,'','','','');
/*!40000 ALTER TABLE `tbl_video_noticias` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-04 14:25:42
