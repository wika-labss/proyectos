# Sync Sodoku nuevo V3.5 → carpeta local Windows
# Uso (PowerShell):
#   .\scripts\sync-to-windows.ps1
#   .\scripts\sync-to-windows.ps1 -Destination "D:\apps\sodoku"

param(
    [string]$Destination = "C:\dev\sodoku nuevo v3.1"
)

$ErrorActionPreference = "Stop"
$Repo = "https://github.com/wika-labss/proyectos.git"
$SparsePath = "app/sodoku nuevo/iterations/v3.5"
$TempRoot = Join-Path $env:TEMP "proyectos-sodoku-v3.5"

Write-Host "==> Destino: $Destination"

if (Test-Path $TempRoot) {
    Remove-Item -Recurse -Force $TempRoot
}

Write-Host "==> Clonando sparse checkout desde GitHub..."
git clone --depth 1 --filter=blob:none --sparse $Repo $TempRoot
Set-Location $TempRoot
git sparse-checkout set $SparsePath

$Source = Join-Path $TempRoot "app\sodoku nuevo\iterations\v3.5"
if (-not (Test-Path $Source)) {
    throw "No se encontró $Source tras sparse checkout"
}

Write-Host "==> Copiando archivos..."
New-Item -ItemType Directory -Force -Path $Destination | Out-Null
Copy-Item -Path (Join-Path $Source "*") -Destination $Destination -Recurse -Force

Set-Location $Destination
Write-Host "==> npm install..."
npm install

Write-Host "==> Sincronizando Design System (tokens oficiales)..."
& (Join-Path $Destination "scripts\sync-design-system.ps1")

Write-Host "==> Validación rápida..."
npm run typecheck
npm run smoke:v3

Write-Host ""
Write-Host "OK — V3.5 listo en: $Destination"
Write-Host "APK Release: npm run build:apk"
Write-Host "           o .\scripts\verify-build.bat"
