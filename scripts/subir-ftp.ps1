<#
    scripts/subir-ftp.ps1
    Sube a Hostinger por FTP el contenido de para-subir/.

    Sube solo lo que cambio desde la ultima vez: guarda la huella
    SHA256 de cada archivo enviado en para-subir/.subido y compara.

    NUNCA BORRA NADA EN EL SERVIDOR. Las imagenes que suben los
    usuarios desde el panel viven en uploads/ y no existen en local:
    un borrado por diferencias se las llevaria por delante.

    USO
      powershell -ExecutionPolicy Bypass -File scripts/subir-ftp.ps1

      -Simular    muestra que subiria, sin conectar ni enviar nada
      -Todo       reenvia todo, ignorando el registro de lo ya subido
      -Preparar   ejecuta antes preparar-despliegue.ps1

    CONFIGURACION
      Copiar scripts/ftp.example.json como scripts/ftp.json y
      rellenarlo. Ese archivo no se versiona: lleva la contrasena.
#>

param(
    [switch] $Simular,
    [switch] $Todo,
    [switch] $Preparar
)

$ErrorActionPreference = 'Stop'

$raiz      = Split-Path -Parent $PSScriptRoot
$origen    = Join-Path $raiz 'para-subir'
$registro  = Join-Path $origen '.subido'
$configPath = Join-Path $PSScriptRoot 'ftp.json'
$sep       = [string][char]92

Write-Host ''
Write-Host '=== Subida por FTP a Hostinger ===' -ForegroundColor Cyan
Write-Host ''

# ── Preparar la carpeta si se pidio ────────────────────────
if ($Preparar) {
    & (Join-Path $PSScriptRoot 'preparar-despliegue.ps1')
    if ($LASTEXITCODE -ne 0) { throw 'La preparacion fallo.' }
}

if (-not (Test-Path $origen)) {
    throw "No existe $origen. Ejecuta antes scripts/preparar-despliegue.ps1"
}

# ── Configuracion ──────────────────────────────────────────
if (-not (Test-Path $configPath)) {
    throw "Falta scripts/ftp.json. Copia scripts/ftp.example.json y rellenalo."
}
$cfg = Get-Content $configPath -Raw | ConvertFrom-Json

foreach ($campo in @('servidor','usuario','password','carpeta')) {
    if (-not $cfg.$campo) { throw "ftp.json no tiene '$campo'." }
}
if ($cfg.password -eq 'PON_AQUI_LA_CONTRASENA_FTP') {
    throw "ftp.json conserva el texto de relleno en 'password'."
}

$servidor = $cfg.servidor -replace '^ftps?://', '' -replace '/+$', ''
$base     = 'ftp://' + $servidor + '/' + ($cfg.carpeta.Trim('/'))
$base     = $base.TrimEnd('/')
$cred     = New-Object System.Net.NetworkCredential($cfg.usuario, $cfg.password)
$usarSsl  = if ($null -ne $cfg.ssl)    { [bool]$cfg.ssl }    else { $true }
$pasivo   = if ($null -ne $cfg.pasivo) { [bool]$cfg.pasivo } else { $true }

# ── Que hay que subir ──────────────────────────────────────
$previo = @{}
if ((Test-Path $registro) -and -not $Todo) {
    (Get-Content $registro -Raw | ConvertFrom-Json).PSObject.Properties |
        ForEach-Object { $previo[$_.Name] = $_.Value }
}

$archivos = Get-ChildItem $origen -Recurse -File -Force |
            Where-Object { $_.Name -ne '.subido' -and $_.Name -ne '.preparado' }

$pendientes = @()
$huellas    = @{}

foreach ($f in $archivos) {
    $rel  = $f.FullName.Substring($origen.Length + 1)
    $hash = (Get-FileHash $f.FullName -Algorithm SHA256).Hash
    $huellas[$rel] = $hash
    if ($previo[$rel] -ne $hash) { $pendientes += [pscustomobject]@{ Local = $f.FullName; Rel = $rel } }
}

