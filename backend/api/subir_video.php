<?php
/* =============================================================
   api/subir_video.php — Subida de videos al servidor
   Acepta: MP4, MOV, WebM, AVI, MKV
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

require_once '../configuracion/Conexion.php';
require_once '../configuracion/auth.php';
verificarTokenAdmin($pdo);
require_once '../configuracion/CerrarConexion.php';

/* Directorio de subida */
$uploadDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR;
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if (!isset($_FILES['video']) || $_FILES['video']['error'] === UPLOAD_ERR_NO_FILE) {
    echo json_encode(['ok' => false, 'mensaje' => 'No se recibió ningún archivo']);
    exit;
}

$file = $_FILES['video'];

/* Códigos de error PHP */
if ($file['error'] !== UPLOAD_ERR_OK) {
    $errores = [
        UPLOAD_ERR_INI_SIZE   => 'El archivo supera el límite de PHP (upload_max_filesize). Aumenta el valor en php.ini.',
        UPLOAD_ERR_FORM_SIZE  => 'El archivo supera el límite del formulario',
        UPLOAD_ERR_PARTIAL    => 'El archivo se subió de forma incompleta',
        UPLOAD_ERR_NO_TMP_DIR => 'No hay directorio temporal disponible',
        UPLOAD_ERR_CANT_WRITE => 'No se pudo escribir el archivo en disco',
        UPLOAD_ERR_EXTENSION  => 'Una extensión de PHP detuvo la subida',
    ];
    $msg = $errores[$file['error']] ?? 'Error al subir archivo (código ' . $file['error'] . ')';
    echo json_encode(['ok' => false, 'mensaje' => $msg]);
    exit;
}

/* Validar MIME real */
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime  = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$mimePermitidos = [
    'video/mp4',
    'video/quicktime',     // .mov
    'video/webm',
    'video/x-msvideo',     // .avi
    'video/x-matroska',    // .mkv
    'video/mpeg',
    'video/ogg',
    'video/3gpp',
    'application/octet-stream', // algunos MOV llegan así
];

$extensiones = [
    'video/mp4'              => 'mp4',
    'video/quicktime'        => 'mov',
    'video/webm'             => 'webm',
    'video/x-msvideo'        => 'avi',
    'video/x-matroska'       => 'mkv',
    'video/mpeg'             => 'mpeg',
    'video/ogg'              => 'ogv',
    'video/3gpp'             => '3gp',
    'application/octet-stream' => 'mp4',
];

/* Fallback: usar extensión del nombre original si MIME es genérico */
if ($mime === 'application/octet-stream') {
    $extOrig = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $extsValidas = ['mp4','mov','webm','avi','mkv','mpeg','ogv','3gp'];
    if (!in_array($extOrig, $extsValidas, true)) {
        echo json_encode(['ok' => false, 'mensaje' => 'Formato no permitido. Usa MP4, MOV, WebM o AVI.']);
        exit;
    }
    $ext = $extOrig;
} elseif (!in_array($mime, $mimePermitidos, true)) {
    echo json_encode(['ok' => false, 'mensaje' => 'Formato no permitido. Usa MP4, MOV, WebM o AVI.']);
    exit;
} else {
    $ext = $extensiones[$mime] ?? 'mp4';
}

$filename = uniqid('vid_', true) . '.' . $ext;
$destino  = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $destino)) {
    echo json_encode(['ok' => false, 'mensaje' => 'No se pudo guardar el archivo. Verifica permisos del servidor.']);
    exit;
}

/* La ruta publica depende de donde este montado el backend: en XAMPP
   cuelga de /OrientPerfumesV2/, pero en un contenedor o subdominio la
   raiz es otra. Se configura con UPLOADS_BASE_URL. */
$baseUploads = getenv('UPLOADS_BASE_URL') ?: '/OrientPerfumesV2/backend/uploads';
$url = rtrim($baseUploads, '/') . '/' . $filename;
echo json_encode(['ok' => true, 'url' => $url, 'nombre' => $file['name']]);
