'use client';

import React from 'react';
import { BadgePercent, Scale } from 'lucide-react';

export function StatutoryRatesTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kartu BPJS Kesehatan */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <BadgePercent className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900 text-sm">BPJS Kesehatan</h3>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              Perpres 64/2020
            </span>
          </div>

          <div className="space-y-3 text-xs text-gray-600">
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <span>Porsi Beban Perusahaan</span>
              <strong className="text-gray-900 text-sm">4.0%</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <span>Porsi Potongan Karyawan</span>
              <strong className="text-gray-900 text-sm">1.0%</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <span>Batas Upah Maksimum (Wage Cap)</span>
              <strong className="text-emerald-700 text-sm tabular-nums">Rp 12.000.000</strong>
            </div>
            <p className="text-[11px] text-gray-400 pt-2 leading-relaxed">
              Jika gaji pokok + tunjangan tetap karyawan melebihi Rp12 juta, dasar iuran dibatasi tepat pada Rp12 juta (maksimal iuran gabungan Rp600.000/bln).
            </p>
          </div>
        </div>

        {/* Kartu BPJS Ketenagakerjaan JP */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <BadgePercent className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-gray-900 text-sm">Jaminan Pensiun (JP)</h3>
            </div>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">
              SE BPJS TK 2024
            </span>
          </div>

          <div className="space-y-3 text-xs text-gray-600">
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <span>Porsi Beban Perusahaan</span>
              <strong className="text-gray-900 text-sm">2.0%</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <span>Porsi Potongan Karyawan</span>
              <strong className="text-gray-900 text-sm">1.0%</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <span>Batas Upah Maksimum (Wage Cap)</span>
              <strong className="text-indigo-700 text-sm tabular-nums">Rp 10.042.300</strong>
            </div>
            <p className="text-[11px] text-gray-400 pt-2 leading-relaxed">
              Plafon upah tertinggi dinaikkan sesuai indeks inflasi BPS dan berlaku efektif per Maret 2024 bagi seluruh pekerja formal.
            </p>
          </div>
        </div>

        {/* Kartu PPh 21 TER PMK 168/2023 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-600" />
              <h3 className="font-bold text-gray-900 text-sm">PPh 21 TER Bulanan</h3>
            </div>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
              PMK 168/2023
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-gray-600">
            <div className="p-2 bg-gray-50 rounded-lg">
              <strong className="text-gray-900 block">Kategori TER A:</strong>
              <span>TK/0 (54jt), TK/1 (58.5jt), K/0 (58.5jt) • 44 Lapisan Tarif (0% s/d 34%)</span>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <strong className="text-gray-900 block">Kategori TER B:</strong>
              <span>TK/2 (63jt), TK/3 (67.5jt), K/1 (63jt), K/2 (67.5jt) • 40 Lapisan Tarif (0% s/d 34%)</span>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <strong className="text-gray-900 block">Kategori TER C:</strong>
              <span>K/3 (72jt) • 41 Lapisan Tarif (0% s/d 34%)</span>
            </div>
          </div>
        </div>

        {/* Kartu Lembur Kepmenaker 102/2004 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-sky-600" />
              <h3 className="font-bold text-gray-900 text-sm">Upah Lembur Resmi</h3>
            </div>
            <span className="text-[10px] bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded-full">
              Kepmenaker 102/2004
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-gray-600">
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <span>Upah Sejam Standar</span>
              <strong className="text-gray-900 font-mono">1/173 × Gaji Pokok</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <span>Hari Kerja Biasa</span>
              <span className="font-medium text-gray-800">Jam 1: 1.5× • Jam 2+: 2.0×</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <span>Hari Libur Resmi</span>
              <span className="font-medium text-gray-800">1-8 jam: 2.0× • Ke-9: 3.0× • 10+: 4.0×</span>
            </div>
            <p className="text-[11px] text-gray-400 pt-2 leading-relaxed">
              Semua formula kalkulasi dihitung otomatis secara native tanpa toleransi human error oleh payroll engine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