Write-Host "  Servidor: $servidor$(if ($usarSsl) { '  (FTPS)' } else { '  (FTP sin cifrar)' })"
Write-Host "  Carpeta:  $($cfg.carpeta)"
Write-Host "  Archivos en para-subir: $($archivos.Count)"
Write-Host "  Por subir: $($pendientes.Count)" -ForegroundColor Cyan
Write-Host ''

if (-not $usarSsl) {
    Write-Host '  AVISO: sin SSL la contrasena viaja en claro por la red.' -ForegroundColor Yellow
    Write-Host ''
}

if ($pendientes.Count -eq 0) {
    Write-Host '  Nada que subir: el servidor ya tiene la ultima version.' -ForegroundColor Green
    Write-Host ''
    return
}

foreach ($p in $pendientes) { Write-Host "    $($p.Rel)" -ForegroundColor DarkGray }
Write-Host ''

if ($Simular) {
    Write-Host '  -Simular: no se ha enviado nada.' -ForegroundColor Yellow
    Write-Host ''
    return
}

# ── Funciones FTP ──────────────────────────────────────────
function Nueva-Peticion([string] $url, [string] $metodo) {
    $r = [System.Net.FtpWebRequest]::Create($url)
    $r.Method      = $metodo
    $r.Credentials = $script:cred
    $r.EnableSsl   = $script:usarSsl
    $r.UsePassive  = $script:pasivo
    $r.UseBinary   = $true
    $r.KeepAlive   = $false
    $r.Timeout     = 60000
    return $r
}

function Crear-Carpeta([string] $rutaRel) {
    # Se crea nivel a nivel: MKD falla si falta un nivel intermedio.
    $partes = $rutaRel -split '/' | Where-Object { $_ -ne '' }
    $acumulado = ''
    foreach ($parte in $partes) {
        $acumulado = if ($acumulado) { "$acumulado/$parte" } else { $parte }
        try {
            $r = Nueva-Peticion "$script:base/$acumulado" ([System.Net.WebRequestMethods+Ftp]::MakeDirectory)
            $r.GetResponse().Close()
        } catch [System.Net.WebException] {
            # 550 significa que ya existe: no es un error para nosotros.
            $resp = $_.Exception.Response
            if ($resp -and $resp.StatusCode -ne [System.Net.FtpStatusCode]::ActionNotTakenFileUnavailable) { throw }
        }
    }
}

# ── Subida ─────────────────────────────────────────────────
$creadas = @{}
$ok = 0; $fallos = @()

foreach ($p in $pendientes) {
    $rel = $p.Rel.Replace($sep, '/')
    $carpetaRel = Split-Path $rel -Parent
    if ($carpetaRel) {
        $carpetaRel = $carpetaRel.Replace($sep, '/')
        if (-not $creadas[$carpetaRel]) { Crear-Carpeta $carpetaRel; $creadas[$carpetaRel] = $true }
    }

    try {
        $r = Nueva-Peticion "$base/$rel" ([System.Net.WebRequestMethods+Ftp]::UploadFile)
        $bytes = [System.IO.File]::ReadAllBytes($p.Local)
        $r.ContentLength = $bytes.Length
        $s = $r.GetRequestStream()
        $s.Write($bytes, 0, $bytes.Length)
        $s.Close()
        $resp = $r.GetResponse(); $resp.Close()
        Write-Host ("    OK  " + $rel) -ForegroundColor Green
        $ok++
    } catch {
        Write-Host ("    ERROR  " + $rel + " -- " + $_.Exception.Message) -ForegroundColor Red
        $fallos += $rel
        # Se quita del registro para que el proximo intento lo reintente.
        $huellas.Remove($p.Rel)
    }
}

# ── Registro ───────────────────────────────────────────────
# Se guarda tambien si hubo fallos: los que si subieron no tienen por
# que reenviarse, y los fallidos se quitaron del mapa mas arriba.
$huellas | ConvertTo-Json -Depth 2 | Set-Content $registro -Encoding utf8

Write-Host ''
Write-Host "  Subidos: $ok de $($pendientes.Count)" -ForegroundColor Cyan
if ($fallos) {
    Write-Host "  Fallaron $($fallos.Count):" -ForegroundColor Red
    foreach ($f in $fallos) { Write-Host "    $f" -ForegroundColor Red }
    Write-Host ''
    exit 1
}
Write-Host ''
