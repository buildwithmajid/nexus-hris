'use client';

import React from 'react';
import { Calculator } from 'lucide-react';
import { Badge, Button } from '@/components/ui';

interface OvertimeTableProps {
  overtimeList: any[];
  selectedMonth: number;
  selectedYear: number;
  canCorrect: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function OvertimeTable({
  overtimeList,
  selectedMonth,
  selectedYear,
  canCorrect,
  onApprove,
  onReject,
}: OvertimeTableProps) {
  const formatRupiah = (val?: number) => {
    if (val === undefined || val === null) return 'Rp 0';
    return `Rp ${new Intl.NumberFormat('id-ID').format(val)}`;
  };

  return (
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
                      <Badge variant={item.isHoliday ? 'warning' : 'neutral'}>
                        {item.isHoliday ? 'Hari Libur Resmi' : 'Hari Kerja Biasa'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-charcoal tabular-nums">
                      {hours} jam
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-navy tabular-nums">
                      {formatRupiah(est)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge
                        variant={
                          item.status === 'APPROVED'
                            ? 'success'
                            : item.status === 'REJECTED'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {item.status === 'PENDING' && canCorrect ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onApprove(item.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-2 py-0.5"
                          >
                            Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onReject(item.id)}
                            className="text-[10px] px-2 py-0.5 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                          >
                            Tolak
                          </Button>
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
  );
}
