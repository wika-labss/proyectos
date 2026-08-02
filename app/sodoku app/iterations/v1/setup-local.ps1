# Sodoku - Instalacion local en Windows
# Ejecutar en PowerShell: .\setup-local.ps1

$TargetPath = "C:\dev\prueba sodoku"
$RepoUrl = "https://github.com/wika-labss/proyectos.git"
$Branch = "cursor/sodoku-v1-3038"
$SourceSubPath = "app\sodoku app\iterations\v1"

Write-Host "=== Instalando Sodoku en $TargetPath ===" -ForegroundColor Cyan

# Crear carpeta destino
if (-not (Test-Path $TargetPath)) {
    New-Item -ItemType Directory -Force -Path $TargetPath | Out-Null
    Write-Host "Carpeta creada: $TargetPath"
}

# Clonar repo temporal
$TempDir = Join-Path $env:TEMP "proyectos-sodoku-clone"
if (Test-Path $TempDir) {
    Remove-Item -Recurse -Force $TempDir
}

Write-Host "Clonando repositorio..."
git clone --branch $Branch --depth 1 $RepoUrl $TempDir
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al clonar. Verifica que git este instalado." -ForegroundColor Red
    exit 1
}

# Copiar archivos del proyecto (sin node_modules)
$SourcePath = Join-Path $TempDir $SourceSubPath
Write-Host "Copiando proyecto desde $SourcePath..."

Get-ChildItem -Path $SourcePath -Exclude node_modules,.expo | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $TargetPath -Recurse -Force
}

# Limpiar clone temporal
Remove-Item -Recurse -Force $TempDir

# Instalar dependencias
Set-Location $TargetPath
Write-Host "Instalando dependencias (npm install)..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en npm install. Verifica que Node.js este instalado." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Instalacion completada ===" -ForegroundColor Green
Write-Host "Proyecto listo en: $TargetPath"
Write-Host ""
Write-Host "Para iniciar el juego:" -ForegroundColor Yellow
Write-Host "  cd `"$TargetPath`""
Write-Host "  npx expo start"
Write-Host ""
Write-Host "Escanea el QR con Expo Go en tu movil (Android/iOS)."
