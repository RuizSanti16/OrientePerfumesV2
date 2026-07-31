<?php
/* =============================================================
   api/subir_imagen.php — Subida de imágenes al servidor
   Acepta cualquier formato de imagen.
   Devuelve: { ok: true, url: "/OrientPerfumesV2/backend/uploads/..." }
============================================================= */
header('Content-Type: application/json');
require_once __DIR__ . '/../configuracion/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'mensaje' => 'Solo se acepta POST']);
    exit;
}

/* Verificar autenticación de admin */
require_once '../configuracion/Conexion.php';
require_once '../configuracion/auth.php';
verificarTokenAdmin($pdo);
require_once '../configuracion/CerrarConexion.php';

/* Directorio donde se guardan las imágenes */
$uploadDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR;
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

/* Verificar que se envió el archivo */
if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] === UPLOAD_ERR_NO_FILE) {
    echo json_encode(['ok' => false, 'mensaje' => 'No se recibió ningún archivo']);
    exit;
}

$file = $_FILES['imagen'];

/* Códigos de error de PHP */
if ($file['error'] !== UPLOAD_ERR_OK) {
    $errores = [
        UPLOAD_ERR_INI_SIZE   => 'El archivo supera el límite configurado en PHP (upload_max_filesize)',
        UPLOAD_ERR_FORM_SIZE  => 'El archivo supera el límite del formulario',
        UPLOAD_ERR_PARTIAL    => 'El archivo se subió de forma incompleta',
        UPLOAD_ERR_NO_TMP_DIR => 'No hay directorio temporal disponible',
        UPLOAD_ERR_CANT_WRITE => 'No se pudo escribir el archivo en disco',
        UPLOAD_ERR_EXTENSION  => 'Una extensión de PHP detuvo la subida',
    ];
    $msg = $errores[$file['error']] ?? ('Error al subir archivo (código ' . $file['error'] . ')');
    echo json_encode(['ok' => false, 'mensaje' => $msg]);
    exit;
}

/* Validar que sea realmente una imagen (por contenido, no solo extensión) */
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime  = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$mimePermitidos = [
    'image/jpeg', 'image/jpg', 'image/png',  'image/webp',
    'image/gif',  'image/avif', 'image/bmp', 'image/svg+xml',
    'image/tiff', 'image/x-icon',
];

if (!in_array($mime, $mimePermitidos, true)) {
    echo json_encode(['ok' => false, 'mensaje' => 'Formato no permitido. Sube una imagen (JPG, PNG, WEBP, GIF, etc.)']);
    exit;
}

/* Extensión según MIME */
$extensiones = [
    'image/jpeg'    => 'jpg',  'image/jpg'     => 'jpg',
    'image/png'     => 'png',  'image/webp'    => 'webp',
    'image/gif'     => 'gif',  'image/avif'    => 'avif',
    'image/bmp'     => 'bmp',  'image/svg+xml' => 'svg',
    'image/tiff'    => 'tiff', 'image/x-icon'  => 'ico',
];
$ext      = $extensiones[$mime] ?? 'jpg';
$filename = uniqid('img_', true) . '.' . $ext;
$destino  = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $destino)) {
    echo json_encode(['ok' => false, 'mensaje' => 'No se pudo guardar el archivo. Verifica permisos del servidor.']);
    exit;
}

/* URL pública de la imagen */
/* La ruta publica depende de donde este montado el backend: en XAMPP
   cuelga de /OrientPerfumesV2/, pero en un contenedor o subdominio la
   raiz es otra. Se configura con UPLOADS_BASE_URL. */
$baseUploads = getenv('UPLOADS_BASE_URL') ?: '/OrientPerfumesV2/backend/uploads';
$url = rtrim($baseUploads, '/') . '/' . $filename;
echo json_encode(['ok' => true, 'url' => $url]);
