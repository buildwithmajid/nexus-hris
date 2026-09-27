'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { Badge, Button } from '@/components/ui';

interface AttendanceTableProps {
  attendanceLogs: any[];
  selectedMonth: number;
  selectedYear: number;
  onOpenManualModal: () => void;
}

export function AttendanceTable({
  attendanceLogs,
  selectedMonth,
  selectedYear,
  onOpenManualModal,
}: AttendanceTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <Badge variant="success">HADIR</Badge>;
      case 'LATE':
        return <Badge variant="warning">TERLAMBAT</Badge>;
      case 'ABSENT':
        return <Badge variant="danger">ALPHA</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  return (
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
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenManualModal}
          >
            + Input Manual
          </Button>
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
                  Belum ada data presensi tercatat pada bulan ini. Klik tombol "Tarik Log Biometrik" di atas untuk sinkronisasi data instan.
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
                    {getStatusBadge(log.status)}
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
  );
}
