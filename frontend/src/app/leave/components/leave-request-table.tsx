import React from 'react';
import { CalendarCheck, Clock, CheckCircle, XCircle } from 'lucide-react';

interface LeaveRequestTableProps {
  requests: any[];
  isLoading: boolean;
  canApprove: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function LeaveRequestTable({
  requests,
  isLoading,
  canApprove,
  onApprove,
  onReject,
}: LeaveRequestTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-12 text-center text-sm text-gray-500">Memuat data permohonan cuti...</div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-12 text-center">
          <CalendarCheck className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <div className="text-sm font-medium text-gray-700">Belum ada pengajuan cuti</div>
          <p className="text-xs text-gray-500 mt-1">
            Gunakan tab "Formulir Pengajuan Cuti" untuk mengajukan izin atau cuti baru.
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
              <th className="py-3 px-4">Jenis Cuti</th>
              <th className="py-3 px-4">Periode</th>
              <th className="py-3 px-4 text-center">Durasi</th>
              <th className="py-3 px-4">Alasan</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50/60 transition">
                <td className="py-3.5 px-4 font-medium text-gray-900">
                  <div>{req.employee?.fullName || 'N/A'}</div>
                  <div className="text-xs text-gray-400 font-normal">
                    {req.employee?.employeeCode} • {req.employee?.department?.name || 'Umum'}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-gray-700">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    {req.leaveType?.name}
                    {req.leaveType?.isPaid ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                        Berbayar
                      </span>
                    ) : (
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold">
                        Unpaid
                      </span>
                    )}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                  <div className="font-medium text-gray-800">
                    {new Date(req.startDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="text-xs text-gray-400">
                    s/d{' '}
                    {new Date(req.endDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-gray-800 tabular-nums">
                  {req.totalDays} Hari
                </td>
                <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate" title={req.reason}>
                  {req.reason}
                </td>
                <td className="py-3.5 px-4 text-center">
                  {req.status === 'PENDING' && (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                        <Clock className="h-3 w-3 text-amber-600" />
                        <span>Menunggu Persetujuan</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Dalam Peninjauan
                      </span>
                    </div>
                  )}
                  {req.status === 'APPROVED' && (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                        <CheckCircle className="h-3 w-3 text-emerald-600" />
                        <span>Disetujui</span>
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium">
                        Telah Terverifikasi
                      </span>
                    </div>
                  )}
                  {req.status === 'REJECTED' && (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
                        <XCircle className="h-3 w-3 text-rose-600" />
                        <span>Ditolak</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Permohonan Ditolak
                      </span>
                    </div>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right">
                  {req.status === 'PENDING' && canApprove ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onApprove(req.id)}
                        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-xs font-medium transition shadow-sm"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Setujui
                      </button>
                      <button
                        onClick={() => onReject(req.id)}
                        className="inline-flex items-center gap-1 bg-rose-100 hover:bg-rose-200 text-rose-700 px-2.5 py-1 rounded text-xs font-medium transition"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Tolak
                      </button>
                    </div>
                  ) : req.status === 'APPROVED' ? (
                    <span className="text-xs text-emerald-700 font-medium">Telah Sinkron Kehadiran</span>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
