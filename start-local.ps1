# ==============================================================================
# Nexus HRIS — Skrip Otomatisasi Startup Lokal (Windows PowerShell)
# ==============================================================================

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "           🚀 Memulai Nexus HRIS Platform              " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Pastikan Payroll Engine terkompilasi
Write-Host "`n[1/3] Memeriksa & Kompilasi Payroll Engine..." -ForegroundColor Yellow
npm run build --workspace=packages/payroll-engine

# 2. Pastikan Backend API terkompilasi
Write-Host "`n[2/3] Memeriksa & Kompilasi NestJS Backend API..." -ForegroundColor Yellow
Remove-Item backend/*.tsbuildinfo -ErrorAction SilentlyContinue
npx tsc --project backend/tsconfig.build.json

# 3. Jalankan Backend API
Write-Host "`n[3/3] Menjalankan Backend API & Frontend Web..." -ForegroundColor Yellow

$apiProcess = Start-Process node -ArgumentList "dist/main" -WorkingDirectory "backend" -PassThru -WindowStyle Hidden
Write-Host ("  ✓ Backend API berjalan [PID: {0}] -> http://localhost:3000/api/v1" -f $apiProcess.Id) -ForegroundColor Green

$webProcess = Start-Process npm -ArgumentList "run start" -WorkingDirectory "frontend" -PassThru -WindowStyle Hidden
Write-Host ("  ✓ Frontend Web berjalan [PID: {0}] -> http://localhost:3001" -f $webProcess.Id) -ForegroundColor Green

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  Semua layanan siap! Membuka browser..." -ForegroundColor Green
Write-Host "  URL Aplikasi: http://localhost:3001" -ForegroundColor White
Write-Host "  Kredensial Demo: admin@nexus-hris.id / NexusAdmin@2026!" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan

Start-Sleep -Seconds 2
Start-Process "http://localhost:3001"

