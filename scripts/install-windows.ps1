# Install Node.js (LTS), npm, and PostgreSQL on Windows via winget.
# Run in PowerShell as Administrator, or winget may prompt for elevation.
# npm is included with Node.js.

$ErrorActionPreference = 'Stop'

Write-Host "Checking for winget..." -ForegroundColor Cyan
if (!(Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Host "winget not found. Install App Installer from Microsoft Store or use Windows 11 / recent Windows 10." -ForegroundColor Red
    exit 1
}

Write-Host "`nInstalling Node.js LTS (includes npm)..." -ForegroundColor Cyan
winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
# Winget can return non-zero when already installed / no upgrade; continue anyway

Write-Host "`nInstalling PostgreSQL 16..." -ForegroundColor Cyan
winget install --id PostgreSQL.PostgreSQL.16 -e --accept-source-agreements --accept-package-agreements
# Winget can return non-zero when already installed / no upgrade; continue anyway

# Add PostgreSQL bin to user PATH (winget often doesn't add it for current user)
$pgBase = "${env:ProgramFiles}\PostgreSQL"
$pgBin = $null
if (Test-Path $pgBase) {
    $versions = Get-ChildItem -Path $pgBase -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending
    foreach ($v in $versions) {
        $bin = Join-Path $v.FullName "bin"
        if (Test-Path $bin) { $pgBin = $bin; break }
    }
}
if ($pgBin) {
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($userPath -notlike "*$pgBin*") {
        [Environment]::SetEnvironmentVariable("Path", "$userPath;$pgBin", "User")
        Write-Host "Added to PATH: $pgBin" -ForegroundColor Green
    }
    $env:Path = "$env:Path;$pgBin"
} else {
    Write-Host "Could not find PostgreSQL bin folder. Add it manually: $pgBase\<version>\bin" -ForegroundColor Yellow
}

Write-Host "`nDone. Restart your terminal (or IDE) so PATH updates for Node." -ForegroundColor Green
Write-Host "Verify: node --version, npm --version, psql --version" -ForegroundColor Green
