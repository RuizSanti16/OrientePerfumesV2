<?php
/* =============================================================
   api/notas_catalogo.php — la lista de notas que sugiere el panel.

   GET    (publico) todas, agrupadas por familia.
   POST   (admin)   crea una nota.
   DELETE (admin)   la quita de la lista.

   OJO CON LO QUE SIGNIFICA BORRAR
   Esta tabla es solo el catalogo de sugerencias. Las notas de cada
   perfume viven en tbl_producto_notas, guardadas como texto, asi que
   quitar una de aqui no la borra de ningun perfume: deja de
   ofrecerse al escribir, nada mas. Es a proposito, porque lo
   contrario seria que una limpieza de la lista vaciara fichas de
   productos sin avisar.

   LA LISTA SE SIEMBRA SOLA
   La primera vez que se consulta, si la tabla esta vacia, se cargan
   las notas de partida. Asi el panel nunca sale en blanco y no hace
   falta un paso de importacion aparte.
============================================================= */

header('Content-Type: application/json');
require_once __DIR__ . '/../configuracion/cors.php';
require_once __DIR__ . '/../configuracion/Conexion.php';
require_once __DIR__ . '/../configuracion/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    verificarTokenAdmin($pdo);
}

/* Familias fijas: son las categorias olfativas de siempre, no algo
   que cambie con el catalogo. El color se usa en el panel. */
function familiasOlfativas() {
    return [
        'Cítricos'              => '#D9C05A',
        'Florales'              => '#D98FA8',
        'Frutales'              => '#D98A5A',
        'Especias'              => '#C4664C',
        'Maderas'               => '#A8865A',
        'Orientales y Resinas'  => '#C9A84C',
        'Dulces y Gourmand'     => '#B5835A',
        'Almizcles y Animales'  => '#9A9180',
        'Verdes y Aromáticas'   => '#8BA87A',
        'Marinas y Frescas'     => '#7AA2B5',
        'Otras'                 => '#6B6355',
    ];
}

function notasDePartida() {
    return [
        'Cítricos' => ['Bergamota','Limón','Lima','Naranja','Mandarina','Pomelo','Neroli','Petitgrain','Yuzu','Cidra','Kumquat','Naranja Sanguina'],
        'Florales' => ['Rosa','Rosa Damascena','Jazmín','Jazmín Sambac','Azahar','Flor de Naranjo','Ylang-Ylang','Lavanda','Violeta','Iris','Lirio','Magnolia','Peonía','Gardenia','Tuberosa','Narciso','Mimosa','Freesia','Geranio','Osmanthus','Flor de Loto'],
        'Frutales' => ['Manzana','Pera','Melocotón','Albaricoque','Ciruela','Cereza','Frambuesa','Fresa','Mora','Grosella Negra','Piña','Mango','Coco','Higo','Melón','Lichi','Uva','Dátil'],
        'Especias' => ['Pimienta Negra','Pimienta Rosa','Cardamomo','Canela','Clavo','Nuez Moscada','Jengibre','Azafrán','Comino','Anís','Cilantro','Cúrcuma','Pimentón'],
        'Maderas' => ['Sándalo','Cedro','Oud','Agarwood','Vetiver','Pachulí','Palo Santo','Guayaco','Abedul','Roble','Bambú','Papiro','Madera de Cachemira','Notas Amaderadas'],
        'Orientales y Resinas' => ['Ámbar','Ámbar Gris','Incienso','Mirra','Benjuí','Olíbano','Labdanum','Opoponaco','Elemi','Estoraque'],
        'Dulces y Gourmand' => ['Vainilla','Vainilla Bourbon','Caramelo','Chocolate','Cacao','Café','Miel','Praliné','Almendra','Avellana','Regaliz','Azúcar Moreno','Malvavisco','Ron','Haba Tonka'],
        'Almizcles y Animales' => ['Almizcle','Almizcle Blanco','Civeta','Castóreo','Cuero','Ambroxan','Cashmeran','Iso E Super'],
        'Verdes y Aromáticas' => ['Menta','Albahaca','Romero','Salvia','Tomillo','Hierbabuena','Té Verde','Té Negro','Hojas de Violeta','Hierba Recién Cortada','Galbanum','Eucalipto','Artemisa'],
        'Marinas y Frescas' => ['Notas Marinas','Sal Marina','Algas','Brisa Marina','Ozono','Agua de Lluvia','Notas Acuáticas','Calone'],
    ];
}

