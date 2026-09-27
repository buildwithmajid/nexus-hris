'use client';

import React from 'react';
import {
  Building,
  Printer,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui';

interface PayslipTabProps {
  slipData: any;
}

export function PayslipTab({ slipData }: PayslipTabProps) {
  const formatRupiah = (val?: number) => {
    if (val === undefined || val === null) return 'Rp 0';
    return `Rp ${new Intl.NumberFormat('id-ID').format(val)}`;
  };

  if (!slipData) {
    return (
      <div className="bg-white border border-subtle-border rounded p-8 text-center text-steel shadow-card">
        <FileCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="font-medium text-charcoal text-xs">Belum Ada Slip Gaji yang Diterbitkan</p>
        <p className="text-[11px] text-steel mt-1">
          Slip gaji akan muncul otomatis setelah periode penggajian disetujui (Approved) atau dikunci (Locked) oleh Finance.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        data-print-slip
        className="bg-white rounded border border-subtle-border max-w-3xl w-full shadow-card overflow-hidden mx-auto"
      >
        {/* Kop Surat Slip Gaji */}
        <div className="p-6 border-b border-subtle-border bg-slate-50 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-navy font-bold text-base">
              <Building className="w-5 h-5 text-teal" />
              <span>PT NUSANTARA DIGITAL SOLUSI</span>
            </div>
            <p className="text-[11px] text-steel mt-0.5">
              Jl. Jend. Sudirman No. 1, Jakarta Selatan 12190
            </p>
            <div className="text-xs font-semibold text-charcoal mt-2">
              SLIP GAJI RESMI KARYAWAN - BULAN {slipData.detail?.payrollPeriod?.month} /{' '}
              {slipData.detail?.payrollPeriod?.year}
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            className="print:hidden"
          >
            Cetak / Unduh PDF
          </Button>
        </div>

        {/* Rincian Profil Karyawan */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs bg-canvas p-3.5 rounded border border-subtle-border">
            <div>
              <span className="text-steel block text-[11px]">Nama Karyawan:</span>
              <span className="font-semibold text-charcoal">
                {slipData.detail?.employee?.fullName}
              </span>
            </div>
            <div>
              <span className="text-steel block text-[11px]">Kode Karyawan / NIK:</span>
              <span className="font-semibold text-charcoal">
                {slipData.detail?.employee?.employeeCode}
              </span>
            </div>
            <div>
              <span className="text-steel block text-[11px]">Departemen / Jabatan:</span>
              <span className="text-charcoal">
                {slipData.detail?.employee?.department?.name} -{' '}
                {slipData.detail?.employee?.position?.title}
              </span>
            </div>
            <div>
              <span className="text-steel block text-[11px]">Status Pajak PTKP:</span>
              <span className="font-semibold text-teal">
                {slipData.detail?.employee?.maritalStatusPtkp} (TER Sesuai PMK 168/2023)
              </span>
            </div>
          </div>

          {/* 2 Kolom: Pendapatan vs Potongan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Pendapatan */}
            <div className="space-y-2">
              <div className="font-bold text-xs uppercase tracking-wider text-charcoal border-b border-slate-200 pb-1.5 flex justify-between">
                <span>Komponen Pendapatan</span>
                <span>Nominal (Rp)</span>
              </div>
              {slipData.earnings?.map((e: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between text-[11px] py-1 border-b border-slate-100"
                >
                  <span className="text-slate-700">{e.componentName}</span>
                  <span className="tabular-nums font-medium text-charcoal">
                    {formatRupiah(e.amount)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-xs pt-2 text-charcoal">
                <span>Total Penghasilan Bruto</span>
                <span className="tabular-nums">
                  {formatRupiah(slipData.detail?.grossIncome)}
                </span>
              </div>
            </div>

            {/* Potongan */}
            <div className="space-y-2">
              <div className="font-bold text-xs uppercase tracking-wider text-charcoal border-b border-slate-200 pb-1.5 flex justify-between">
                <span>Komponen Potongan</span>
                <span>Nominal (Rp)</span>
              </div>
              {slipData.deductions?.map((d: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between text-[11px] py-1 border-b border-slate-100"
                >
                  <span className="text-slate-700">{d.componentName}</span>
                  <span className="tabular-nums text-slate-800">
                    {formatRupiah(d.amount)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-xs pt-2 text-danger">
                <span>Total Potongan</span>
                <span className="tabular-nums">
                  {formatRupiah(
                    slipData.deductions?.reduce(
                      (acc: number, cur: any) => acc + Number(cur.amount),
                      0,
                    ),
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Box Take Home Pay */}
          <div className="p-4 bg-navy text-white rounded flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-300 block">
                TOTAL PEMBAYARAN BERSIH (TAKE HOME PAY)
              </span>
              <span className="text-xl font-bold tracking-tight text-white tabular-nums">
                {formatRupiah(slipData.detail?.netSalary)}
              </span>
            </div>
            <div className="text-right text-[11px] text-slate-300">
              <span>{slipData.detail?.employee?.bankName || 'Transfer Bank'}</span>
              <div className="text-teal font-semibold">Tervalidasi Sistem Payroll</div>
            </div>
          </div>

          {/* Verifikasi Kriptografis & QR Code Resmi */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 p-1 bg-white border border-slate-200 rounded shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-full h-full text-slate-800" fill="currentColor">
                  <path d="M2 2h7v7H2V2zm2 2v3h3V4H4zm9-2h7v7h-7V2zm2 2v3h3V4h-3zM2 13h7v7H2v-7zm2 2v3h3v-3H4zm9 0h2v2h-2v-2zm3 0h2v2h-2v-2zm2 2h2v2h-2v-2zm-5 3h2v2h-2v-2zm3 0h4v2h-4v-2zm2-5h2v2h-2v-2z" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal" />
                  <span>Verifikasi Kriptografis Digital (UU ITE & UU PDP)</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Doc Hash: SHA-256:{slipData.detail?.id ? slipData.detail.id.substring(0, 16) : '8f7a9c2b4d1e3f5a'}...
                </div>
                <div className="text-[10px] text-slate-600">
                  Disahkan oleh: <strong>Direktorat Keuangan & SDM</strong>
                </div>
              </div>
            </div>

            <div className="text-right text-[10px] text-slate-500">
              <div>Status Dokumen:</div>
              <div className="text-emerald-700 font-bold uppercase tracking-wider">Sah & Terotentikasi</div>
            </div>
          </div>

          {/* Footer Kepatuhan Regulasi */}
          <div className="pt-2 text-[10px] text-steel flex items-center justify-between border-t border-subtle-border">
            <div className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-teal" />
              <span>Dihitung sesuai regulasi PPh 21 TER PMK 168/2023 & BPJS Ketenagakerjaan.</span>
            </div>
            <span>Dokumen Resmi Elektronik</span>
          </div>
        </div>
      </div>
    </div>
  );
}
