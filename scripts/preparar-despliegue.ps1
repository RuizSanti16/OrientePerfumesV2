<#
    scripts/preparar-despliegue.ps1
    Deja en para-subir/ el proyecto listo para copiar a public_html
    en Hostinger.

    QUE HACE
    1. Compila el frontend (npm run build en frontend/).
    2. Combina frontend/dist y backend/ en para-subir/, que es la
       estructura exacta de public_html.
    3. Excluye lo que no debe vivir en el servidor.
    4. Dice que archivos cambiaron desde la ultima preparacion, para
       no tener que resubirlo todo.

    USO
      powershell -ExecutionPolicy Bypass -File scripts/preparar-despliegue.ps1

      -SinCompilar   omite el build, si solo se tocaron archivos PHP
      -Zip           genera ademas un .zip con separadores correctos

    LO QUE NUNCA SUBE
      entorno.php        vive solo en el servidor y lleva la contrasena
                         de la base; no hay copia en el repositorio
      crear-admin.php    de linea de comandos
      hash-clave.php     de linea de comandos
#>

param(
    [switch] $SinCompilar,
    [switch] $Zip
)

$ErrorActionPreference = 'Stop'

$raiz    = Split-Path -Parent $PSScriptRoot
$destino = Join-Path $raiz 'para-subir'
$sello   = Join-Path $raiz 'para-subir\.preparado'
$sep     = [string][char]92

# Archivos de configuracion que solo existen en el servidor.
$excluidos = @('entorno.php', 'crear-admin.php', 'hash-clave.php')

Write-Host ''
Write-Host '=== Preparando despliegue de OrientPerfumes ===' -ForegroundColor Cyan
Write-Host ''

# ── 1. Compilar el frontend ────────────────────────────────
if (-not $SinCompilar) {
    Write-Host '[1/4] Compilando el frontend...' -ForegroundColor Yellow
    Push-Location (Join-Path $raiz 'frontend')
    try {
        # Sin 2>&1: en PowerShell 5.1 esa redireccion envuelve cada
        # linea de stderr de un ejecutable nativo en un ErrorRecord, y
        # con ErrorActionPreference = Stop aborta el guion aunque la
        # compilacion haya terminado bien. Vite escribe avisos por
        # stderr de forma rutinaria. El codigo de salida es el que
        # decide si fallo.
        npm run build
        if ($LASTEXITCODE -ne 0) { throw 'La compilacion fallo. Revisa los errores de arriba.' }
    } finally { Pop-Location }
} else {
    Write-Host '[1/4] Compilacion omitida (-SinCompilar)' -ForegroundColor DarkGray
}

# Momento de la ultima preparacion, para detectar cambios despues.
$anterior = if (Test-Path $sello) { (Get-Item $sello).LastWriteTime } else { [datetime]::MinValue }

# ── 2. Armar la carpeta ────────────────────────────────────
Write-Host '[2/4] Combinando frontend y backend...' -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $destino | Out-Null

# Se vacia antes de copiar. Sin esto la carpeta acumula restos: Vite
# pone un hash en el nombre de cada bundle, asi que los de
# compilaciones anteriores se quedarian ahi para siempre, y un archivo
# borrado del proyecto seguiria apareciendo como si existiera. Ademas
# hacia que las comprobaciones de mas abajo dieran falsos positivos,
# validando archivos sobrantes de la vez anterior.
# .subido se conserva junto a .preparado: es el registro de que archivos
# ya envio subir-ftp.ps1. Borrarlo aqui hacia que la siguiente subida
# creyera que no se ha enviado nada nunca y reenviara el proyecto
# entero, precisamente al usar -Preparar, que es la forma recomendada de
# lanzarla. La subida seguia siendo correcta, solo dejaba de ser
# incremental.
Get-ChildItem $destino -Force |
    Where-Object { $_.Name -notin @('.preparado', '.subido') } |
    Remove-Item -Recurse -Force

New-Item -ItemType Directory -Force -Path $destino | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $destino 'configuracion') | Out-Null

Copy-Item (Join-Path $raiz 'frontend\dist\*') -Destination $destino -Recurse -Force
Copy-Item (Join-Path $raiz 'backend\api')     -Destination $destino -Recurse -Force

# De uploads solo viaja su .htaccess. Las imagenes son datos del
# servidor, subidas desde el panel: copiar las locales las mezclaria
# con las reales y podria pisar una con una version vieja. La carpeta
# del servidor no se toca nunca.
New-Item -ItemType Directory -Force -Path (Join-Path $destino 'uploads') | Out-Null
Copy-Item (Join-Path $raiz 'backend\uploads\.htaccess') -Destination (Join-Path $destino 'uploads') -Force