try {
    /* La tabla se crea sola: es una lista de apoyo, no datos del
       negocio, y no merece un paso de migracion aparte. */
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS tbl_notas_catalogo (
            id      INT AUTO_INCREMENT PRIMARY KEY,
            nombre  VARCHAR(80) NOT NULL,
            familia VARCHAR(60) NOT NULL DEFAULT 'Otras',
            UNIQUE KEY uq_nota (nombre)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    ");

    if ((int) $pdo->query("SELECT COUNT(*) FROM tbl_notas_catalogo")->fetchColumn() === 0) {
        $ins = $pdo->prepare("INSERT IGNORE INTO tbl_notas_catalogo (nombre, familia) VALUES (:n, :f)");
        foreach (notasDePartida() as $familia => $notas) {
            foreach ($notas as $nota) $ins->execute([':n' => $nota, ':f' => $familia]);
        }
    }

    switch ($_SERVER['REQUEST_METHOD']) {

        case 'GET':
            $filas = $pdo->query("SELECT id, nombre, familia FROM tbl_notas_catalogo ORDER BY familia, nombre")->fetchAll();

            /* Se devuelven agrupadas y en el orden de las familias,
               que es como las va a pintar el panel. */
            $porFamilia = [];
            foreach (familiasOlfativas() as $nombre => $color) {
                $porFamilia[$nombre] = ['familia' => $nombre, 'color' => $color, 'notas' => []];
            }
            foreach ($filas as $f) {
                $fam = isset($porFamilia[$f['familia']]) ? $f['familia'] : 'Otras';
                $porFamilia[$fam]['notas'][] = ['id' => (int) $f['id'], 'nombre' => $f['nombre']];
            }

            echo json_encode([
                'ok'   => true,
                'data' => array_values(array_filter($porFamilia, fn($f) => count($f['notas']) > 0)),
            ]);
            break;

        case 'POST':
            $b       = json_decode(file_get_contents('php://input'), true);
            $nombre  = trim((string) ($b['nombre'] ?? ''));
            $familia = trim((string) ($b['familia'] ?? 'Otras'));

            if ($nombre === '') {
                echo json_encode(['ok' => false, 'mensaje' => 'Escribe el nombre de la nota.']);
                break;
            }
            if (mb_strlen($nombre) > 80) {
                echo json_encode(['ok' => false, 'mensaje' => 'El nombre es demasiado largo.']);
                break;
            }
            if (!array_key_exists($familia, familiasOlfativas())) $familia = 'Otras';

            /* Si ya existe se dice, en vez de dejar dos entradas que
               solo se diferencian en una tilde o una mayuscula. */
            $ya = $pdo->prepare("SELECT nombre FROM tbl_notas_catalogo WHERE LOWER(nombre) = LOWER(:n) LIMIT 1");
            $ya->execute([':n' => $nombre]);
            if ($existente = $ya->fetchColumn()) {
                echo json_encode(['ok' => false, 'mensaje' => "La nota ya existe como “{$existente}”."]);
                break;
            }

            $pdo->prepare("INSERT INTO tbl_notas_catalogo (nombre, familia) VALUES (:n, :f)")
                ->execute([':n' => $nombre, ':f' => $familia]);

            echo json_encode([
                'ok'      => true,
                'mensaje' => 'Nota añadida',
                'data'    => ['id' => (int) $pdo->lastInsertId(), 'nombre' => $nombre, 'familia' => $familia],
            ]);
            break;

        case 'DELETE':
            $id = (int) ($_GET['id'] ?? 0);
            if ($id <= 0) {
                echo json_encode(['ok' => false, 'mensaje' => 'ID requerido']);
                break;
            }

            /* Se avisa de en cuantos perfumes se esta usando. No
               impide borrarla, porque esas fichas no se tocan, pero
               el panel puede decirlo antes de confirmar. */
            $nota = $pdo->prepare("SELECT nombre FROM tbl_notas_catalogo WHERE id = :id");
            $nota->execute([':id' => $id]);
            $nombre = $nota->fetchColumn();

            $usos = 0;
            if ($nombre !== false) {
                $u = $pdo->prepare("SELECT COUNT(DISTINCT id_producto) FROM tbl_producto_notas WHERE LOWER(nota) = LOWER(:n)");
                $u->execute([':n' => $nombre]);
                $usos = (int) $u->fetchColumn();
            }

            $pdo->prepare("DELETE FROM tbl_notas_catalogo WHERE id = :id")->execute([':id' => $id]);

            echo json_encode([
                'ok'      => true,
                'mensaje' => 'Nota quitada de la lista',
                'usos'    => $usos,
            ]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['ok' => false, 'mensaje' => 'Metodo no permitido']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    responderErrorServidor($e, basename(__FILE__));
}

require_once __DIR__ . '/../configuracion/CerrarConexion.php';
