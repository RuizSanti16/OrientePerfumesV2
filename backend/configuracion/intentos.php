<?php
/* =============================================================
   intentos.php — freno a los ataques de fuerza bruta en el login.

   POR QUE
   La unica defensa era un usleep(300000): 300 ms de espera tras cada
   fallo. Eso permite unos tres intentos por segundo, sin limite. Un
   ataque automatizado prueba cientos de miles de contrasenas en una
   noche, y contra una clave corriente eso basta.

   COMO
   Se cuentan los fallos por IP y por usuario en los ultimos minutos, y
   al pasar el umbral se rechaza el intento durante un rato, aunque la
   contrasena sea correcta.

   Por IP y por usuario, no solo por IP: un atacante con varias
   direcciones esquivaria el limite por IP, y limitar solo por usuario
   permitiria probar una contrasena comun contra muchas cuentas. Los dos
   contadores cubren los dos ataques.

   El registro vive en la base y no en memoria, porque en PHP cada
   peticion arranca de cero: una variable no sobrevive de una a otra.

   NO se registran los intentos correctos ni la contrasena probada. Solo
   hace falta saber cuantos fallos hubo y cuando.
============================================================= */

require_once __DIR__ . '/Configuracion.php';

/* Umbrales. Generosos a proposito: quien se equivoca de verdad suele
   acertar en dos o tres intentos, y bloquear demasiado pronto convierte
   una molestia en un problema de atencion al cliente.

   Con define() y no con const: const no puede declararse dentro de un
   bloque condicional, y estos van junto a las funciones que solo se
   definen una vez. */
defined('INTENTOS_MAX_USUARIO') || define('INTENTOS_MAX_USUARIO', 5);   // fallos seguidos sobre un usuario
defined('INTENTOS_MAX_IP')      || define('INTENTOS_MAX_IP',      15);  // fallos desde una misma IP
defined('INTENTOS_VENTANA_MIN') || define('INTENTOS_VENTANA_MIN', 15);  // minutos que se miran hacia atras
defined('INTENTOS_BLOQUEO_MIN') || define('INTENTOS_BLOQUEO_MIN', 15);  // minutos que dura el bloqueo

if (!function_exists('registrarIntentoFallido')) {

    function tablaIntentos(PDO $pdo) {
        static $creada = false;
        if ($creada) return;
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS tbl_intentos_login (
                id       INT AUTO_INCREMENT PRIMARY KEY,
                ip       VARCHAR(45)  NOT NULL,
                usuario  VARCHAR(120) NOT NULL,
                fecha    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                KEY idx_ip (ip, fecha),
                KEY idx_usuario (usuario, fecha)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");
        $creada = true;
    }

    function ipCliente() {
        /* No se usan X-Forwarded-For ni cabeceras similares: las envia
           el cliente y se pueden falsificar, con lo que el atacante
           esquivaria el limite cambiandolas en cada peticion. */
        return substr($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0', 0, 45);
    }

    /**
     * ¿Hay que rechazar este intento antes de comprobar la contrasena?
     *
     * @return array [bloqueado(bool), minutosRestantes(int)]
     */
    function loginBloqueado(PDO $pdo, $usuario) {
        try {
            tablaIntentos($pdo);

            $s = $pdo->prepare("
                SELECT
                    SUM(ip = :ip)           AS por_ip,
                    SUM(usuario = :usuario) AS por_usuario
                FROM tbl_intentos_login
                WHERE fecha > DATE_SUB(NOW(), INTERVAL :ventana MINUTE)
            ");
            $s->bindValue(':ip',      ipCliente());
            $s->bindValue(':usuario', mb_substr((string) $usuario, 0, 120));
            $s->bindValue(':ventana', INTENTOS_VENTANA_MIN, PDO::PARAM_INT);
            $s->execute();
            $r = $s->fetch();

            $porIp      = (int) ($r['por_ip']      ?? 0);
            $porUsuario = (int) ($r['por_usuario'] ?? 0);

            if ($porUsuario >= INTENTOS_MAX_USUARIO || $porIp >= INTENTOS_MAX_IP) {
                return [true, INTENTOS_BLOQUEO_MIN];
            }
            return [false, 0];

        } catch (PDOException $e) {
            /* Si la comprobacion falla, se deja pasar. Un fallo aqui no
               debe dejar a nadie fuera de su propio panel; la
               contrasena sigue siendo obligatoria. */
            error_log('[OrientPerfumes] Control de intentos: ' . $e->getMessage());
            return [false, 0];
        }
    }

    function registrarIntentoFallido(PDO $pdo, $usuario) {
        try {
            tablaIntentos($pdo);
            $pdo->prepare("INSERT INTO tbl_intentos_login (ip, usuario) VALUES (:ip, :u)")
                ->execute([':ip' => ipCliente(), ':u' => mb_substr((string) $usuario, 0, 120)]);

            /* Limpieza oportunista: sin esto la tabla crece sin fin.
               Se hace de vez en cuando y no en cada intento, que seria
               una escritura de mas en el momento menos oportuno. */
            if (random_int(1, 20) === 1) {
                $pdo->exec("DELETE FROM tbl_intentos_login WHERE fecha < DATE_SUB(NOW(), INTERVAL 1 DAY)");
            }
        } catch (PDOException $e) {
            error_log('[OrientPerfumes] Control de intentos: ' . $e->getMessage());
        }
    }

    /** Tras entrar bien, se borra el historial de esa cuenta. */
    function limpiarIntentos(PDO $pdo, $usuario) {
        try {
            $pdo->prepare("DELETE FROM tbl_intentos_login WHERE usuario = :u OR ip = :ip")
                ->execute([':u' => mb_substr((string) $usuario, 0, 120), ':ip' => ipCliente()]);
        } catch (PDOException $e) {
            error_log('[OrientPerfumes] Control de intentos: ' . $e->getMessage());
        }
    }
}
