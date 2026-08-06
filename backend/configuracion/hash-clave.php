<?php
/* =============================================================
   hash-clave.php — genera el hash bcrypt de una contrasena.

   Para que sirve:
   login.php valida unicamente con password_verify(), que exige un
   hash. Si la contrasena se escribe en la base tal cual (por ejemplo
   con un UPDATE a mano desde el panel de Railway), la comparacion
   falla siempre y el login responde "Usuario o contrasena
   incorrectos" sin mas pistas.

   Este script no toca la base de datos: solo imprime el hash y la
   sentencia lista para pegar donde haga falta. Asi la contrasena
   nunca sale de tu maquina.

   USO:
     php backend/configuracion/hash-clave.php
       (la pide por teclado; no queda en el historial del terminal)

     php backend/configuracion/hash-clave.php "MiClave.Segura1"
       (mas comodo, pero queda en el historial del terminal)

   COMPROBAR UN HASH YA GUARDADO:
     php backend/configuracion/hash-clave.php --verificar "$2y$10$..."
       Pide la contrasena y dice si ese hash la valida. Sirve para
       separar dos causas que dan el mismo error de login: que el hash
       de la base no corresponda a la contrasena, o que el problema
       este en otro sitio. Pega el hash entre comillas simples en bash,
       porque lleva simbolos $ que el shell expandiria.

   Para crear un administrador nuevo en la base local, usa
   crear-admin.php, que ya hashea e inserta en un solo paso.
============================================================= */

if (php_sapi_name() !== 'cli') {
    http_response_code(404);
    exit;
}

/* ── Modo verificacion ── */
if (($argv[1] ?? '') === '--verificar') {
    $hash = $argv[2] ?? null;
    if ($hash === null) {
        fwrite(STDERR, "Uso: php hash-clave.php --verificar \"<hash>\"\n");
        exit(1);
    }

    fwrite(STDOUT, "Contrasena: ");
    $prueba = rtrim((string) fgets(STDIN), "\r\n");

    echo "\nLongitud del hash recibido: " . strlen($hash) . " (un bcrypt son 60)\n";
    echo "Empieza por: " . substr($hash, 0, 4) . " (un bcrypt empieza por \$2y\$)\n";

    if (password_verify($prueba, $hash)) {
        echo "\nCORRECTO: ese hash valida esa contrasena.\n";
        echo "Si aun asi el login falla, el hash guardado en la base no es\n";
        echo "este, o el usuario no coincide.\n";
        exit(0);
    }

    echo "\nNO COINCIDEN: ese hash no valida esa contrasena.\n";
    echo "Genera uno nuevo y vuelve a guardarlo.\n";
    exit(1);
}

$clave = $argv[1] ?? null;

if ($clave === null) {
    fwrite(STDOUT, "Contrasena: ");
    $clave = rtrim((string) fgets(STDIN), "\r\n");
}

/* login.php aplica trim() a la contrasena recibida. Si aqui se hashea
   una con espacios al principio o al final, el hash nunca validaria
   contra lo que llega del formulario. Se avisa y se usa la recortada. */
if ($clave !== trim($clave)) {
    fwrite(STDOUT, "Aviso: la contrasena tenia espacios al principio o al final.\n");
    fwrite(STDOUT, "El login los descarta, asi que se hashea la version sin ellos.\n");
    $clave = trim($clave);
}

if (strlen($clave) < 10) {
    fwrite(STDERR, "Error: la contrasena debe tener al menos 10 caracteres.\n");
    exit(1);
}

$hash = password_hash($clave, PASSWORD_DEFAULT);

/* Comprobacion de que el hash generado valida de verdad. Es barata y
   descarta de entrada el caso en que el problema estuviera aqui. */
if (!password_verify($clave, $hash)) {
    fwrite(STDERR, "Error: el hash generado no valida. Revisa la version de PHP.\n");
    exit(1);
}

echo "\nHash generado (" . strlen($hash) . " caracteres):\n";
echo $hash . "\n";
echo "\nSentencia para actualizar un administrador existente.\n";
echo "Cambia TU_USUARIO por el usuario con el que quieras entrar:\n\n";
echo "UPDATE tbl_administrador SET usuario = 'TU_USUARIO', contrasena = '"
     . $hash . "' WHERE id_administrador = 1;\n\n";
echo "El hash no es la contrasena y no se puede revertir, pero si permite\n";
echo "probar claves por fuerza bruta: no lo publiques ni lo subas al repo.\n";
