'use client';

import React from 'react';
import { DollarSign, CheckCircle, Building2, ShieldCheck, Info } from 'lucide-react';

interface ReportCostSummaryProps {
  costs: any;
  summaryData: any;
  att: any;
  formatRupiah: (val: number) => string;
}

export function ReportCostSummary({ costs, summaryData, att, formatRupiah }: ReportCostSummaryProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Beban Ketenagakerjaan</span>
            <DollarSign className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 tabular-nums">
            {formatRupiah(costs.totalCompanyCost)}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Gaji Bruto + BPJS Perusahaan
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Total Gaji Bersih (Net)</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 tabular-nums">
            {formatRupiah(costs.totalNetSalary)}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Diterima {summaryData?.periodInfo?.headcount || 0} karyawan aktif
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Setoran PPh 21 TER</span>
            <Building2 className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 tabular-nums">
            {formatRupiah(costs.totalPph21Amount)}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            PMK 168/2023 ke kas negara
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Iuran BPJS Gabungan</span>
            <ShieldCheck className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-700 tabular-nums">
            {formatRupiah((costs.totalBpjsCompany || 0) + (costs.totalBpjsEmployee || 0))}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Perusahaan ({formatRupiah(costs.totalBpjsCompany)})
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">
            Rincian Alokasi Biaya Penggajian (Payroll Breakdown)
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="h-3 w-3 rounded-full bg-indigo-600 shrink-0" />
                <span>Total Gaji Pokok Karyawan</span>
              </div>
              <div className="text-sm font-semibold text-gray-900 tabular-nums">
                {formatRupiah(costs.totalBaseSalary)}
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="h-3 w-3 rounded-full bg-sky-500 shrink-0" />
                <span>Total Tunjangan Tetap</span>
              </div>
              <div className="text-sm font-semibold text-gray-900 tabular-nums">
                {formatRupiah(costs.totalFixedAllowance)}
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="h-3 w-3 rounded-full bg-amber-500 shrink-0" />
                <span>Upah Lembur (Kepmenaker 102/2004)</span>
              </div>
              <div className="text-sm font-semibold text-gray-900 tabular-nums">
                {formatRupiah(costs.totalOvertimeAmount)}
              </div>
            </div>

            <div className="flex justify-between items-center py-2.5 bg-gray-50/80 px-3 rounded-lg">
              <span className="text-sm font-bold text-gray-800">
                Total Penghasilan Bruto (Gross Income)
              </span>
              <span className="text-sm font-bold text-gray-900 tabular-nums">
                {formatRupiah(costs.totalGrossIncome)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="h-3 w-3 rounded-full bg-emerald-600 shrink-0" />
                <span>Iuran BPJS Ditanggung Perusahaan</span>
              </div>
              <div className="text-sm font-semibold text-emerald-800 tabular-nums">
                {formatRupiah(costs.totalBpjsCompany)}
              </div>
            </div>

            <div className="flex justify-between items-center py-3 bg-indigo-50/70 border border-indigo-100 px-4 rounded-xl">
              <div>
                <span className="text-sm font-bold text-indigo-950 block">
                  Total Beban Ketenagakerjaan Perusahaan
                </span>
                <span className="text-xs text-indigo-700">Total Employer Payroll Cost</span>
              </div>
              <span className="text-lg font-bold text-indigo-900 tabular-nums">
                {formatRupiah(costs.totalCompanyCost)}
              </span>
            </div>
          </div>

          {costs.totalGrossIncome > 0 && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Komposisi Penghasilan Bruto
              </div>
              <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex">
                <div
                  style={{
                    width: `${Math.round((costs.totalBaseSalary / costs.totalGrossIncome) * 100)}%`,
                  }}
                  className="bg-indigo-600 h-full"
                  title={`Gaji Pokok: ${Math.round((costs.totalBaseSalary / costs.totalGrossIncome) * 100)}%`}
                />
                <div
                  style={{
                    width: `${Math.round((costs.totalFixedAllowance / costs.totalGrossIncome) * 100)}%`,
                  }}
                  className="bg-sky-500 h-full"
                  title={`Tunjangan: ${Math.round((costs.totalFixedAllowance / costs.totalGrossIncome) * 100)}%`}
                />
                <div
                  style={{
                    width: `${Math.round((costs.totalOvertimeAmount / costs.totalGrossIncome) * 100)}%`,
                  }}
                  className="bg-amber-500 h-full"
                  title={`Lembur: ${Math.round((costs.totalOvertimeAmount / costs.totalGrossIncome) * 100)}%`}
                />
              </div>
              <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-600" />
                  <span>Pokok ({Math.round((costs.totalBaseSalary / costs.totalGrossIncome) * 100)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  <span>Tunjangan ({Math.round((costs.totalFixedAllowance / costs.totalGrossIncome) * 100)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Lembur ({Math.round((costs.totalOvertimeAmount / costs.totalGrossIncome) * 100)}%)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
              <span>Rasio Kehadiran Bulanan</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {att.attendanceRatePercentage || 100}%
              </span>
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Hadir Tepat Waktu (Present)
                </span>
                <span className="font-semibold text-gray-900 tabular-nums">
                  {att.present || 0} hari
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Terlambat Masuk (Late)
                </span>
                <span className="font-semibold text-gray-900 tabular-nums">
                  {att.late || 0} hari
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Cuti Disetujui (On Leave)
                </span>
                <span className="font-semibold text-gray-900 tabular-nums">
                  {att.onLeave || 0} hari
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  Sakit Surat Dokter (Sick)
                </span>
                <span className="font-semibold text-gray-900 tabular-nums">
                  {att.sick || 0} hari
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Mangkir / Alpha (Absent)
                </span>
                <span className="font-semibold text-rose-700 tabular-nums">
                  {att.absent || 0} hari
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600">
            <div className="flex items-center gap-2 font-semibold text-gray-800 mb-1">
              <Info className="h-4 w-4 text-indigo-600 shrink-0" />
              Keterangan Kepatuhan:
            </div>
            Data kehadiran terhubung langsung dengan engine payroll untuk mencegah potongan pinalti pada hari cuti sah.
          </div>
        </div>
      </div>
    </>
  );
}
