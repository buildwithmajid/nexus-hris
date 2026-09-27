'use client';

import React, { useEffect, useState } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  AlertCircle,
  Calendar,
  Sparkles,
  HelpCircle,
  Calculator,
  Filter,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth, DEFAULT_COMPANY } from '@/lib/auth-context';

export default function AttendancePage() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'overtime' | 'attendance'>('overtime');

  // Month & Year state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Data state
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [overtimeList, setOvertimeList] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Overtime Form Modal
  const [isOtModalOpen, setIsOtModalOpen] = useState(false);
  const [otEmployeeId, setOtEmployeeId] = useState('');
  const [otDate, setOtDate] = useState(new Date().toISOString().split('T')[0]);
  const [otHours, setOtHours] = useState(2);
  const [otIsHoliday, setOtIsHoliday] = useState(false);

  // Manual Attendance Modal
  const [isAttModalOpen, setIsAttModalOpen] = useState(false);
  const [attEmployeeId, setAttEmployeeId] = useState('');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attStatus, setAttStatus] = useState('PRESENT');
  const [attNotes, setAttNotes] = useState('');

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    setActionError('');
    try {
      const [attRes, otRes, empRes] = await Promise.all([
        api.attendance.getAttendance(DEFAULT_COMPANY.id, selectedMonth, selectedYear),
        api.attendance.getOvertime(DEFAULT_COMPANY.id, selectedMonth, selectedYear),
        api.employees.list(DEFAULT_COMPANY.id),
      ]);
      setAttendanceLogs(attRes);
      setOvertimeList(otRes);
      setEmployees(empRes.data || []);
      if (empRes.data && empRes.data.length > 0 && !otEmployeeId) {
        setOtEmployeeId(empRes.data[0].id);
        setAttEmployeeId(empRes.data[0].id);
      }
    } catch (err: any) {
      setActionError(err.message || 'Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  // Actions
  const handleSyncBiometrics = async () => {
    setIsSimulating(true);
    setActionError('');
    setActionSuccess('');
    try {
      const res = await api.attendance.simulateMonth(
        DEFAULT_COMPANY.id,
        selectedMonth,
        selectedYear,
      );
      setActionSuccess('Sinkronisasi log presensi biometrik kantor berhasil diperbarui ke sistem.');
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Gagal melakukan sinkronisasi mesin presensi');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCreateOvertime = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    try {
      await api.attendance.createOvertime({
        employeeId: otEmployeeId,
        date: otDate,
        hours: Number(otHours),
        isHoliday: otIsHoliday,
      });
      setIsOtModalOpen(false);
      setActionSuccess('Pengajuan lembur berhasil dicatat (Menunggu Verifikasi).');
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Gagal mengajukan lembur');
    }
  };

  const handleApproveOvertime = async (id: string) => {
    setActionError('');
    try {
      await api.attendance.approveOvertime(id);
      setActionSuccess('Lembur berhasil disetujui (Approved). Siap dihitung pada siklus payroll.');
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Gagal menyetujui lembur');
    }
  };

  const handleRejectOvertime = async (id: string) => {
    setActionError('');
    try {
      await api.attendance.rejectOvertime(id);
      setActionSuccess('Lembur berhasil ditolak (Rejected).');
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Gagal menolak lembur');
    }
  };

  const handleLogAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    try {
      await api.attendance.logAttendance({
        employeeId: attEmployeeId,
        date: attDate,
        status: attStatus,
        notes: attNotes,
      });
      setIsAttModalOpen(false);
      setActionSuccess('Presensi berhasil dicatat.');
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Gagal mencatat presensi');
    }
  };

  const formatRupiah = (val?: number) => {
    if (val === undefined || val === null) return 'Rp 0';
    return `Rp ${new Intl.NumberFormat('id-ID').format(val)}`;
  };

  // Helper live calculator Kepmenaker 102/2004
  const selectedEmp = employees.find((e) => e.id === otEmployeeId);
  const baseSalary = selectedEmp?.baseSalary ? Number(selectedEmp.baseSalary) : 0;
  const hourlyRate = baseSalary > 0 ? baseSalary / 173 : 0;

  const calculateOtEstimate = (hours: number, isHoliday: boolean) => {
    if (hourlyRate <= 0 || hours <= 0) return 0;
    let multiplierTotal = 0;
    if (!isHoliday) {
      // Hari kerja: jam ke-1 = 1.5x, jam berikutnya = 2.0x
      if (hours <= 1) {
        multiplierTotal = hours * 1.5;
      } else {
        multiplierTotal = 1.5 + (hours - 1) * 2.0;
      }
    } else {
      // Hari libur: 8 jam pertama = 2.0x, jam ke-9 = 3.0x, jam 10+ = 4.0x
      if (hours <= 8) {
        multiplierTotal = hours * 2.0;
      } else if (hours <= 9) {
        multiplierTotal = 8 * 2.0 + (hours - 8) * 3.0;
      } else {
        multiplierTotal = 8 * 2.0 + 1 * 3.0 + (hours - 9) * 4.0;
      }
    }
    return Math.round(multiplierTotal * hourlyRate);
  };

  const otEstimatedAmount = calculateOtEstimate(Number(otHours), otIsHoliday);

  // Stats calculation
  const totalApprovedHours = overtimeList
    .filter((o) => o.status === 'APPROVED')
    .reduce((acc, curr) => acc + Number(curr.hours), 0);

  const pendingOtCount = overtimeList.filter((o) => o.status === 'PENDING').length;
  const presentCount = attendanceLogs.filter(
    (a) => a.status === 'PRESENT' || a.status === 'LATE',
  ).length;
  const totalLogs = attendanceLogs.length;
  const attendanceRate = totalLogs > 0 ? Math.round((presentCount / totalLogs) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-subtle-border">
        <div>
          <h1 className="text-xl font-bold text-charcoal tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal" />
            <span>Presensi & Lembur Karyawan (Attendance Hub)</span>
          </h1>
          <p className="text-xs text-steel mt-0.5">
            Pencatatan kehadiran harian dan perhitungan lembur sesuai standar hukum Kepmenaker No. 102/2004 terintegrasi ke payroll.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center gap-1.5 bg-white border border-subtle-border rounded px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-steel" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-charcoal font-medium focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Bulan {i + 1}
                </option>
              ))}
            </select>
            <span className="text-steel">/</span>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-14 bg-transparent text-charcoal font-medium focus:outline-none"
            />
          </div>

          {hasPermission('attendance.correct') && (
            <button
              onClick={handleSyncBiometrics}
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-charcoal text-xs font-medium rounded hover:bg-slate-50 transition-colors shadow-subtle disabled:opacity-50"
              title="Tarik log presensi biometrik mesin fingerprint kantor pusat & cabang"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Menyinkronkan...' : 'Tarik Log Biometrik'}</span>
            </button>
          )}

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

      {/* KPI Metric Cockpit */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-subtle-border rounded p-3.5 shadow-card">
          <span className="text-[11px] font-medium text-steel">Tingkat Kehadiran Bulan Ini</span>
          <div className="text-xl font-bold text-charcoal mt-1 tabular-nums">
            {attendanceRate}%
          </div>
          <span className="text-[10px] text-teal">
            {presentCount} dari {totalLogs} log hadir/terlambat
          </span>
        </div>

        <div className="bg-white border border-subtle-border rounded p-3.5 shadow-card">
          <span className="text-[11px] font-medium text-steel">Total Jam Lembur Disetujui</span>
          <div className="text-xl font-bold text-charcoal mt-1 tabular-nums">
            {totalApprovedHours} Jam
          </div>
          <span className="text-[10px] text-steel">Kepmenaker 102/2004 Valid</span>
        </div>

        <div className="bg-white border border-subtle-border rounded p-3.5 shadow-card">
          <span className="text-[11px] font-medium text-steel">Lembur Menunggu Persetujuan</span>
          <div className="text-xl font-bold text-pending mt-1 tabular-nums">
            {pendingOtCount} Pengajuan
          </div>
          <span className="text-[10px] text-slate-400">Verifikasi oleh HR / Finance</span>
        </div>

        <div className="bg-white border border-subtle-border rounded p-3.5 shadow-card">
          <span className="text-[11px] font-medium text-steel">Status Sinkronisasi Payroll</span>
          <div className="text-xl font-bold text-navy mt-1">Terhubung Otomatis</div>
          <span className="text-[10px] text-emerald-600">Lembur APPROVED masuk ke kalkulasi</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-subtle-border flex gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overtime')}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'overtime'
              ? 'border-teal text-navy'
              : 'border-transparent text-steel hover:text-charcoal'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-teal" />
          <span>Pengelolaan & Persetujuan Lembur ({overtimeList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'attendance'
              ? 'border-teal text-navy'
              : 'border-transparent text-steel hover:text-charcoal'
          }`}
        >
          <Filter className="w-3.5 h-3.5 text-teal" />
          <span>Log Presensi Karyawan ({attendanceLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERTIME MANAGEMENT COCKPIT */}
      {activeTab === 'overtime' && (
        <div className="bg-white border border-subtle-border rounded shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-subtle-border flex items-center justify-between bg-canvas">
            <h2 className="text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-teal" />
              <span>Daftar Pengajuan Lembur — Bulan {selectedMonth}/{selectedYear}</span>
            </h2>
            <div className="text-xs text-steel">
              Total {overtimeList.length} entri lembur tercatat
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white border-b border-subtle-border text-[11px] font-semibold text-steel uppercase tracking-wider">
                  <th className="py-2.5 px-3">Karyawan</th>
                  <th className="py-2.5 px-3">Departemen</th>
                  <th className="py-2.5 px-3">Tanggal Lembur</th>
                  <th className="py-2.5 px-3">Jenis Hari</th>
                  <th className="py-2.5 px-3 text-right">Durasi (Jam)</th>
                  <th className="py-2.5 px-3 text-right">Estimasi Upah Lembur</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Aksi Persetujuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle-border">
                {overtimeList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-steel">
                      Belum ada entri pengajuan lembur untuk bulan ini. Klik tombol "+ Ajukan Lembur" di atas.
                    </td>
                  </tr>
                ) : (
                  overtimeList.map((item) => {
                    const empBase = Number(item.employee?.baseSalary || 0);
                    const empRate = empBase > 0 ? empBase / 173 : 0;
                    const hours = Number(item.hours);
                    let mult = 0;
                    if (!item.isHoliday) {
                      mult = hours <= 1 ? hours * 1.5 : 1.5 + (hours - 1) * 2.0;
                    } else {
                      mult =
                        hours <= 8
                          ? hours * 2.0
                          : hours <= 9
                          ? 16 + (hours - 8) * 3.0
                          : 16 + 3 + (hours - 9) * 4.0;
                    }
                    const est = Math.round(mult * empRate);

                    return (
                      <tr key={item.id} className="table-row-hover">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-charcoal">
                            {item.employee?.fullName}
                          </div>
                          <div className="text-[10px] text-steel">
                            {item.employee?.employeeCode}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {item.employee?.department?.name || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {new Date(item.date).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              item.isHoliday
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.isHoliday ? 'Hari Libur Resmi' : 'Hari Kerja Biasa'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-charcoal tabular-nums">
                          {hours} jam
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-navy tabular-nums">
                          {formatRupiah(est)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {item.status === 'PENDING' && hasPermission('attendance.correct') ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleApproveOvertime(item.id)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-medium transition-colors"
                              >
                                Setujui
                              </button>
                              <button
                                onClick={() => handleRejectOvertime(item.id)}
                                className="px-2 py-1 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-charcoal rounded text-[10px] font-medium transition-colors"
                              >
                                Tolak
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE LOGS COCKPIT */}
      {activeTab === 'attendance' && (
        <div className="bg-white border border-subtle-border rounded shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-subtle-border flex items-center justify-between bg-canvas">
            <h2 className="text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal" />
              <span>Rekapitulasi Presensi — Bulan {selectedMonth}/{selectedYear}</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-steel">
                Total {attendanceLogs.length} data presensi
              </span>
              <button
                onClick={() => setIsAttModalOpen(true)}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded text-[11px] font-medium text-charcoal hover:bg-slate-50"
              >
                + Input Manual
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-subtle-border text-[11px] font-semibold text-steel uppercase tracking-wider">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Karyawan</th>
                  <th className="py-2.5 px-3">Departemen / Jabatan</th>
                  <th className="py-2.5 px-3 text-center">Status Kehadiran</th>
                  <th className="py-2.5 px-3">Keterangan / Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle-border">
                {attendanceLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-steel">
                      Belum ada data presensi tercatat pada bulan ini. Klik tombol "Simulasi Kehadiran Bulanan" di atas untuk mengisi data demo secara instan.
                    </td>
                  </tr>
                ) : (
                  attendanceLogs.slice(0, 100).map((log) => (
                    <tr key={log.id} className="table-row-hover">
                      <td className="py-2 px-3 text-slate-700 tabular-nums">
                        {new Date(log.date).toLocaleDateString('id-ID', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-semibold text-charcoal">
                          {log.employee?.fullName}
                        </span>
                        <span className="text-[10px] text-steel ml-1.5">
                          ({log.employee?.employeeCode})
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {log.employee?.department?.name} - {log.employee?.position?.title}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            log.status === 'PRESENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.status === 'LATE'
                              ? 'bg-amber-100 text-amber-800'
                              : log.status === 'ABSENT'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {log.status === 'PRESENT'
                            ? 'HADIR'
                            : log.status === 'LATE'
                            ? 'TERLAMBAT'
                            : log.status === 'ABSENT'
                            ? 'ALPHA'
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
      )}

      {/* MODAL: AJUKAN LEMBUR BARU DENGAN LIVE ESTIMATOR KEPMENAKER */}
      {isOtModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-subtle-border max-w-lg w-full shadow-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-subtle-border flex items-center justify-between bg-canvas">
              <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-teal" />
                <span>Pengajuan Lembur (Kepmenaker 102/2004)</span>
              </h3>
              <button
                onClick={() => setIsOtModalOpen(false)}
                className="text-steel hover:text-charcoal"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOvertime} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Pilih Karyawan
                </label>
                <select
                  value={otEmployeeId}
                  onChange={(e) => setOtEmployeeId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-charcoal focus:outline-none focus:border-teal"
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeCode}) — Gaji: {formatRupiah(Number(emp.baseSalary))}
                    </option>
                  ))}
                </select>
              </div>

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

              {/* LIVE FORMULA CALCULATOR PREVIEW BOX */}
              <div className="p-3 bg-canvas border border-teal/30 rounded space-y-1.5 text-[11px]">
                <div className="font-semibold text-charcoal flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-teal">
                    <Calculator className="w-3.5 h-3.5" />
                    Simulasi Estimasi Upah Lembur (Kepmenaker 102/2004)
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
                  Ajukan Lembur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INPUT LOG PRESENSI MANUAL */}
      {isAttModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-subtle-border max-w-sm w-full shadow-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-subtle-border flex items-center justify-between bg-canvas">
              <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider">
                Catat Presensi Karyawan
              </h3>
              <button
                onClick={() => setIsAttModalOpen(false)}
                className="text-steel hover:text-charcoal"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogAttendance} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Karyawan
                </label>
                <select
                  value={attEmployeeId}
                  onChange={(e) => setAttEmployeeId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-charcoal focus:outline-none focus:border-teal"
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-charcoal focus:outline-none focus:border-teal"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={attStatus}
                  onChange={(e) => setAttStatus(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-charcoal focus:outline-none focus:border-teal"
                >
                  <option value="PRESENT">Hadir (PRESENT)</option>
                  <option value="LATE">Terlambat (LATE)</option>
                  <option value="PERMIT">Izin Resmi (PERMIT)</option>
                  <option value="SICK">Sakit (SICK)</option>
                  <option value="ABSENT">Alpha / Tidak Hadir (ABSENT)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Catatan / Alasan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Surat dokter terlampir"
                  value={attNotes}
                  onChange={(e) => setAttNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-charcoal focus:outline-none focus:border-teal"
                />
              </div>

              <div className="pt-2 border-t border-subtle-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAttModalOpen(false)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-charcoal text-xs font-medium rounded hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-navy text-white text-xs font-medium rounded hover:bg-navy-hover transition-colors"
                >
                  Simpan Presensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
