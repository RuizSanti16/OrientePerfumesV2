<?php
/* =============================================================
   scripts/respaldo-cifrado.php — cifra y descifra los respaldos.

   POR QUE
   respaldo.sql e importar-hostinger.sql contienen los datos de todos
   los clientes (nombre, correo, telefono y direccion) y el hash de la
   contrasena del administrador. Estan en claro en el disco y son la
   unica copia: no se versionan, precisamente porque no deben acabar en
   GitHub. Un portatil perdido o un equipo comprometido entrega esos
   datos enteros, y ademas obliga a notificar a los titulares.

   COMO
   AES-256 en modo CBC, con la clave derivada de una contrasena
   mediante PBKDF2 y 200.000 iteraciones. La derivacion lenta es lo que
   hace inviable probar contrasenas a lo bruto contra el archivo: sin
   ella, una contrasena corriente se rompe en minutos.

   Se firma el resultado con HMAC-SHA256 y se comprueba ANTES de
   descifrar (cifrar-luego-autenticar). Sin esa firma, alguien podria
   alterar el archivo cifrado y el descifrado devolveria basura sin que
   nada avisara; peor aun, un atacante puede aprovechar ese
   comportamiento para ir descifrando el contenido a base de enviar
   versiones modificadas.

   USO
     php scripts/respaldo-cifrado.php cifrar    respaldo.sql
     php scripts/respaldo-cifrado.php descifrar respaldo.sql.enc

   La contrasena se pide por teclado y no queda en el historial. Es la
   unica forma de recuperar el archivo: gUARDALA en tu gestor de
   contrasenas, porque aqui no hay puerta trasera.
============================================================= */

if (php_sapi_name() !== 'cli') {
    http_response_code(404);
    exit;
}

const MARCA        = "OPBK1\0";   // identifica el formato y su version
const ITERACIONES  = 200000;
const LARGO_SAL    = 16;
const LARGO_IV     = 16;
const LARGO_MAC    = 32;

$accion  = $argv[1] ?? '';
$archivo = $argv[2] ?? '';

if (!in_array($accion, ['cifrar', 'descifrar'], true) || $archivo === '') {
    fwrite(STDERR, "Uso:\n");
    fwrite(STDERR, "  php scripts/respaldo-cifrado.php cifrar    <archivo.sql>\n");
    fwrite(STDERR, "  php scripts/respaldo-cifrado.php descifrar <archivo.sql.enc>\n");
    exit(1);
}

if (!is_readable($archivo)) {
    fwrite(STDERR, "No se puede leer: $archivo\n");
    exit(1);
}

/* Dos claves distintas de la misma contrasena: una para cifrar y otra
   para firmar. Reutilizar la misma para ambas cosas es un error
   clasico y evitarlo no cuesta nada. */
function derivarClaves($contrasena, $sal) {
    $material = hash_pbkdf2('sha256', $contrasena, $sal, ITERACIONES, 64, true);
    return [substr($material, 0, 32), substr($material, 32, 32)];
}

function pedirContrasena($confirmar = false) {
    fwrite(STDOUT, 'Contrasena del respaldo: ');
    $c = rtrim((string) fgets(STDIN), "\r\n");

    if ($c === '') {
        fwrite(STDERR, "La contrasena no puede estar vacia.\n");
        exit(1);
    }
    if ($confirmar) {
        if (strlen($c) < 12) {
            fwrite(STDERR, "Usa al menos 12 caracteres: es lo unico que protege el archivo.\n");
            exit(1);
        }
        fwrite(STDOUT, 'Reptela para confirmar: ');
        $c2 = rtrim((string) fgets(STDIN), "\r\n");
        if (!hash_equals($c, $c2)) {
            fwrite(STDERR, "No coinciden. No se ha cifrado nada.\n");
            exit(1);
        }
    }
    return $c;
}

if ($accion === 'cifrar') {
    $salida = $archivo . '.enc';
    if (file_exists($salida)) {
        fwrite(STDERR, "Ya existe $salida. Borralo o renombralo antes.\n");
        exit(1);
    }

    $contrasena = pedirContrasena(true);
    $datos = file_get_contents($archivo);

    $sal = random_bytes(LARGO_SAL);
    $iv  = random_bytes(LARGO_IV);
    list($claveCifrado, $claveMac) = derivarClaves($contrasena, $sal);

    $cifrado = openssl_encrypt($datos, 'aes-256-cbc', $claveCifrado, OPENSSL_RAW_DATA, $iv);
    if ($cifrado === false) {
        fwrite(STDERR, "Fallo al cifrar.\n");
        exit(1);
    }

    $cuerpo = MARCA . $sal . $iv . $cifrado;
    $mac    = hash_hmac('sha256', $cuerpo, $claveMac, true);

    file_put_contents($salida, $cuerpo . $mac);

    printf("\n  Cifrado: %s (%s bytes -> %s bytes)\n",
        $salida, number_format(strlen($datos)), number_format(filesize($salida)));
    echo "\n  El original sigue en claro. Borralo cuando compruebes que\n";
    echo "  el cifrado se descifra bien, y guarda la contrasena: sin ella\n";
    echo "  el respaldo no se recupera de ninguna manera.\n";
    exit(0);
}

/* ── Descifrar ── */
$bruto = file_get_contents($archivo);

if (strncmp($bruto, MARCA, strlen(MARCA)) !== 0) {
    fwrite(STDERR, "El archivo no tiene el formato esperado.\n");
    exit(1);
}
if (strlen($bruto) < strlen(MARCA) + LARGO_SAL + LARGO_IV + LARGO_MAC) {
    fwrite(STDERR, "El archivo esta incompleto o dañado.\n");
    exit(1);
}

$cuerpo  = substr($bruto, 0, -LARGO_MAC);
$mac     = substr($bruto, -LARGO_MAC);
$sal     = substr($cuerpo, strlen(MARCA), LARGO_SAL);
$iv      = substr($cuerpo, strlen(MARCA) + LARGO_SAL, LARGO_IV);
$cifrado = substr($cuerpo, strlen(MARCA) + LARGO_SAL + LARGO_IV);

$contrasena = pedirContrasena();
list($claveCifrado, $claveMac) = derivarClaves($contrasena, $sal);

/* Se comprueba la firma antes de descifrar, y con hash_equals para no
   filtrar informacion por el tiempo que tarda la comparacion. */
if (!hash_equals(hash_hmac('sha256', $cuerpo, $claveMac, true), $mac)) {
    fwrite(STDERR, "\nLa contrasena es incorrecta, o el archivo fue alterado.\n");
    exit(1);
}

$datos = openssl_decrypt($cifrado, 'aes-256-cbc', $claveCifrado, OPENSSL_RAW_DATA, $iv);
if ($datos === false) {
    fwrite(STDERR, "\nFallo al descifrar.\n");
    exit(1);
}

$salida = preg_replace('/\.enc$/', '', $archivo);
if ($salida === $archivo) { $salida = $archivo . '.sql'; }
if (file_exists($salida)) {
    fwrite(STDERR, "\nYa existe $salida. Borralo o renombralo antes.\n");
    exit(1);
}

file_put_contents($salida, $datos);
printf("\n  Descifrado: %s (%s bytes)\n", $salida, number_format(strlen($datos)));
