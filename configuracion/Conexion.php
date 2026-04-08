<?php
// Conexion.php
// Abre la conexión PDO a MySQL usando los datos de Configuracion.php

require_once "Configuracion.php";

try {
    $pdo = new PDO($conexionBD, $usuario, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE,        PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // Devolver error en JSON para que el JS lo pueda leer
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "error" => true,
        "mensaje" => "Error de conexión: " . $e->getMessage()
    ]);
    exit;
}
?>