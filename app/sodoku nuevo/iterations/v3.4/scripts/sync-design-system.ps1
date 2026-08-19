# Sync tokens Design System desde GitHub → src/design-system/
# Uso: .\scripts\sync-design-system.ps1

$ErrorActionPreference = "Stop"
$Repo = "https://github.com/wika-labss/design-system.git"
$TempRoot = Join-Path $env:TEMP "design-system-sync"
$AppRoot = Split-Path $PSScriptRoot -Parent
$DestTokens = Join-Path $AppRoot "src\design-system\tokens\cute-pink"
$DestOverrides = Join-Path $AppRoot "src\design-system\tokens\sodoku-overrides.json"
$DestApproval = Join-Path $AppRoot "src\design-system\APPROVAL.md"

if (Test-Path $TempRoot) { Remove-Item -Recurse -Force $TempRoot }

Write-Host "==> Clonando design-system..."
git clone --depth 1 --filter=blob:none --sparse $Repo $TempRoot
Set-Location $TempRoot
git sparse-checkout set `
  "tokens/cute-pink" `
  "tokens/sodoku-nuevo-v3.2/overrides.json" `
  "visual-expectation/sodoku-nuevo-v3.2/approval.md"

Write-Host "==> Copiando tokens..."
New-Item -ItemType Directory -Force -Path $DestTokens | Out-Null
Copy-Item -Path "tokens\cute-pink\*" -Destination $DestTokens -Force
Copy-Item -Path "tokens\sodoku-nuevo-v3.2\overrides.json" -Destination $DestOverrides -Force
Copy-Item -Path "visual-expectation\sodoku-nuevo-v3.2\approval.md" -Destination $DestApproval -Force

Set-Location $AppRoot
Write-Host "==> Validando..."
npm run typecheck

Write-Host "OK — Design System sincronizado en src/design-system/"
