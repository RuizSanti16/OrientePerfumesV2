<?php
// Configuracion.php
// Datos de conexión a la base de datos MySQL

$host      = "localhost";
$usuario   = "root";
$password  = "";            // En XAMPP local la contraseña está vacía
$baseDatos = "orientperfums";

// Cadena de conexión PDO (con la variable correcta $baseDatos)
$conexionBD = "mysql:host=$host;dbname=$baseDatos;charset=utf8";
?>