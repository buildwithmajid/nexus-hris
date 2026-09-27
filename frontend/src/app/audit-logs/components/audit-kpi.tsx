'use client';

import React from 'react';
import { Database, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

interface AuditKpiProps {
  stats: any;
  totalCount: number;
}

export function AuditKpi({ stats, totalCount }: AuditKpiProps) {
  return (
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
  );
}
