# ==============================================================================
# Nexus HRIS - Skrip Otomatisasi Startup Lokal (Windows PowerShell)
# ==============================================================================

$repoRoot = Resolve-Path "$PSScriptRoot/.."
Set-Location $repoRoot

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "           Nexus HRIS Platform Local Startup            " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Pastikan Payroll Engine terkompilasi
Write-Host "`n[1/3] Memeriksa & Kompilasi Payroll Engine..." -ForegroundColor Yellow
npm run build --workspace=@nexus-hris/payroll-engine

# 2. Pastikan Backend API terkompilasi
Write-Host "`n[2/3] Memeriksa & Kompilasi NestJS Backend API..." -ForegroundColor Yellow
Remove-Item backend/*.tsbuildinfo -ErrorAction SilentlyContinue
npm run build --workspace=@nexus-hris/api

# 3. Jalankan Backend API & Frontend Web
Write-Host "`n[3/3] Menjalankan Backend API & Frontend Web..." -ForegroundColor Yellow

$apiProcess = Start-Process node -ArgumentList "dist/main" -WorkingDirectory "backend" -PassThru -WindowStyle Hidden
Write-Host "  [OK] Backend API berjalan [PID: $($apiProcess.Id)] -> http://localhost:3000/api/v1" -ForegroundColor Green

$webProcess = Start-Process npm -ArgumentList "run start" -WorkingDirectory "frontend" -PassThru -WindowStyle Hidden
Write-Host "  [OK] Frontend Web berjalan [PID: $($webProcess.Id)] -> http://localhost:3001" -ForegroundColor Green

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  Semua layanan siap! Membuka browser..." -ForegroundColor Green
Write-Host "  URL Aplikasi: http://localhost:3001" -ForegroundColor White
Write-Host "  Kredensial Demo: admin@nexus-hris.id / (Lihat SEED_ADMIN_PASSWORD di .env.example)" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan

Start-Sleep -Seconds 2
Start-Process "http://localhost:3001"
