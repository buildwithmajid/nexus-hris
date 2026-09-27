'use client';

import React from 'react';
import {
  X,
  Shield,
  Eye,
  EyeOff,
  CreditCard,
  Building2,
  FileText,
  Download,
  CheckCircle2,
} from 'lucide-react';

interface Employee {
  id: string;
  fullName: string;
  employeeCode: string;
  nik?: string;
  npwp?: string;
  bpjsKesehatanNumber?: string;
  bpjsTkNumber?: string;
  maritalStatusPtkp: string;
  baseSalary: number;
  fixedAllowance: number;
  bankName?: string;
  bankAccountNumber?: string;
  contractType: string;
  employmentStatus: string;
  joinDate: string;
  position?: { title: string; level?: number };
  department?: { name: string };
}

interface EmployeeDetailDrawerProps {
  employee: Employee | null;
  isLoading: boolean;
  onClose: () => void;
  formatRupiah: (val?: number) => string;
  getTerBadge: (ptkp: string) => { text: string; color: string };
}

export function EmployeeDetailDrawer({
  employee,
  isLoading,
  onClose,
  formatRupiah,
  getTerBadge,
}: EmployeeDetailDrawerProps) {
  const [unmaskNik, setUnmaskNik] = React.useState(false);

  if (!employee) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 bg-navy text-white flex items-start justify-between border-b border-navy-surface">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-teal text-white flex items-center justify-center font-bold text-base shadow-sm">
              {employee.fullName
                .split(' ')
                .map((n: string) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">
                {employee.fullName}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-300 font-mono">
                  {employee.employeeCode}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-xs text-teal-300 font-medium">
                  {employee.position?.title || 'Posisi Terdaftar'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-navy-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-charcoal">
          <div className="flex flex-wrap gap-2 pb-3 border-b border-subtle-border">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-medium">
              {employee.employmentStatus === 'ACTIVE'
                ? 'Karyawan Aktif'
                : 'Non-Aktif'}
            </span>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-medium">
              {employee.contractType === 'PERMANENT'
                ? 'PKWTT (Tetap)'
                : 'PKWT (Kontrak)'}
            </span>
            <span
              className={`px-2.5 py-1 rounded font-semibold border ${getTerBadge(employee.maritalStatusPtkp).color}`}
            >
              PTKP: {employee.maritalStatusPtkp} (
              {getTerBadge(employee.maritalStatusPtkp).text})
            </span>
          </div>

          <div className="space-y-3 bg-canvas p-4 rounded-lg border border-subtle-border">
            <div className="flex items-center justify-between">
              <span className="font-bold text-navy uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal" />
                <span>Identitas Statuter & Pajak</span>
              </span>
              <button
                type="button"
                onClick={() => setUnmaskNik(!unmaskNik)}
                className="text-[10px] text-teal font-semibold hover:underline flex items-center gap-1"
              >
                {unmaskNik ? (
                  <EyeOff className="w-3 h-3" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
                <span>{unmaskNik ? 'Samarkan' : 'Buka Masking'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-[11px] text-steel block">
                  Nomor Induk Kependudukan (NIK)
                </span>
                <span className="font-mono font-medium text-slate-800 text-xs">
                  {unmaskNik
                    ? employee.nik || '3171012805900001'
                    : `${(employee.nik || '317101').substring(0, 6)}••••••••••`}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-steel block">
                  NPWP (15/16 Digit)
                </span>
                <span className="font-mono font-medium text-slate-800 text-xs">
                  {unmaskNik
                    ? employee.npwp || '08.111.452.1-013.000'
                    : `${(employee.npwp || '08.111').substring(0, 6)}•••••••••`}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-steel block">
                  Nomor BPJS Kesehatan
                </span>
                <span className="font-mono text-slate-800 font-medium">
                  {employee.bpjsKesehatanNumber || '000184920101'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-steel block">
                  Nomor BPJS Ketenagakerjaan
                </span>
                <span className="font-mono text-slate-800 font-medium">
                  {employee.bpjsTkNumber || '22081940101'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[11px] text-steel leading-relaxed">
              Status <strong className="text-charcoal">{employee.maritalStatusPtkp}</strong> dikenakan tarif efektif bulanan{' '}
              <strong>{getTerBadge(employee.maritalStatusPtkp).text}</strong> sesuai PMK 168/2023.
            </div>
          </div>

          <div className="space-y-3 bg-canvas p-4 rounded-lg border border-subtle-border">
            <span className="font-bold text-navy uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-teal" />
              <span>Kompensasi & Bank Payroll</span>
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-[11px] text-steel block">
                  Gaji Pokok Bulanan
                </span>
                <span className="font-bold text-charcoal text-sm tabular-nums">
                  {formatRupiah(employee.baseSalary)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-steel block">
                  Tunjangan Tetap
                </span>
                <span className="font-semibold text-slate-700 tabular-nums">
                  {formatRupiah(employee.fixedAllowance)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-steel block">
                  Bank Penyalur
                </span>
                <span className="font-medium text-slate-800">
                  {employee.bankName || 'Bank Central Asia (BCA)'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-steel block">
                  Nomor Rekening Bank
                </span>
                <span className="font-mono font-medium text-slate-800">
                  {unmaskNik
                    ? employee.bankAccountNumber || '5271801507'
                    : `${(employee.bankAccountNumber || '5271').substring(0, 4)}••••••`}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-canvas p-4 rounded-lg border border-subtle-border">
            <span className="font-bold text-navy uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal" />
              <span>Informasi Organisasi & Cuti</span>
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-[11px] text-steel block">Departemen</span>
                <span className="font-medium text-slate-800">
                  {employee.department?.name || 'Departemen Terdaftar'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-steel block">Level Jabatan</span>
                <span className="font-medium text-slate-800">
                  Level {employee.position?.level || 1}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-steel block">
                  Tanggal Mulai Bekerja
                </span>
                <span className="font-medium text-slate-800">
                  {new Date(employee.joinDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-steel block">
                  Hak Cuti Tahunan 2026
                </span>
                <span className="font-bold text-emerald-700">
                  12 Hari Tersedia
                </span>
              </div>
            </div>
          </div>

          {/* Dokumen & Berkas Karyawan (Digital Repository) */}
          <div className="space-y-3 bg-canvas p-4 rounded-lg border border-subtle-border">
            <span className="font-bold text-navy uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal" />
              <span>Arsip Berkas Digital & Kontrak (UU PDP)</span>
            </span>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between p-2 bg-white rounded border border-subtle-border">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-medium text-slate-800">Scan KTP & Kartu Identitas</span>
                </div>
                <span className="text-[10px] text-teal font-medium hover:underline cursor-pointer flex items-center gap-1">
                  <Download className="w-3 h-3" /> Unduh
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-white rounded border border-subtle-border">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-medium text-slate-800">Kartu Pokok Wajib Pajak (NPWP)</span>
                </div>
                <span className="text-[10px] text-teal font-medium hover:underline cursor-pointer flex items-center gap-1">
                  <Download className="w-3 h-3" /> Unduh
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-white rounded border border-subtle-border">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-medium text-slate-800">
                    Perjanjian Kerja ({employee.contractType === 'PERMANENT' ? 'PKWTT' : 'PKWT'})
                  </span>
                </div>
                <span className="text-[10px] text-teal font-medium hover:underline cursor-pointer flex items-center gap-1">
                  <Download className="w-3 h-3" /> Unduh
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-canvas border-t border-subtle-border flex items-center justify-between">
          <span className="text-[10px] text-steel">
            Terenkripsi AES-256-GCM (ISO 27001 Ready)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-navy hover:bg-navy-hover text-white text-xs font-semibold rounded transition-colors"
          >
            Tutup Panel
          </button>
        </div>
      </div>
    </div>
  );
}
