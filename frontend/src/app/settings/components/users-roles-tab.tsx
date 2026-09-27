'use client';

import React from 'react';
import { UserCheck, Lock } from 'lucide-react';
import { Badge } from '@/components/ui';

interface UsersRolesTabProps {
  usersList: any[];
  rolesList: any[];
  onUpdateRole: (userId: string, newRoleId: string) => void;
}

export function UsersRolesTab({
  usersList,
  rolesList,
  onUpdateRole,
}: UsersRolesTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Daftar Pengguna & Penetapan Peran (Role Assignment)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Atur hak akses pengguna ke modul-modul sistem sesuai dengan tanggung jawab korporat.
            </p>
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            Total Akun: <strong className="text-gray-900">{usersList.length}</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4">Pengguna (Email)</th>
                <th className="py-3 px-4">Karyawan Terkait</th>
                <th className="py-3 px-4">Departemen / Jabatan</th>
                <th className="py-3 px-4">Peran (Role) Saat Ini</th>
                <th className="py-3 px-4 text-right">Ubah Peran Akses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/60 transition">
                  <td className="py-3.5 px-4 font-semibold text-gray-900">
                    <div>{u.email}</div>
                    <div className="text-[11px] text-gray-400 font-normal">
                      Dibuat: {new Date(u.createdAt).toLocaleDateString('id-ID')}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-700">
                    {u.employee ? (
                      <div className="font-medium text-gray-800">
                        {u.employee.fullName}
                        <span className="text-xs text-gray-400 block font-normal">
                          {u.employee.employeeCode}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Akun Sistem / Belum Terikat</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 text-xs">
                    {u.employee ? (
                      <>
                        <div className="font-medium text-gray-800">{u.employee.department?.name || 'Umum'}</div>
                        <div className="text-gray-400">{u.employee.position?.title || 'Staf'}</div>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="info">
                      <UserCheck className="h-3 w-3 mr-1 inline" />
                      {u.role?.name || 'staff'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <select
                      value={u.roleId}
                      onChange={(e) => onUpdateRole(u.id, e.target.value)}
                      className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 focus:border-indigo-500 focus:outline-none"
                    >
                      {rolesList.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.description})
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Matriks Peran & Hak Akses */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4 text-indigo-600" />
          Matriks Otorisasi Peran Sistem (Role-Based Access Control)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1">
            <span className="font-bold text-xs text-gray-900 block">super_admin</span>
            <p className="text-[11px] text-gray-500">
              Akses tak terbatas ke seluruh modul sistem, audit log, konfigurasi perusahaan, dan penggajian.
            </p>
          </div>
          <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1">
            <span className="font-bold text-xs text-gray-900 block">hr_admin</span>
            <p className="text-[11px] text-gray-500">
              Manajemen karyawan, absensi, approval cuti, dan persetujuan lembur staf.
            </p>
          </div>
          <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1">
            <span className="font-bold text-xs text-gray-900 block">finance</span>
            <p className="text-[11px] text-gray-500">
              Kalkulasi batch payroll, approval penggajian, penguncian periode, dan ekspor laporan keuangan.
            </p>
          </div>
          <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1">
            <span className="font-bold text-xs text-gray-900 block">staff (ESS)</span>
            <p className="text-[11px] text-gray-500">
              Portal mandiri: melihat slip gaji terenkripsi pribadi, absensi clock-in, pengajuan lembur, dan saldo cuti.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
