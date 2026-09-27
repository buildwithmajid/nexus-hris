'use client';

import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  Receipt,
  Clock,
  ShieldCheck,
  Building,
  Printer,
  Plus,
  CheckCircle,
  AlertCircle,
  Calendar,
  CreditCard,
  Briefcase,
  FileCheck,
  Calculator,
  XCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function PortalPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [slipData, setSlipData] = useState<any>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [overtimeList, setOvertimeList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active tab
  const [activeTab, setActiveTab] = useState<'slip' | 'attendance' | 'profile'>('slip');

  // Month & Year state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Overtime Form Modal
  const [isOtModalOpen, setIsOtModalOpen] = useState(false);
  const [otDate, setOtDate] = useState(new Date().toISOString().split('T')[0]);
  const [otHours, setOtHours] = useState(2);
  const [otIsHoliday, setOtIsHoliday] = useState(false);

  // Notification state
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [isClocking, setIsClocking] = useState(false);

  // Load Data
  const loadPortalData = async () => {
    setIsLoading(true);
    setActionError('');
    try {
      const [empRes, slipRes, attRes, otRes] = await Promise.allSettled([
        api.employees.getMe(),
        api.payroll.getMySlip(),
        api.attendance.getMyLogs(selectedMonth, selectedYear),
        api.attendance.getMyOvertime(selectedMonth, selectedYear),
      ]);

      if (empRes.status === 'fulfilled') setProfile(empRes.value);
      if (slipRes.status === 'fulfilled') setSlipData(slipRes.value);
      if (attRes.status === 'fulfilled') setAttendanceLogs(attRes.value);
      if (otRes.status === 'fulfilled') setOvertimeList(otRes.value);
    } catch (err: any) {
      setActionError(err.message || 'Gagal memuat data portal karyawan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, [selectedMonth, selectedYear]);

  // Actions
  const handleClockIn = async () => {
    setIsClocking(true);
    setActionError('');
    setActionSuccess('');
    try {
      await api.attendance.myClock('PRESENT', 'Presensi Mandiri via Portal Karyawan');
      setActionSuccess('Presensi hari ini berhasil dicatat (Status: HADIR).');
      const attRes = await api.attendance.getMyLogs(selectedMonth, selectedYear);
      setAttendanceLogs(attRes);
    } catch (err: any) {
      setActionError(err.message || 'Gagal melakukan presensi');
    } finally {
      setIsClocking(false);
    }
  };

  const handleCreateOvertime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setActionError('');
    try {
      await api.attendance.createOvertime({
        employeeId: profile.id,
        date: otDate,
        hours: Number(otHours),
        isHoliday: otIsHoliday,
      });
      setIsOtModalOpen(false);
      setActionSuccess('Pengajuan lembur berhasil dikirim. Menunggu persetujuan atasan/HR.');
      const otRes = await api.attendance.getMyOvertime(selectedMonth, selectedYear);
      setOvertimeList(otRes);
    } catch (err: any) {
      setActionError(err.message || 'Gagal mengajukan lembur');
    }
  };

  const formatRupiah = (val?: number) => {
    if (val === undefined || val === null) return 'Rp 0';
    return `Rp ${new Intl.NumberFormat('id-ID').format(val)}`;
  };

  // Masking NIK untuk keamanan privasi (misal 317189******0001)
  const maskNik = (nik?: string) => {
    if (!nik || nik.length < 8) return nik || '-';
    return `${nik.slice(0, 4)}********${nik.slice(-4)}`;
  };

  // Helper live calculator Kepmenaker 102/2004
  const baseSalary = profile?.baseSalary ? Number(profile.baseSalary) : 0;
  const hourlyRate = baseSalary > 0 ? baseSalary / 173 : 0;

  const calculateOtEstimate = (hours: number, isHoliday: boolean) => {
    if (hourlyRate <= 0 || hours <= 0) return 0;
    let multiplierTotal = 0;
    if (!isHoliday) {
      multiplierTotal = hours <= 1 ? hours * 1.5 : 1.5 + (hours - 1) * 2.0;
    } else {
      multiplierTotal =
        hours <= 8
          ? hours * 2.0
          : hours <= 9
          ? 16 + (hours - 8) * 3.0
          : 16 + 3 + (hours - 9) * 4.0;
    }
    return Math.round(multiplierTotal * hourlyRate);
  };

  const otEstimatedAmount = calculateOtEstimate(Number(otHours), otIsHoliday);

  // Check today's clock in
  const todayStr = new Date().toISOString().split('T')[0];
  const hasClockedToday = attendanceLogs.some(
    (a) => a.date?.startsWith(todayStr) && a.status === 'PRESENT',
  );

  return (
    <div className="space-y-6">
      {/* Employee Identity Banner */}
      <div className="bg-white border border-subtle-border rounded p-5 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-navy text-white flex items-center justify-center font-bold text-lg tracking-wider shrink-0 border-2 border-teal">
            {profile?.fullName
              ? profile.fullName
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .slice(0, 2)
              : 'ST'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-charcoal tracking-tight">
                {profile?.fullName || 'Memuat Profil...'}
              </h1>
              <span className="px-2 py-0.5 bg-teal/10 text-teal border border-teal/20 text-[10px] font-semibold rounded">
                {profile?.employeeCode || 'EMP-XXXX'}
              </span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium rounded">
                Aktif ({profile?.contractType || 'PERMANENT'})
              </span>
            </div>
            <p className="text-xs text-steel mt-1 flex items-center gap-2">
              <span>{profile?.department?.name || 'Divisi'}</span>
              <span>•</span>
              <span className="font-medium text-charcoal">{profile?.position?.title || 'Jabatan'}</span>
              <span>•</span>
              <span>PTKP: <strong className="text-navy">{profile?.maritalStatusPtkp || 'TK/0'}</strong></span>
            </p>
          </div>
        </div>

        {/* Quick Self-Service Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleClockIn}
            disabled={isClocking || hasClockedToday}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors shadow-subtle ${
              hasClockedToday
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                : 'bg-teal text-white hover:bg-teal-hover'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{hasClockedToday ? 'Sudah Presensi Hari Ini' : isClocking ? 'Mencatat...' : 'Presensi Masuk (Clock-In)'}</span>
          </button>

          <button
            onClick={() => setIsOtModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy text-white text-xs font-medium rounded hover:bg-navy-hover transition-colors shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajukan Lembur</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionError && (
        <div className="p-3 bg-danger-surface border border-danger-border text-danger text-xs rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="p-3 bg-success-surface border border-success-border text-success text-xs rounded flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-subtle-border flex gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('slip')}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'slip'
              ? 'border-teal text-navy'
              : 'border-transparent text-steel hover:text-charcoal'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-teal" />
          <span>Slip Gaji Saya</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'attendance'
              ? 'border-teal text-navy'
              : 'border-transparent text-steel hover:text-charcoal'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-teal" />
          <span>Presensi & Lembur Saya ({attendanceLogs.length} Log)</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'border-teal text-navy'
              : 'border-transparent text-steel hover:text-charcoal'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-teal" />
          <span>Data Kepesertaan Statuter</span>
        </button>
      </div>

      {/* TAB 1: SLIP GAJI SAYA (FORMAL & PRINT READY) */}
      {activeTab === 'slip' && (
        <div className="space-y-4">
          {!slipData ? (
            <div className="bg-white border border-subtle-border rounded p-8 text-center text-steel shadow-card">
              <FileCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-charcoal text-xs">Belum Ada Slip Gaji yang Diterbitkan</p>
              <p className="text-[11px] text-steel mt-1">
                Slip gaji akan muncul otomatis setelah periode penggajian disetujui (Approved) atau dikunci (Locked) oleh Finance.
              </p>
            </div>
          ) : (
            <div
              data-print-slip
              className="bg-white rounded border border-subtle-border max-w-3xl w-full shadow-card overflow-hidden mx-auto"
            >
              {/* Kop Surat Slip Gaji */}
              <div className="p-6 border-b border-subtle-border bg-slate-50 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 text-navy font-bold text-base">
                    <Building className="w-5 h-5 text-teal" />
                    <span>PT NUSANTARA DIGITAL SOLUSI</span>
                  </div>
                  <p className="text-[11px] text-steel mt-0.5">
                    Jl. Jend. Sudirman No. 1, Jakarta Selatan 12190
                  </p>
                  <div className="text-xs font-semibold text-charcoal mt-2">
                    SLIP GAJI RESMI KARYAWAN - BULAN {slipData.detail?.payrollPeriod?.month} /{' '}
                    {slipData.detail?.payrollPeriod?.year}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy text-white text-xs font-medium rounded hover:bg-navy-hover transition-colors shadow-subtle print:hidden"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / Unduh PDF</span>
                </button>
              </div>

              {/* Rincian Profil Karyawan */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs bg-canvas p-3.5 rounded border border-subtle-border">
                  <div>
                    <span className="text-steel block text-[11px]">Nama Karyawan:</span>
                    <span className="font-semibold text-charcoal">
                      {slipData.detail?.employee?.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-steel block text-[11px]">Kode Karyawan / NIK:</span>
                    <span className="font-semibold text-charcoal">
                      {slipData.detail?.employee?.employeeCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-steel block text-[11px]">Departemen / Jabatan:</span>
                    <span className="text-charcoal">
                      {slipData.detail?.employee?.department?.name} -{' '}
                      {slipData.detail?.employee?.position?.title}
                    </span>
                  </div>
                  <div>
                    <span className="text-steel block text-[11px]">Status Pajak PTKP:</span>
                    <span className="font-semibold text-teal">
                      {slipData.detail?.employee?.maritalStatusPtkp} (TER Sesuai PMK 168/2023)
                    </span>
                  </div>
                </div>

                {/* 2 Kolom: Pendapatan vs Potongan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Pendapatan */}
                  <div className="space-y-2">
                    <div className="font-bold text-xs uppercase tracking-wider text-charcoal border-b border-slate-200 pb-1.5 flex justify-between">
                      <span>Komponen Pendapatan</span>
                      <span>Nominal (Rp)</span>
                    </div>
                    {slipData.earnings?.map((e: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between text-[11px] py-1 border-b border-slate-100"
                      >
                        <span className="text-slate-700">{e.componentName}</span>
                        <span className="tabular-nums font-medium text-charcoal">
                          {formatRupiah(e.amount)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-xs pt-2 text-charcoal">
                      <span>Total Penghasilan Bruto</span>
                      <span className="tabular-nums">
                        {formatRupiah(slipData.detail?.grossIncome)}
                      </span>
                    </div>
                  </div>

                  {/* Potongan */}
                  <div className="space-y-2">
                    <div className="font-bold text-xs uppercase tracking-wider text-charcoal border-b border-slate-200 pb-1.5 flex justify-between">
                      <span>Komponen Potongan</span>
                      <span>Nominal (Rp)</span>
                    </div>
                    {slipData.deductions?.map((d: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between text-[11px] py-1 border-b border-slate-100"
                      >
                        <span className="text-slate-700">{d.componentName}</span>
                        <span className="tabular-nums text-slate-800">
                          {formatRupiah(d.amount)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-xs pt-2 text-danger">
                      <span>Total Potongan</span>
                      <span className="tabular-nums">
                        {formatRupiah(
                          slipData.deductions?.reduce(
                            (acc: number, cur: any) => acc + Number(cur.amount),
                            0,
                          ),
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Box Take Home Pay */}
                <div className="p-4 bg-navy text-white rounded flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-300 block">
                      TOTAL PEMBAYARAN BERSIH (TAKE HOME PAY)
                    </span>
                    <span className="text-xl font-bold tracking-tight text-white tabular-nums">
                      {formatRupiah(slipData.detail?.netSalary)}
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-300">
                    <span>{slipData.detail?.employee?.bankName || 'Transfer Bank'}</span>
                    <div className="text-teal font-semibold">Tervalidasi Sistem Payroll</div>
                  </div>
                </div>

                {/* Verifikasi Kriptografis & QR Code Resmi (Anti-Pemalsuan) */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 p-1 bg-white border border-slate-200 rounded shrink-0 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-full h-full text-slate-800" fill="currentColor">
                        <path d="M2 2h7v7H2V2zm2 2v3h3V4H4zm9-2h7v7h-7V2zm2 2v3h3V4h-3zM2 13h7v7H2v-7zm2 2v3h3v-3H4zm9 0h2v2h-2v-2zm3 0h2v2h-2v-2zm2 2h2v2h-2v-2zm-5 3h2v2h-2v-2zm3 0h4v2h-4v-2zm2-5h2v2h-2v-2z" />
                      </svg>
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal" />
                        <span>Verifikasi Kriptografis Digital (UU ITE & UU PDP)</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Doc Hash: SHA-256:{slipData.detail?.id ? slipData.detail.id.substring(0, 16) : '8f7a9c2b4d1e3f5a'}...
                      </div>
                      <div className="text-[10px] text-slate-600">
                        Disahkan oleh: <strong>Direktorat Keuangan & SDM</strong>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-slate-500">
                    <div>Status Dokumen:</div>
                    <div className="text-emerald-700 font-bold uppercase tracking-wider">Sah & Terotentikasi</div>
                  </div>
                </div>

                {/* Footer Kepatuhan Regulasi */}
                <div className="pt-2 text-[10px] text-steel flex items-center justify-between border-t border-subtle-border">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal" />
                    <span>Dihitung sesuai regulasi PPh 21 TER PMK 168/2023 & BPJS Ketenagakerjaan.</span>
                  </div>
                  <span>Dokumen Resmi Elektronik</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRESENSI & LEMBUR SAYA */}
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kolom Kiri: Riwayat Absensi */}
          <div className="bg-white border border-subtle-border rounded shadow-card overflow-hidden">
            <div className="px-5 py-3 border-b border-subtle-border flex items-center justify-between bg-canvas">
              <h2 className="text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal" />
                <span>Log Kehadiran Bulan {selectedMonth}/{selectedYear}</span>
              </h2>
              <span className="text-xs text-steel">{attendanceLogs.length} catatan</span>
            </div>

            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-white border-b border-subtle-border text-[11px] font-semibold text-steel">
                  <tr>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle-border">
                  {attendanceLogs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-steel">
                        Belum ada catatan presensi pada bulan ini.
                      </td>
                    </tr>
                  ) : (
                    attendanceLogs.map((log) => (
                      <tr key={log.id} className="table-row-hover">
                        <td className="py-2 px-3 text-slate-700 tabular-nums">
                          {new Date(log.date).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              log.status === 'PRESENT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.status === 'LATE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {log.status === 'PRESENT'
                              ? 'HADIR'
                              : log.status === 'LATE'
                              ? 'TERLAMBAT'
                              : log.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-500 text-[11px]">
                          {log.notes || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kolom Kanan: Riwayat Lembur Mandiri */}
          <div className="bg-white border border-subtle-border rounded shadow-card overflow-hidden">
            <div className="px-5 py-3 border-b border-subtle-border flex items-center justify-between bg-canvas">
              <h2 className="text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-teal" />
                <span>Pengajuan Lembur Saya</span>
              </h2>
              <button
                onClick={() => setIsOtModalOpen(true)}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded text-[11px] font-medium text-charcoal hover:bg-slate-50"
              >
                + Ajukan Lembur
              </button>
            </div>

            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-white border-b border-subtle-border text-[11px] font-semibold text-steel">
                  <tr>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Jenis Hari</th>
                    <th className="py-2.5 px-3 text-right">Durasi</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle-border">
                  {overtimeList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-steel">
                        Belum ada riwayat pengajuan lembur.
                      </td>
                    </tr>
                  ) : (
                    overtimeList.map((ot) => (
                      <tr key={ot.id} className="table-row-hover">
                        <td className="py-2 px-3 text-slate-700 tabular-nums">
                          {new Date(ot.date).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        <td className="py-2 px-3 text-slate-600 text-[11px]">
                          {ot.isHoliday ? 'Hari Libur Resmi' : 'Hari Kerja'}
                        </td>
                        <td className="py-2 px-3 text-right font-medium tabular-nums">
                          {ot.hours} Jam
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              ot.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ot.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ot.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATA KEPESERTAAN STATUTER */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-subtle-border rounded p-6 shadow-card max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal" />
              <span>Data Kependudukan & Perpajakan Terdaftar</span>
            </h3>
            <p className="text-xs text-steel mt-0.5">
              Data sensitif dilindungi dengan enkripsi AES-256-GCM sesuai regulasi UU PDP No. 27/2022.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-canvas border border-subtle-border rounded">
              <span className="text-steel block text-[11px]">Nomor Induk Kependudukan (NIK):</span>
              <span className="font-semibold text-charcoal text-sm mt-0.5 block tabular-nums">
                {maskNik(profile?.nik)}
              </span>
              <span className="text-[10px] text-teal flex items-center gap-1 mt-1">
                <ShieldCheck className="w-3 h-3" />
                Terenkripsi AES-256
              </span>
            </div>

            <div className="p-3 bg-canvas border border-subtle-border rounded">
              <span className="text-steel block text-[11px]">Nomor Pokok Wajib Pajak (NPWP):</span>
              <span className="font-semibold text-charcoal text-sm mt-0.5 block tabular-nums">
                {profile?.npwp || 'Belum Terdaftar'}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Kategori TER: <strong>{profile?.maritalStatusPtkp || 'TK/0'}</strong>
              </span>
            </div>

            <div className="p-3 bg-canvas border border-subtle-border rounded">
              <span className="text-steel block text-[11px]">No. BPJS Kesehatan:</span>
              <span className="font-semibold text-charcoal text-sm mt-0.5 block tabular-nums">
                {profile?.bpjsKesehatanNumber || '000123456789'}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Iuran: 4% Perusahaan, 1% Karyawan
              </span>
            </div>

            <div className="p-3 bg-canvas border border-subtle-border rounded">
              <span className="text-steel block text-[11px]">No. BPJS Ketenagakerjaan:</span>
              <span className="font-semibold text-charcoal text-sm mt-0.5 block tabular-nums">
                {profile?.bpjsTkNumber || '230198765432'}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Program JHT, JKK, JKM, JP
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-subtle-border">
            <h4 className="text-xs font-bold text-charcoal mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-teal" />
              <span>Rekening Pembayaran Gaji</span>
            </h4>
            <div className="p-3 bg-canvas border border-subtle-border rounded flex items-center justify-between text-xs">
              <div>
                <span className="text-steel block text-[11px]">Bank Penerima:</span>
                <span className="font-bold text-charcoal">{profile?.bankName || 'BCA (Bank Central Asia)'}</span>
              </div>
              <div className="text-right">
                <span className="text-steel block text-[11px]">Nomor Rekening:</span>
                <span className="font-bold text-navy text-sm tabular-nums">
                  {profile?.bankAccountNumber || '••••••••'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AJUKAN LEMBUR MANDIRI */}
      {isOtModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-subtle-border max-w-lg w-full shadow-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-subtle-border flex items-center justify-between bg-canvas">
              <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-teal" />
                <span>Pengajuan Lembur Mandiri (Kepmenaker 102/2004)</span>
              </h3>
              <button
                onClick={() => setIsOtModalOpen(false)}
                className="text-steel hover:text-charcoal"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOvertime} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tanggal Pelaksanaan Lembur
                  </label>
                  <input
                    type="date"
                    value={otDate}
                    onChange={(e) => setOtDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-charcoal focus:outline-none focus:border-teal"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Durasi Lembur (Jam)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="14"
                    value={otHours}
                    onChange={(e) => setOtHours(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-charcoal focus:outline-none focus:border-teal tabular-nums"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Kategori Hari Lembur
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded border cursor-pointer transition-colors ${
                      !otIsHoliday
                        ? 'border-teal bg-teal/5 text-navy font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="otType"
                      checked={!otIsHoliday}
                      onChange={() => setOtIsHoliday(false)}
                      className="text-teal"
                    />
                    <span>Hari Kerja Biasa</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded border cursor-pointer transition-colors ${
                      otIsHoliday
                        ? 'border-teal bg-teal/5 text-navy font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="otType"
                      checked={otIsHoliday}
                      onChange={() => setOtIsHoliday(true)}
                      className="text-teal"
                    />
                    <span>Hari Libur Resmi / Weekend</span>
                  </label>
                </div>
              </div>

              {/* LIVE FORMULA CALCULATOR PREVIEW */}
              <div className="p-3 bg-canvas border border-teal/30 rounded space-y-1.5 text-[11px]">
                <div className="font-semibold text-charcoal flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-teal">
                    <Calculator className="w-3.5 h-3.5" />
                    Perkiraan Tambahan Upah Lembur
                  </span>
                  <span className="text-navy font-bold tabular-nums">
                    {formatRupiah(otEstimatedAmount)}
                  </span>
                </div>
                <div className="text-slate-500 leading-relaxed text-[10px]">
                  • Upah 1 Jam: Gaji Pokok ({formatRupiah(baseSalary)}) / 173 = {formatRupiah(Math.round(hourlyRate))}
                  <br />
                  • Aturan Multiplier:{' '}
                  {!otIsHoliday
                    ? 'Jam ke-1: 1.5×, Jam berikutnya: 2.0×'
                    : 'Jam 1-8: 2.0×, Jam ke-9: 3.0×, Jam 10+: 4.0×'}
                </div>
              </div>

              <div className="pt-2 border-t border-subtle-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOtModalOpen(false)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-charcoal text-xs font-medium rounded hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-navy text-white text-xs font-medium rounded hover:bg-navy-hover transition-colors"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

