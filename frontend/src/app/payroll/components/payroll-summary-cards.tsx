'use client';

import React from 'react';

interface PayrollSummaryCardsProps {
  periodDetail: any;
}

export function PayrollSummaryCards({ periodDetail }: PayrollSummaryCardsProps) {
  const formatRupiah = (val?: number) => {
    if (val === undefined || val === null) return 'Rp 0';
    return `Rp ${new Intl.NumberFormat('id-ID').format(val)}`;
  };

  if (!periodDetail) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div className="bg-white border border-subtle-border rounded p-3.5 shadow-card">
        <span className="text-[11px] font-medium text-steel">Total Penghasilan Bruto</span>
        <div className="text-xl font-bold text-charcoal mt-1 tabular-nums">
          {formatRupiah(periodDetail.summary?.totalGross)}
        </div>
      </div>

      <div className="bg-white border border-subtle-border rounded p-3.5 shadow-card">
        <span className="text-[11px] font-medium text-steel">Potongan BPJS Karyawan</span>
        <div className="text-xl font-bold text-charcoal mt-1 tabular-nums">
          {formatRupiah(periodDetail.summary?.totalBpjsEmployee)}
        </div>
        <span className="text-[10px] text-slate-400">Kes 1% + JHT/JP 3%</span>
      </div>

      <div className="bg-white border border-subtle-border rounded p-3.5 shadow-card">
        <span className="text-[11px] font-medium text-steel">Potongan PPh 21 TER</span>
        <div className="text-xl font-bold text-charcoal mt-1 tabular-nums">
          {formatRupiah(periodDetail.summary?.totalPph21)}
        </div>
        <span className="text-[10px] text-emerald-600">PMK 168/2023 Valid</span>
      </div>

      <div className="bg-white border border-subtle-border rounded p-3.5 shadow-card">
        <span className="text-[11px] font-medium text-steel">Total Pengeluaran Bersih (Net)</span>
        <div className="text-xl font-bold text-navy mt-1 tabular-nums">
          {formatRupiah(periodDetail.summary?.totalNet)}
        </div>
        <span className="text-[10px] text-slate-500">Disbursed to Bank</span>
      </div>
    </div>
  );
}
