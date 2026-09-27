'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Eye,
  Clock,
  User,
  Database,
  Globe,
  FileCode,
  CheckCircle2,
  Lock,
  RefreshCw,
  X,
  Server,
  KeyRound,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function AuditLogsPage() {
  const { hasPermission } = useAuth();

  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Inspector Modal
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const loadLogs = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [logsRes, statsRes] = await Promise.all([
        api.audit.getLogs({
          page: currentPage,
          limit: 15,
          action: actionFilter || undefined,
          tableName: tableFilter || undefined,
          search: searchTerm || undefined,
        }),
        api.audit.getStats(),
      ]);

      setLogs(logsRes.data || []);
      setTotalPages(logsRes.meta.totalPages || 1);
      setTotalCount(logsRes.meta.total || 0);
      setStats(statsRes);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat log audit');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [currentPage, actionFilter, tableFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-indigo-600" />
            Jejak Audit & Kepatuhan Keamanan
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Audit trail forensik mutasi data sensitif, kepatuhan ISO/IEC 27001 dan UU No. 27/2022 (UU PDP).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadLogs()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>
        </div>
      </div>

      {/* Compliance Guarantee Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 shadow-sm border border-indigo-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <Lock className="h-4 w-4" />
              Sertifikasi Standar Kepatuhan Keamanan Aktif
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              ISO/IEC 27001:2022 & UU Pelindungan Data Pribadi (UU PDP)
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Seluruh data identitas kependudukan (NIK, NPWP, Rekening Bank) dilindungi enkripsi kriptografis tingkat tinggi <strong>AES-256-GCM</strong>. Setiap mutasi data dicatat secara permanen dengan stempel waktu, alamat IP, dan user-agent forensik.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur border border-white/20 px-3 py-2 rounded-lg text-center">
              <div className="text-[10px] text-slate-300 font-medium uppercase">Retensi Audit</div>
              <div className="text-base font-bold text-emerald-400 tabular-nums">365 Hari</div>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 px-3 py-2 rounded-lg text-center">
              <div className="text-[10px] text-slate-300 font-medium uppercase">Kriptografi</div>
              <div className="text-base font-bold text-sky-400">AES-256</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 text-rose-800 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Total Catatan Audit</span>
            <Database className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 tabular-nums">
            {stats?.totalLogs || totalCount}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Rekaman aktivitas tersimpan
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Aksi Penambahan (CREATE)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 tabular-nums">
            {stats?.distribution?.create || 0}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Pencatatan data baru
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Aksi Modifikasi (UPDATE)</span>
            <Clock className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-700 tabular-nums">
            {stats?.distribution?.update || 0}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Persetujuan & mutasi data
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Aksi Penghapusan (DELETE)</span>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700 tabular-nums">
            {stats?.distribution?.delete || 0}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Penghapusan / soft-delete
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Action Select */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-800 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Semua Aksi</option>
                <option value="CREATE">CREATE (Tambah)</option>
                <option value="UPDATE">UPDATE (Ubah/Approve)</option>
                <option value="DELETE">DELETE (Hapus)</option>
              </select>
            </div>

            {/* Table Select */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Database className="h-4 w-4 text-gray-400" />
              <select
                value={tableFilter}
                onChange={(e) => {
                  setTableFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-800 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Semua Entitas</option>
                <option value="payroll_periods">payroll_periods</option>
                <option value="leave_requests">leave_requests</option>
                <option value="employees">employees</option>
                <option value="overtime_entries">overtime_entries</option>
                <option value="attendance">attendance</option>
                <option value="system_security">system_security</option>
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 w-full md:w-80">
            <div className="relative w-full">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari user, IP, atau entitas..."
                className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-1.5 text-sm text-gray-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 transition"
            >
              Cari
            </button>
          </div>
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Daftar Aktivitas Forensik ({totalCount} Entri)
          </div>
          <div className="text-xs text-gray-500">
            Halaman {currentPage} dari {totalPages}
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-gray-500">Memuat riwayat log audit...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Tidak ada rekaman audit yang sesuai dengan filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Waktu (WIB)</th>
                  <th className="py-3 px-4">Aktor / Pengguna</th>
                  <th className="py-3 px-4 text-center">Tindakan</th>
                  <th className="py-3 px-4">Entitas Target</th>
                  <th className="py-3 px-4">Alamat IP & Klien</th>
                  <th className="py-3 px-4 text-right">Inspeksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-600 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-900">
                      <div>{log.user?.email || 'System / Batch'}</div>
                      <div className="text-[11px] text-gray-400 font-normal">
                        Role: {log.user?.role?.name || 'Administrator'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {log.action === 'CREATE' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                          CREATE
                        </span>
                      )}
                      {log.action === 'UPDATE' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700 border border-sky-200">
                          UPDATE
                        </span>
                      )}
                      {log.action === 'DELETE' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                          DELETE
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-indigo-700 font-semibold">
                      {log.tableName}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-600">
                      <div className="font-mono">{log.ipAddress}</div>
                      <div className="text-[10px] text-gray-400 truncate max-w-xs" title={log.userAgent}>
                        {log.userAgent}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 rounded bg-gray-100 hover:bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 transition"
                      >
                        <Eye className="h-3.5 w-3.5 text-gray-500" />
                        Payload
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
            <div>
              Menampilkan halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                Sebelumnya
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Inspector Payload Diff */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900 text-sm">
                  Inspeksi Payload Forensik — {selectedLog.tableName} ({selectedLog.action})
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Pengguna</span>
                  <span className="font-medium text-gray-800">{selectedLog.user?.email || 'System'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Alamat IP</span>
                  <span className="font-mono text-gray-800">{selectedLog.ipAddress}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Waktu</span>
                  <span className="text-gray-800">
                    {new Date(selectedLog.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Record ID</span>
                  <span className="font-mono text-gray-600 truncate block" title={selectedLog.recordId}>
                    {selectedLog.recordId}
                  </span>
                </div>
              </div>

              {/* Old Value vs New Value */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    Nilai Sebelumnya (oldValue)
                  </div>
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto font-mono text-[11px] h-52">
                    {selectedLog.oldValue
                      ? JSON.stringify(selectedLog.oldValue, null, 2)
                      : '// Tidak ada data sebelumnya (Entri Baru)'}
                  </pre>
                </div>

                <div>
                  <div className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Nilai Sesudahnya (newValue)
                  </div>
                  <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg overflow-x-auto font-mono text-[11px] h-52">
                    {selectedLog.newValue
                      ? JSON.stringify(selectedLog.newValue, null, 2)
                      : '// Tidak ada data pembaruan'}
                  </pre>
                </div>
              </div>

              <div>
                <span className="text-gray-500 block font-medium mb-1">User-Agent Klien:</span>
                <div className="p-2 bg-gray-100 rounded text-gray-600 font-mono text-[10px] break-all">
                  {selectedLog.userAgent}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-500 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

