'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useReportsData } from './hooks/use-reports-data';
import { useReportExport } from './hooks/use-report-export';
import { ReportCostSummary } from './components/report-cost-summary';
import { ReportDivisionTable } from './components/report-division-table';
import { ReportStatutoryTable } from './components/report-statutory-table';
import { ReportExportBar } from './components/report-export-bar';

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export default function ReportsPage() {
  const { hasPermission } = useAuth();

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'summary' | 'bpjs' | 'departments' | 'trend'>('summary');

  const { summaryData, trendData, isLoading, errorMessage } = useReportsData(selectedMonth, selectedYear);
  const { exportCsv, printReport } = useReportExport();

  const handleExportCsv = () => {
    exportCsv(summaryData, selectedMonth, selectedYear);
  };

  const handlePrint = () => {
    printReport();
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const costs = summaryData?.costs || {};
  const bpjs = summaryData?.bpjsBreakdown || {};
  const att = summaryData?.attendanceSummary || {};
  const depts = summaryData?.departmentBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Printable Executive Document Header (Visible only in Print) */}
      <div className="hidden print:block border-b-2 border-gray-900 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tight text-gray-900">
              {summaryData?.periodInfo?.companyName || 'PT Nusantara Digital Solusi'}
            </h1>
            <p className="text-xs text-gray-600">
              Laporan Analitik Eksekutif Penggajian, Perpajakan PPh 21 TER, & Beban Jaminan Sosial
            </p>
          </div>
          <div className="text-right text-xs text-gray-600">
            <div><strong>Periode:</strong> {monthNames[selectedMonth - 1]} {selectedYear}</div>
            <div><strong>Status Payroll:</strong> {summaryData?.periodInfo?.status || 'N/A'}</div>
            <div><strong>Tanggal Cetak:</strong> {new Date().toLocaleDateString('id-ID')}</div>
          </div>
        </div>
      </div>

      <ReportExportBar
        monthNames={monthNames}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        setSelectedMonth={setSelectedMonth}
        setSelectedYear={setSelectedYear}
        handleExportCsv={handleExportCsv}
        handlePrint={handlePrint}
      />

      {errorMessage && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 flex items-center gap-3 text-rose-800 text-sm">
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs Menu (Screen Only) */}
      <div className="print:hidden border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 transition ${
              activeTab === 'summary'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Ringkasan Biaya Penggajian
          </button>

          <button
            onClick={() => setActiveTab('bpjs')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 transition ${
              activeTab === 'bpjs'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Matriks Jaminan Sosial BPJS
          </button>

          <button
            onClick={() => setActiveTab('departments')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 transition ${
              activeTab === 'departments'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Distribusi Divisi / Departemen
          </button>

          <button
            onClick={() => setActiveTab('trend')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 transition ${
              activeTab === 'trend'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Tren Biaya Tahunan ({selectedYear})
          </button>
        </nav>
      </div>

      {/* TAB 1: Ringkasan Biaya & Visual Bar Komposisi */}
      {(activeTab === 'summary' || typeof window === 'undefined') && (
        <ReportCostSummary
          costs={costs}
          summaryData={summaryData}
          att={att}
          formatRupiah={formatRupiah}
        />
      )}

      {/* TAB 2: Matriks Jaminan Sosial BPJS */}
      {(activeTab === 'bpjs' || typeof window === 'undefined') && (
        <ReportStatutoryTable
          bpjs={bpjs}
          costs={costs}
          formatRupiah={formatRupiah}
        />
      )}

      {/* TAB 3: Distribusi Departemen */}
      {(activeTab === 'departments' || typeof window === 'undefined') && (
        <ReportDivisionTable
          depts={depts}
          formatRupiah={formatRupiah}
        />
      )}

      {/* TAB 4: Tren Biaya Tahunan (12 Bulan) */}
      {(activeTab === 'trend' || typeof window === 'undefined') && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="border-b border-gray-100 pb-3 mb-5">
            <h2 className="text-base font-semibold text-gray-900">
              Tren Biaya Penggajian Bulanan Tahun {selectedYear}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Historis beban ketenagakerjaan, total take-home pay, dan setoran pajak PPh 21 dari Januari s/d Desember.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Bulan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Headcount</th>
                  <th className="py-3 px-4 text-right">Total Gaji Bruto</th>
                  <th className="py-3 px-4 text-right">PPh 21 Disetor</th>
                  <th className="py-3 px-4 text-right">Gaji Bersih (Net)</th>
                  <th className="py-3 px-4 text-right">Total Beban Perusahaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trendData?.monthlyTrends?.map((m: any) => (
                  <tr
                    key={m.month}
                    className={`hover:bg-gray-50/60 transition ${
                      m.month === selectedMonth ? 'bg-indigo-50/40 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {m.monthName}
                      {m.month === selectedMonth && (
                        <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                          Aktif
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {m.status === 'LOCKED' && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          LOCKED
                        </span>
                      )}
                      {m.status === 'APPROVED' && (
                        <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">
                          APPROVED
                        </span>
                      )}
                      {m.status === 'DRAFT' && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                          DRAFT
                        </span>
                      )}
                      {m.status === 'EMPTY' && (
                        <span className="text-[10px] text-gray-400">Belum diproses</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center tabular-nums text-gray-700">
                      {m.headcount}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-gray-800">
                      {formatRupiah(m.totalGross)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-amber-700">
                      {formatRupiah(m.totalPph21)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-emerald-700">
                      {formatRupiah(m.totalNet)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-indigo-900">
                      {formatRupiah(m.totalCompanyCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
