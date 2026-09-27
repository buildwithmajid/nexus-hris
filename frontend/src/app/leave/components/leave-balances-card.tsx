import React from 'react';
import { Calendar } from 'lucide-react';

interface LeaveBalancesCardProps {
  balances: any[];
  isLoading: boolean;
}

export function LeaveBalancesCard({ balances, isLoading }: LeaveBalancesCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-12 text-center text-sm text-gray-500">Memuat rekap saldo cuti...</div>
      </div>
    );
  }

  if (balances.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-12 text-center">
          <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <div className="text-sm font-medium text-gray-700">Belum ada data saldo cuti</div>
          <p className="text-xs text-gray-500 mt-1">
            Saldo cuti tahunan di-generate otomatis untuk semua karyawan aktif.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="py-3 px-4">Karyawan</th>
              <th className="py-3 px-4">Departemen</th>
              <th className="py-3 px-4">Jenis Cuti</th>
              <th className="py-3 px-4 text-center">Jatah Kuota</th>
              <th className="py-3 px-4 text-center">Terpakai</th>
              <th className="py-3 px-4 text-center">Sisa Saldo</th>
              <th className="py-3 px-4">Status Kuota</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {balances.map((bal) => {
              const remaining = bal.quotaDays - bal.usedDays;
              const percentUsed = bal.quotaDays > 0 ? (bal.usedDays / bal.quotaDays) * 100 : 0;
              return (
                <tr key={bal.id} className="hover:bg-gray-50/60 transition">
                  <td className="py-3.5 px-4 font-medium text-gray-900">
                    <div>{bal.employee?.fullName || 'N/A'}</div>
                    <div className="text-xs text-gray-400 font-normal">
                      {bal.employee?.employeeCode}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {bal.employee?.department?.name || 'Umum'}
                  </td>
                  <td className="py-3.5 px-4 text-gray-700 font-medium">
                    {bal.leaveType?.name || 'Cuti Tahunan'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-gray-800 tabular-nums">
                    {bal.quotaDays} Hari
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-amber-700 tabular-nums">
                    {bal.usedDays} Hari
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold tabular-nums">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs ${
                        remaining <= 2
                          ? 'bg-rose-100 text-rose-800'
                          : remaining <= 6
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {remaining} Hari
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="w-36 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${
                          percentUsed > 80
                            ? 'bg-rose-500'
                            : percentUsed > 50
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, percentUsed))}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                      {Math.round(percentUsed)}% terpakai
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
