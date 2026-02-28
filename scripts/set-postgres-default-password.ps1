# Set a default password for the PostgreSQL 'postgres' user.
# Run in PowerShell as Administrator (needed to edit pg_hba.conf and restart the service).
# Use after a fresh PostgreSQL install so you have a known login (e.g. postgres/postgres).
#
# Usage:
#   .\scripts\set-postgres-default-password.ps1
#   .\scripts\set-postgres-default-password.ps1 -Password "mypassword"

param(
    [string] $Password = "postgres"
)

$ErrorActionPreference = 'Stop'

# Find data directory (pg_hba.conf lives there)
$pgBase = "${env:ProgramFiles}\PostgreSQL"
$dataDir = $null
if (Test-Path $pgBase) {
    $versions = Get-ChildItem -Path $pgBase -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending
    foreach ($v in $versions) {
        $hba = Join-Path $v.FullName "data\pg_hba.conf"
        if (Test-Path $hba) { $dataDir = Join-Path $v.FullName "data"; break }
    }
}
if (-not $dataDir) {
    $reg = Get-ItemProperty -Path "HKLM:\SOFTWARE\PostgreSQL\Installations\*" -ErrorAction SilentlyContinue
    if ($reg) { $dataDir = $reg.DataDirectory }
}
if (-not $dataDir -or -not (Test-Path $dataDir)) {
    Write-Host "PostgreSQL data directory not found. Install PostgreSQL first." -ForegroundColor Red
    exit 1
}

$hbaPath = Join-Path $dataDir "pg_hba.conf"
if (-not (Test-Path $hbaPath)) {
    Write-Host "pg_hba.conf not found at $hbaPath" -ForegroundColor Red
    exit 1
}

# Find psql (bin is next to the data folder: .../PostgreSQL/18/bin)
$pgBin = Join-Path (Split-Path $dataDir) "bin"
if (Test-Path (Join-Path $pgBin "psql.exe")) {
    $env:Path = "$pgBin;$env:Path"
} else {
    Write-Host "psql not found. Add PostgreSQL bin to PATH and try again." -ForegroundColor Red
    exit 1
}

# Backup and switch to trust
$content = Get-Content $hbaPath -Raw
$backup = "$hbaPath.bak.$(Get-Date -Format 'yyyyMMddHHmmss')"
Set-Content -Path $backup -Value $content
$newContent = $content -replace 'scram-sha-256', 'trust' -replace '\bmd5\b', 'trust'
if ($newContent -eq $content) {
    Write-Host "No auth lines changed (already trust?). Edit $hbaPath manually if needed." -ForegroundColor Yellow
} else {
    Set-Content -Path $hbaPath -Value $newContent -NoNewline
    Write-Host "Set pg_hba.conf to trust (backup: $backup)" -ForegroundColor Green
}

# Restart service
$svc = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $svc) {
    Write-Host "PostgreSQL service not found." -ForegroundColor Red
    exit 1
}
Restart-Service $svc.Name -Force
Start-Sleep -Seconds 3

# Set password
$env:PGPASSWORD = ""
$sql = "ALTER USER postgres PASSWORD '$($Password.Replace("'", "''"))';"
& psql -h 127.0.0.1 -U postgres -d postgres -t -c $sql 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to set password. Try: psql -h 127.0.0.1 -U postgres -d postgres" -ForegroundColor Yellow
}

# Restore scram-sha-256
Set-Content -Path $hbaPath -Value $content -NoNewline
Write-Host "Restored pg_hba.conf to password auth" -ForegroundColor Green
Restart-Service $svc.Name -Force

Write-Host "`nDefault postgres user password set." -ForegroundColor Green
Write-Host "  Username: postgres" -ForegroundColor Cyan
Write-Host "  Password: $Password" -ForegroundColor Cyan
Write-Host "  Connect:  psql -h 127.0.0.1 -U postgres -d postgres" -ForegroundColor Cyan
Write-Host "  In .env:  DATABASE_URL=postgresql://postgres:$Password@localhost:5432/react_template" -ForegroundColor Cyan
