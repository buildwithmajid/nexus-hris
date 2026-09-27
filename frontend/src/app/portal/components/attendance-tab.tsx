'use client';

import React from 'react';
import { Clock, Calculator } from 'lucide-react';
import { Badge, Button } from '@/components/ui';

interface AttendanceTabProps {
  attendanceLogs: any[];
  overtimeList: any[];
  selectedMonth: number;
  selectedYear: number;
  onOpenOvertimeModal: () => void;
}

export function AttendanceTab({
  attendanceLogs,
  overtimeList,
  selectedMonth,
  selectedYear,
  onOpenOvertimeModal,
}: AttendanceTabProps) {
  const getAttendanceBadge = (status: string) => {
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

  const getOvertimeBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success">APPROVED</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">REJECTED</Badge>;
      default:
        return <Badge variant="warning">PENDING</Badge>;
    }
  };

  return (
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
                      {getAttendanceBadge(log.status)}
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
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenOvertimeModal}
          >
            + Ajukan Lembur
          </Button>
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
                      {getOvertimeBadge(ot.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
