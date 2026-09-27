'use client';

import React from 'react';

interface AttendanceKpiProps {
  attendanceRate: number;
  presentCount: number;
  totalLogs: number;
  totalApprovedHours: number;
  pendingOtCount: number;
}

export function AttendanceKpi({
  attendanceRate,
  presentCount,
  totalLogs,
  totalApprovedHours,
  pendingOtCount,
}: AttendanceKpiProps) {
  return (
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
  );
}
