'use client';

import React from 'react';
import { Filter, Database, Search, Eye } from 'lucide-react';
import { Badge, Button } from '@/components/ui';

interface AuditTableProps {
  logs: any[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  actionFilter: string;
  tableFilter: string;
  searchTerm: string;
  onActionFilterChange: (val: string) => void;
  onTableFilterChange: (val: string) => void;
  onSearchTermChange: (val: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onPageChange: (page: number) => void;
  onSelectLog: (log: any) => void;
}

export function AuditTable({
  logs,
  isLoading,
  totalCount,
  currentPage,
  totalPages,
  actionFilter,
  tableFilter,
  searchTerm,
  onActionFilterChange,
  onTableFilterChange,
  onSearchTermChange,
  onSearchSubmit,
  onPageChange,
  onSelectLog,
}: AuditTableProps) {
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Badge variant="success">CREATE</Badge>;
      case 'UPDATE':
        return <Badge variant="info">UPDATE</Badge>;
      case 'DELETE':
        return <Badge variant="danger">DELETE</Badge>;
      default:
        return <Badge variant="neutral">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <form onSubmit={onSearchSubmit} className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Action Select */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={actionFilter}
                onChange={(e) => onActionFilterChange(e.target.value)}
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
                onChange={(e) => onTableFilterChange(e.target.value)}
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
                onChange={(e) => onSearchTermChange(e.target.value)}
                placeholder="Cari user, IP, atau entitas..."
                className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-1.5 text-sm text-gray-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Cari
            </Button>
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
                      {getActionBadge(log.action)}
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelectLog(log)}
                        leftIcon={<Eye className="h-3.5 w-3.5 text-gray-500" />}
                      >
                        Payload
                      </Button>
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
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
