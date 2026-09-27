'use client';

import React from 'react';

interface ReportDivisionTableProps {
  depts: any[];
  formatRupiah: (val: number) => string;
}

export function ReportDivisionTable({ depts, formatRupiah }: ReportDivisionTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900">
          Distribusi Anggaran & Beban Penggajian per Departemen
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Analisis efisiensi biaya SDM, rata-rata kompensasi, dan alokasi lembur per divisi.
        </p>
      </div>

      {depts.length === 0 ? (
        <div className="p-12 text-center text-sm text-gray-500">
          Belum ada data divisi pada periode ini.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4">Departemen</th>
                <th className="py-3 px-4 text-center">Headcount</th>
                <th className="py-3 px-4 text-right">Total Gaji Bruto</th>
                <th className="py-3 px-4 text-right">Rata-rata Gaji</th>
                <th className="py-3 px-4 text-center">Total Lembur</th>
                <th className="py-3 px-4 text-right">Biaya Lembur</th>
                <th className="py-3 px-4">Pangsa Anggaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {depts.map((d: any) => (
                <tr key={d.departmentId} className="hover:bg-gray-50/60 transition">
                  <td className="py-3.5 px-4 font-semibold text-gray-900">
                    {d.departmentName}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-gray-800 tabular-nums">
                    {d.headcount} Staf
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-gray-900 tabular-nums">
                    {formatRupiah(d.totalGross)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-gray-700 tabular-nums">
                    {formatRupiah(d.averageSalary)}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-amber-700 tabular-nums">
                    {d.totalOvertimeHours} Jam
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-amber-800 tabular-nums">
                    {formatRupiah(d.totalOvertimeCost)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-indigo-600"
                        style={{ width: `${Math.min(100, Math.max(5, d.costPercentage))}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-0.5 block">
                      {d.costPercentage}% dari total gaji
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
