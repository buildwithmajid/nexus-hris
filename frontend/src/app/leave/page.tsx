'use client';

import React, { useState } from 'react';
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Users,
  Calendar,
  Sparkles,
  Info,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useLeaveData } from './hooks/use-leave-data';
import { useLeaveOperations } from './hooks/use-leave-operations';
import { LeaveBalancesCard } from './components/leave-balances-card';
import { LeaveRequestTable } from './components/leave-request-table';
import { LeaveRequestForm } from './components/leave-request-form';

export default function LeaveManagementPage() {
  const { hasPermission } = useAuth();
  const canApprove = hasPermission('leave.approve');

  const [activeTab, setActiveTab] = useState<'requests' | 'apply' | 'balances' | 'my-requests'>('requests');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const {
    leaveTypes,
    leaveBalances,
    leaveRequests,
    myBalances,
    myRequests,
    employees,
    isLoading,
    actionError: serverError,
    setActionError: setServerError,
    loadData,
  } = useLeaveData(selectedYear);

  const {
    isSubmitting,
    actionSuccess,
    actionError: opError,
    setActionSuccess,
    setActionError: setOpError,
    handleApprove,
    handleReject,
    handleCreateRequest,
  } = useLeaveOperations(loadData);

  const actionError = serverError || opError;

  const pendingCount = leaveRequests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = leaveRequests.filter((r) => r.status === 'APPROVED').length;
  const totalEmployeesWithBalance = leaveBalances.length;

  const handleFormSubmit = async (payload: {
    employeeId?: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
  }) => {
    setOpError('');
    setActionSuccess('');
    const success = await handleCreateRequest(payload);
    return success;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Manajemen Cuti & Izin Kerja
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola saldo cuti statutory tahunan, pengajuan izin, dan verifikasi persetujuan HR.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-1.5 shadow-sm text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 font-medium">Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="font-semibold text-gray-800 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              {[2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setActiveTab('apply')}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
          >
            <Send className="h-4 w-4" />
            Ajukan Cuti
          </button>
        </div>
      </div>

      {/* Banner Notifikasi */}
      {actionSuccess && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-center justify-between text-emerald-800 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess('')}
            className="text-emerald-700 hover:text-emerald-900 font-medium text-xs ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {actionError && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 flex items-center justify-between text-rose-800 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => {
              setOpError('');
              setServerError('');
            }}
            className="text-rose-700 hover:text-rose-900 font-medium text-xs ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Menunggu Approval
            </div>
            <div className="text-2xl font-bold text-gray-900 tabular-nums mt-0.5">
              {pendingCount}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Cuti Disetujui
            </div>
            <div className="text-2xl font-bold text-gray-900 tabular-nums mt-0.5">
              {approvedCount}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Karyawan Bersaldo
            </div>
            <div className="text-2xl font-bold text-gray-900 tabular-nums mt-0.5">
              {totalEmployeesWithBalance}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
            <CalendarCheck className="h-6 w-6 text-sky-600" />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Tipe Cuti Terdaftar
            </div>
            <div className="text-2xl font-bold text-gray-900 tabular-nums mt-0.5">
              {leaveTypes.length}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 transition ${
              activeTab === 'requests'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Clock className="h-4 w-4" />
            Antrean Persetujuan
            {pendingCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('apply')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 transition ${
              activeTab === 'apply'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Send className="h-4 w-4" />
            Formulir Pengajuan Cuti
          </button>

          <button
            onClick={() => setActiveTab('balances')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 transition ${
              activeTab === 'balances'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-4 w-4" />
            Rekap Saldo Karyawan
          </button>

          <button
            onClick={() => setActiveTab('my-requests')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 transition ${
              activeTab === 'my-requests'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4" />
            Riwayat Pribadi ({myRequests.length})
          </button>
        </nav>
      </div>

      {/* TAB CONTENT 1: Antrean Persetujuan Cuti */}
      {activeTab === 'requests' && (
        <LeaveRequestTable
          requests={leaveRequests}
          isLoading={isLoading}
          canApprove={canApprove}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* TAB CONTENT 2: Formulir Pengajuan Cuti */}
      {activeTab === 'apply' && (
        <LeaveRequestForm
          employees={employees}
          leaveTypes={leaveTypes}
          isSubmitting={isSubmitting}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* TAB CONTENT 3: Rekapitulasi Saldo Karyawan */}
      {activeTab === 'balances' && <LeaveBalancesCard balances={leaveBalances} isLoading={isLoading} />}

      {/* TAB CONTENT 4: Riwayat Pengajuan Pribadi */}
      {activeTab === 'my-requests' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">
              Riwayat Pengajuan Cuti Pribadi Saya
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Status permohonan cuti dan izin yang Anda ajukan untuk periode {selectedYear}.
            </p>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-sm text-gray-500">Memuat riwayat permohonan cuti Anda...</div>
          ) : myRequests.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarCheck className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <div className="text-sm font-medium text-gray-700">Belum ada pengajuan cuti pribadi</div>
              <p className="text-xs text-gray-500 mt-1">
                Gunakan tab "Formulir Pengajuan Cuti" untuk mengajukan izin atau cuti baru.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Jenis Cuti</th>
                    <th className="py-3 px-4">Tanggal Mulai</th>
                    <th className="py-3 px-4">Tanggal Selesai</th>
                    <th className="py-3 px-4 text-center">Durasi</th>
                    <th className="py-3 px-4">Alasan</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4 font-medium text-gray-900">
                        {req.leaveType?.name}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                        {new Date(req.startDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                        {new Date(req.endDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-gray-800 tabular-nums">
                        {req.totalDays} Hari
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {req.reason}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {req.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                            <Clock className="h-3 w-3" /> Menunggu Review
                          </span>
                        )}
                        {req.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                            <CheckCircle className="h-3 w-3" /> Disetujui
                          </span>
                        )}
                        {req.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
                            <XCircle className="h-3 w-3" /> Ditolak
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