# La configuracion se copia archivo a archivo para poder excluir.
Get-ChildItem (Join-Path $raiz 'backend\configuracion') -File -Force |
    Where-Object { $excluidos -notcontains $_.Name } |
    ForEach-Object { Copy-Item $_.FullName -Destination (Join-Path $destino 'configuracion') -Force }

# ── 3. Comprobaciones ──────────────────────────────────────
Write-Host '[3/4] Comprobando...' -ForegroundColor Yellow

$problemas = @()

# Los .htaccess son la parte que mas veces se ha perdido: Chrome los
# omite al subir carpetas porque empiezan por punto.
foreach ($ruta in @('.htaccess', 'configuracion\.htaccess', 'uploads\.htaccess')) {
    if (-not (Test-Path (Join-Path $destino $ruta))) { $problemas += "falta $ruta" }
}

# Un entorno.php aqui acabaria pisando el del servidor.
if (Test-Path (Join-Path $destino 'configuracion\entorno.php')) {
    $problemas += 'sobra configuracion\entorno.php: lo pisaria en el servidor'
}

# El index debe apuntar a un bundle que exista.
$index = Get-Content (Join-Path $destino 'index.html') -Raw
foreach ($m in [regex]::Matches($index, 'assets/[A-Za-z0-9_.-]+\.(js|css)')) {
    if (-not (Test-Path (Join-Path $destino $m.Value.Replace('/', $sep)))) {
        $problemas += "index.html pide $($m.Value), que no existe"
    }
}

if ($problemas) {
    Write-Host ''
    foreach ($p in $problemas) { Write-Host "      PROBLEMA: $p" -ForegroundColor Red }
    Write-Host ''
    throw 'La carpeta no quedo consistente.'
}
Write-Host '      Todo correcto.' -ForegroundColor Green

# ── 4. Resumen ─────────────────────────────────────────────
Write-Host '[4/4] Resultado' -ForegroundColor Yellow
Write-Host ''

$todos    = Get-ChildItem $destino -Recurse -File -Force | Where-Object { $_.Name -notin @('.preparado', '.subido') }
$cambiados = $todos | Where-Object { $_.LastWriteTime -gt $anterior }

Write-Host "      Carpeta: $destino"
Write-Host "      $($todos.Count) archivos, $('{0:N1}' -f (($todos | Measure-Object Length -Sum).Sum / 1MB)) MB"
Write-Host ''

if ($anterior -eq [datetime]::MinValue) {
    Write-Host '      Primera preparacion: hay que subirlo todo.' -ForegroundColor Cyan
} elseif ($cambiados) {
    Write-Host "      Cambiaron $($cambiados.Count) archivos desde la ultima vez:" -ForegroundColor Cyan
    $cambiados | ForEach-Object {
        '        ' + $_.FullName.Substring($destino.Length + 1)
    }
} else {
    Write-Host '      Sin cambios desde la ultima preparacion.' -ForegroundColor DarkGray
}

if ($Zip) {
    Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
    $rutaZip = Join-Path $raiz 'public_html.zip'
    $fs = [System.IO.File]::Open($rutaZip, [System.IO.FileMode]::Create)
    $ar = New-Object System.IO.Compression.ZipArchive($fs, [System.IO.Compression.ZipArchiveMode]::Create)
    $base = (Resolve-Path $destino).Path.TrimEnd($sep) + $sep
    foreach ($f in $todos) {
        # Separadores con barra normal: Compress-Archive escribe '\',
        # contra la especificacion ZIP, y en Linux eso no crea carpetas
        # sino archivos llamados "api\login.php".
        $rel = $f.FullName.Substring($base.Length).Replace($sep, '/')
        $e = $ar.CreateEntry($rel, [System.IO.Compression.CompressionLevel]::Optimal)
        $o = $e.Open(); $i = [System.IO.File]::OpenRead($f.FullName)
        $i.CopyTo($o); $i.Close(); $o.Close()
    }
    $ar.Dispose(); $fs.Close()
    Write-Host ''
    Write-Host "      Zip: $rutaZip" -ForegroundColor Cyan
}

Set-Content -Path $sello -Value (Get-Date -Format 's') -Encoding utf8

Write-Host ''
Write-Host '      Subir a public_html con el Administrador de archivos.' -ForegroundColor Cyan
Write-Host '      Los .htaccess empiezan por punto y Chrome los omite al' -ForegroundColor DarkGray
Write-Host '      subir carpetas: hay que subirlos sueltos, uno a uno.' -ForegroundColor DarkGray
Write-Host ''
