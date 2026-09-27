#!/usr/bin/env bash
# ==============================================================================
# Nexus HRIS — Skrip Otomatisasi Startup Lokal (Linux / macOS)
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "========================================================"
echo "           🚀 Memulai Nexus HRIS Platform              "
echo "========================================================"

# 1. Pastikan Payroll Engine terkompilasi
echo -e "\n[1/3] Memeriksa & Kompilasi Payroll Engine..."
npm run build --workspace=@nexus-hris/payroll-engine

# 2. Pastikan Backend API terkompilasi
echo -e "\n[2/3] Memeriksa & Kompilasi NestJS Backend API..."
rm -f backend/*.tsbuildinfo
npm run build --workspace=@nexus-hris/api

# 3. Jalankan Backend API & Frontend Web
echo -e "\n[3/3] Menjalankan Backend API & Frontend Web..."

node backend/dist/main &
API_PID=$!
echo "  ✓ Backend API berjalan [PID: $API_PID] -> http://localhost:3000/api/v1"

npm run start --workspace=frontend &
WEB_PID=$!
echo "  ✓ Frontend Web berjalan [PID: $WEB_PID] -> http://localhost:3001"

echo "========================================================"
echo "  Semua layanan siap!"
echo "  URL Aplikasi: http://localhost:3001"
echo "  Kredensial Demo: admin@nexus-hris.id / (Lihat SEED_ADMIN_PASSWORD di .env.example)"
echo "========================================================"

sleep 2
if command -v xdg-open > /dev/null; then
  xdg-open "http://localhost:3001"
elif command -v open > /dev/null; then
  open "http://localhost:3001"
fi

wait
