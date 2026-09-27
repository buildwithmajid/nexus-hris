'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Receipt,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth, DEFAULT_COMPANY } from '@/contexts/auth-context';

export default function DashboardPage() {
  const { hasPermission } = useAuth();
  const [employeeCount, setEmployeeCount] = useState<number>(0);
  const [periods, setPeriods] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<any>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const empRes = await api.employees.list(DEFAULT_COMPANY.id).catch(() => ({ meta: { total: 0 } }));
        setEmployeeCount(empRes.meta?.total || 0);

        const periodRes = await api.payroll.getPeriods(DEFAULT_COMPANY.id).catch(() => []);
        setPeriods(periodRes);

        if (periodRes.length > 0) {
          const latest = periodRes[0];
          const detailRes = await api.payroll.getPeriodDetail(latest.id).catch(() => null);
          if (detailRes) {
            setSummaryData(detailRes.summary);
          }
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      }
    }

    loadDashboard();
  }, []);

  const formatRupiah = (val?: number) => {
    if (val === undefined || val === null) return 'Rp 0';
    return `Rp ${new Intl.NumberFormat('id-ID').format(val)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return { label: 'Draf', class: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'PENDING_APPROVAL':
        return { label: 'Menunggu Verifikasi', class: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'APPROVED':
        return { label: 'Disetujui', class: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'LOCKED':
        return { label: 'Terkunci (Audit Lock)', class: 'bg-navy/10 text-navy border-navy/20' };
      default:
        return { label: status, class: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-subtle-border">
        <div>
          <h1 className="text-xl font-bold text-charcoal tracking-tight">
            Pusat Kendali Penggajian & SDM
          </h1>
          <p className="text-xs text-steel mt-0.5">
            Sistem kepatuhan statuter ketenagakerjaan dan perpajakan Republik Indonesia (PP 58/2023 & PMK 168/2023).
          </p>
        </div>

        {hasPermission('payroll.run') && (
          <Link
            href="/payroll"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy text-white text-xs font-medium rounded hover:bg-navy-hover transition-colors shadow-subtle"
          >
            <span>Buka Modul Penggajian</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* KPI Metric Cards (Cockpit High-Density 8/10) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Karyawan Aktif */}
        <div className="bg-white border border-subtle-border rounded p-4 shadow-card">
          <div className="flex items-center justify-between text-steel mb-2">
            <span className="text-xs font-medium">Karyawan Terdaftar</span>
            <Users className="w-4 h-4 text-steel" />
          </div>
          <div className="text-2xl font-bold text-charcoal tabular-nums">
            {employeeCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-success font-medium">100% Aktif</span>
            <span>di PT Nusantara Digital</span>
          </div>
        </div>

        {/* Card 2: Estimasi Penggajian Bulan Berjalan */}
        <div className="bg-white border border-subtle-border rounded p-4 shadow-card">
          <div className="flex items-center justify-between text-steel mb-2">
            <span className="text-xs font-medium">Estimasi Payroll Bersih</span>
            <Receipt className="w-4 h-4 text-steel" />
          </div>
          <div className="text-2xl font-bold text-charcoal tabular-nums">
            {formatRupiah(summaryData?.totalNet)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Bruto: {formatRupiah(summaryData?.totalGross)}</span>
          </div>
        </div>

        {/* Card 3: Akumulasi PPh 21 TER */}
        <div className="bg-white border border-subtle-border rounded p-4 shadow-card">
          <div className="flex items-center justify-between text-steel mb-2">
            <span className="text-xs font-medium">PPh 21 TER (PMK 168/2023)</span>
            <TrendingUp className="w-4 h-4 text-steel" />
          </div>
          <div className="text-2xl font-bold text-charcoal tabular-nums">
            {formatRupiah(summaryData?.totalPph21)}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Kepatuhan Pajak Otomatis</span>
          </div>
        </div>

        {/* Card 4: Iuran BPJS Ketenagakerjaan & Kesehatan */}
        <div className="bg-white border border-subtle-border rounded p-4 shadow-card">
          <div className="flex items-center justify-between text-steel mb-2">
            <span className="text-xs font-medium">Potongan BPJS Karyawan</span>
            <ShieldCheck className="w-4 h-4 text-steel" />
          </div>
          <div className="text-2xl font-bold text-charcoal tabular-nums">
            {formatRupiah(summaryData?.totalBpjsEmployee)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Kes 1% + JHT/JP 3%</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Riwayat Siklus Penggajian & Status Kepatuhan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Tabel Siklus Penggajian Terbaru */}
        <div className="lg:col-span-2 bg-white border border-subtle-border rounded shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-subtle-border flex items-center justify-between bg-canvas">
            <h2 className="text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-teal" />
              <span>Siklus Penggajian Terakhir</span>
            </h2>
            <Link
              href="/payroll"
              className="text-xs text-teal font-medium hover:underline flex items-center gap-1"
            >
              <span>Kelola Semua Periode</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white border-b border-subtle-border text-[11px] font-semibold text-steel uppercase tracking-wider">
                  <th className="py-2.5 px-4">Periode</th>
                  <th className="py-2.5 px-4">Status Siklus</th>
                  <th className="py-2.5 px-4 text-right">Karyawan Terhitung</th>
                  <th className="py-2.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle-border">
                {periods.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-steel">
                      Belum ada periode penggajian yang dibuat.
                    </td>
                  </tr>
                ) : (
                  periods.slice(0, 5).map((p) => {
                    const statusConfig = getStatusBadge(p.status);
                    return (
                      <tr key={p.id} className="table-row-hover">
                        <td className="py-3 px-4 font-medium text-charcoal">
                          Bulan {p.month} / {p.year}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-medium border rounded ${statusConfig.class}`}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-slate-700">
                          {p._count?.payrollDetails || 0} orang
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href="/payroll"
                            className="text-xs text-teal font-medium hover:underline inline-flex items-center gap-1"
                          >
                            Rincian
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (1/3): Pusat Tindakan & Presensi Real-Time */}
        <div className="space-y-4">
          {/* Action Center (Tugas Perlu Tindakan Segera) */}
          <div className="bg-white border border-subtle-border rounded-lg p-4 shadow-card space-y-3">
            <div className="flex items-center justify-between border-b border-subtle-border pb-2.5">
              <span className="text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal" />
                <span>Pusat Tindakan & Persetujuan</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                3 Tertunda
              </span>
            </div>

            <div className="space-y-2">
              <Link
                href="/leave"
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 block transition-colors group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-charcoal group-hover:text-teal transition-colors">
                  <span>Persetujuan Cuti Karyawan</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal" />
                </div>
                <div className="text-[11px] text-steel mt-0.5">
                  2 permohonan cuti tahunan menunggu persetujuan HR.
                </div>
              </Link>

              <Link
                href="/payroll"
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 block transition-colors group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-charcoal group-hover:text-teal transition-colors">
                  <span>Verifikasi Batch Penggajian</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal" />
                </div>
                <div className="text-[11px] text-steel mt-0.5">
                  Siklus September 2026 status DRAF (Batas Cut-off H-3).
                </div>
              </Link>

              <Link
                href="/employees"
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 block transition-colors group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-charcoal group-hover:text-teal transition-colors">
                  <span>Evaluasi Masa Percobaan</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal" />
                </div>
                <div className="text-[11px] text-steel mt-0.5">
                  1 karyawan mendekati 90 hari probation (tinjau kinerja).
                </div>
              </Link>
            </div>
          </div>

          {/* Workforce Attendance Pulse Hari Ini */}
          <div className="bg-white border border-subtle-border rounded-lg p-4 shadow-card space-y-3">
            <div className="flex items-center justify-between border-b border-subtle-border pb-2.5">
              <span className="text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-teal" />
                <span>Presensi Hari Ini (Workforce Pulse)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Live</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-lg">
                <div className="text-emerald-800 font-bold text-base font-mono">48</div>
                <div className="text-[11px] text-emerald-700 font-medium">Hadir Tepat Waktu</div>
              </div>
              <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg">
                <div className="text-amber-800 font-bold text-base font-mono">3</div>
                <div className="text-[11px] text-amber-700 font-medium">Cuti & Izin Resmi</div>
              </div>
              <div className="p-2.5 bg-indigo-50/70 border border-indigo-200/80 rounded-lg">
                <div className="text-indigo-800 font-bold text-base font-mono">1</div>
                <div className="text-[11px] text-indigo-700 font-medium">Dinas Luar / Remote</div>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg">
                <div className="text-slate-800 font-bold text-base font-mono">0</div>
                <div className="text-[11px] text-slate-500 font-medium">Tanpa Keterangan</div>
              </div>
            </div>

            <div className="pt-2 border-t border-subtle-border text-[11px] text-steel flex items-center justify-between">
              <span>Tingkat Kehadiran: 94.2%</span>
              <Link href="/attendance" className="text-teal font-medium hover:underline">
                Lihat Log Absensi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
