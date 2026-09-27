'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as ArrowRightIcon,
} from 'lucide-react';

interface Employee {
  id: string;
  fullName: string;
  employeeCode: string;
  maritalStatusPtkp: string;
  baseSalary: number;
  fixedAllowance: number;
  employmentStatus: string;
  position?: { title: string };
  department?: { name: string };
}

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onRowClick: (emp: Employee) => void;
  formatRupiah: (val?: number) => string;
  getTerBadge: (ptkp: string) => { text: string; color: string };
}

export function EmployeeTable({
  employees,
  isLoading,
  page,
  totalPages,
  total,
  onPageChange,
  onRowClick,
  formatRupiah,
  getTerBadge,
}: EmployeeTableProps) {
  return (
    <div className="bg-white border border-subtle-border rounded-lg shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-canvas border-b border-subtle-border text-[11px] font-semibold text-steel uppercase tracking-wider">
              <th className="py-3 px-4">Karyawan</th>
              <th className="py-3 px-4">Departemen & Jabatan</th>
              <th className="py-3 px-4">Status PTKP</th>
              <th className="py-3 px-4 text-right">Gaji Pokok</th>
              <th className="py-3 px-4 text-right">Tunjangan Tetap</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-subtle-border">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-steel">
                  <div className="inline-block animate-spin w-5 h-5 border-2 border-teal border-t-transparent rounded-full mb-2" />
                  <div>Memuat data master karyawan...</div>
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-steel">
                  Tidak ada data karyawan yang sesuai filter.
                </td>
              </tr>
            ) : (
              employees.map((emp) => {
                const ter = getTerBadge(emp.maritalStatusPtkp);
                return (
                  <tr
                    key={emp.id}
                    onClick={() => onRowClick(emp)}
                    className="table-row-hover cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-navy shrink-0 group-hover:bg-teal group-hover:text-white transition-colors">
                          {emp.fullName
                            .split(' ')
                            .map((n: string) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-charcoal group-hover:text-teal transition-colors">
                            {emp.fullName}
                          </div>
                          <div className="text-[11px] text-steel font-mono">
                            {emp.employeeCode}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">
                        {emp.position?.title || 'Posisi Terdaftar'}
                      </div>
                      <div className="text-[11px] text-steel">
                        {emp.department?.name || 'Departemen'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-charcoal">
                          {emp.maritalStatusPtkp}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${ter.color}`}
                        >
                          {ter.text}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-semibold text-charcoal tabular-nums">
                      {formatRupiah(emp.baseSalary)}
                    </td>

                    <td className="py-3 px-4 text-right text-slate-600 tabular-nums">
                      {formatRupiah(emp.fixedAllowance)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-medium border rounded ${
                          emp.employmentStatus === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {emp.employmentStatus === 'ACTIVE'
                          ? 'Aktif'
                          : 'Non-Aktif'}
                      </span>
                    </td>

                    <td
                      className="py-3 px-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onRowClick(emp)}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-teal hover:text-white border border-slate-200 hover:border-teal rounded text-[11px] font-medium text-slate-700 transition-colors inline-flex items-center gap-1"
                      >
                        <span>Detail</span>
                        <ArrowRightIcon className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-canvas border-t border-subtle-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-steel">
        <div>
          Menampilkan <span className="font-semibold text-charcoal">{employees.length}</span> dari{' '}
          <span className="font-semibold text-charcoal">{total}</span> data karyawan
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1 || isLoading}
            className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-medium">Sebelumnya</span>
          </button>

          <span className="px-3 py-1 bg-white border border-slate-200 rounded font-medium text-charcoal">
            Halaman {page} dari {totalPages || 1}
          </span>

          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || isLoading}
            className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <span className="hidden sm:inline text-xs font-medium">Berikutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
