<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../configuracion/cors.php';
require_once '../configuracion/Conexion.php';

/* Tienda cerrada al publico: responde 503 a quien no traiga sesion
   de administrador. La comprobacion va aqui, en el servidor, porque
   un aviso puesto solo en React no impediria pedir los datos
   directamente a este endpoint. */
require_once __DIR__ . "/../configuracion/mantenimiento.php";
bloquearSiMantenimiento($pdo);

require_once '../configuracion/auth.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET' && $method !== 'OPTIONS') {
    verificarTokenAdmin($pdo);
}

try {
    switch ($method) {
        case 'GET':
            $s = $pdo->query("SELECT * FROM tbl_marcas ORDER BY nombre ASC");
            echo json_encode(['ok' => true, 'data' => $s->fetchAll()]);
            break;
        case 'POST':
            $b = json_decode(file_get_contents('php://input'), true);
            if (empty($b['nombre'])) { echo json_encode(['ok'=>false,'mensaje'=>'Nombre requerido']); break; }
            $s = $pdo->prepare("INSERT INTO tbl_marcas (nombre, logo, descripcion, pais_origen) VALUES (:n,:l,:d,:p)");
            $s->execute([
                ':n'=>$b['nombre'],
                ':l'=>($b['logo'] ?? '') !== '' ? $b['logo'] : null,
                ':d'=>$b['descripcion']??'',
                ':p'=>$b['pais_origen']??'',
            ]);
            echo json_encode(['ok'=>true,'id'=>$pdo->lastInsertId(),'mensaje'=>'Marca creada']);
            break;

        case 'PUT':
            $b = json_decode(file_get_contents('php://input'), true);
            if (empty($b['id_marca'])) { echo json_encode(['ok'=>false,'mensaje'=>'ID requerido']); break; }

            /* Solo se tocan los campos que vienen en la peticion.

               Antes se escribian los cuatro siempre, con ?? '' de
               respaldo: mandar unicamente el logo, como hace la
               pantalla de logos, habria dejado la marca sin nombre ni
               pais. */
            $campos = [];
            $datos  = [':id' => $b['id_marca']];

            foreach (['nombre' => 'n', 'descripcion' => 'd', 'pais_origen' => 'p'] as $col => $ph) {
                if (array_key_exists($col, $b)) {
                    $campos[] = "$col = :$ph";
                    $datos[":$ph"] = $b[$col];
                }
            }
            /* El logo admite vaciarse a proposito, asi que una cadena
               vacia se guarda como NULL en vez de ignorarse. */
            if (array_key_exists('logo', $b)) {
                $campos[] = 'logo = :l';
                $datos[':l'] = trim((string) $b['logo']) !== '' ? trim($b['logo']) : null;
            }

            if (!$campos) { echo json_encode(['ok'=>false,'mensaje'=>'Nada que actualizar']); break; }

            $s = $pdo->prepare("UPDATE tbl_marcas SET " . implode(', ', $campos) . " WHERE id_marca = :id");
            $s->execute($datos);
            echo json_encode(['ok'=>true,'mensaje'=>'Marca actualizada']);
            break;
        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) { echo json_encode(['ok'=>false,'mensaje'=>'ID requerido']); break; }
            $pdo->prepare("DELETE FROM tbl_marcas WHERE id_marca=:id")->execute([':id'=>$id]);
            echo json_encode(['ok'=>true,'mensaje'=>'Marca eliminada']);
            break;
        default:
            http_response_code(405);
            echo json_encode(['ok'=>false,'mensaje'=>'Método no permitido']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    responderErrorServidor($e, basename(__FILE__));
}
require_once '../configuracion/CerrarConexion.php';
?>