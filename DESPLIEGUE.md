# Despliegue en Railway

El proyecto son **tres servicios**: base de datos MySQL, backend PHP y
frontend React. Railway los aloja los tres en un mismo proyecto.

> Los pasos que implican crear cuenta, provisionar la base o pulsar
> "Deploy" los tienes que hacer tú desde el panel de Railway: requieren
> tus credenciales.

---

## 0. Subir el código a GitHub

Railway despliega desde el repositorio, así que primero:

```bash
git push origin main
```

---

## 1. Base de datos MySQL

En el panel de Railway: **New → Database → Add MySQL**.

Railway crea la base y expone estas variables, que usarás en el paso 2:
`MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`.

Para cargar los datos, con la MySQL CLI local apuntando a Railway:

```bash
mysql -h <MYSQLHOST> -P <MYSQLPORT> -u <MYSQLUSER> -p<MYSQLPASSWORD> <MYSQLDATABASE> < database/orientperfums.sql
```

El dump lleva `DROP TABLE`, así que se puede reimportar sin arrastrar
restos de un intento anterior.

---

## 2. Backend PHP

**New → GitHub Repo →** el repositorio, y en *Settings* del servicio:

- **Root Directory**: vacío (la raíz)
- **Dockerfile Path**: `Dockerfile`

### Variables de entorno

| Variable | Valor |
|---|---|
| `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
| `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
| `DB_NAME` | `${{MySQL.MYSQLDATABASE}}` |
| `DB_USER` | `${{MySQL.MYSQLUSER}}` |
| `DB_PASS` | `${{MySQL.MYSQLPASSWORD}}` |
| `CORS_ORIGINS` | la URL del frontend, p. ej. `https://web-production-xxxx.up.railway.app` |
| `UPLOADS_BASE_URL` | `/uploads` |
| `APP_DEBUG` | `0` |

La sintaxis `${{MySQL.VARIABLE}}` es de Railway y enlaza el servicio de
base de datos sin copiar credenciales a mano.

`CORS_ORIGINS` no se puede rellenar hasta tener la URL del frontend
(paso 3), así que se deja para el final.

Cuando termine, en *Settings → Networking* pulsa **Generate Domain**.
Esa URL es la de tu API.

---

## 3. Frontend React

**New → GitHub Repo →** el mismo repositorio, y en *Settings*:

- **Root Directory**: `frontend`
- **Dockerfile Path**: `frontend/Dockerfile`

### Variable de compilación

En *Settings → Build*, añade el **build arg**:

```
VITE_API_URL = https://<url-del-backend>.up.railway.app
```

⚠️ Tiene que ser un **build arg**, no una variable de entorno normal.
Vite sustituye `import.meta.env.VITE_API_URL` al compilar; si la
defines solo en ejecución, el bundle saldrá con la URL vacía y la app
llamará a `/api`, que en el contenedor del frontend no existe.

Genera también su dominio en *Settings → Networking*.

---

## 4. Cerrar el círculo

Vuelve al backend y pon en `CORS_ORIGINS` la URL del frontend. Sin eso
el navegador bloqueará todas las llamadas a la API.

---

## 5. Crear el administrador

El script solo funciona por consola. Desde la shell de Railway del
servicio backend:

```bash
php configuracion/crear-admin.php <usuario> <correo> <contrasena>
```

La contraseña debe tener al menos 10 caracteres.

---

## Comprobaciones

```bash
# La API responde y devuelve los 6 productos
curl https://<backend>.up.railway.app/api/productos.php

# Los datos de clientes exigen token: debe dar 401
curl -i https://<backend>.up.railway.app/api/clientes.php

# El CORS solo acepta el dominio del frontend
curl -i -H "Origin: https://sitio-ajeno.com" \
  https://<backend>.up.railway.app/api/productos.php
# no debe aparecer Access-Control-Allow-Origin en la respuesta
```

---

## Limitación conocida: las imágenes

El disco de los contenedores es **efímero**: lo que se suba por el
panel de administración desaparecerá en el siguiente despliegue.

Ahora mismo no es un problema porque el proyecto se desplegó sin
imágenes. Antes de volver a subirlas hay que resolverlo con **Cloudinary**
o similar, o con un **volumen persistente** de Railway montado en
`/var/www/html/uploads`.
