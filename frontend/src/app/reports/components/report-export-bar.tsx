'use client';

import React from 'react';
import { Download, Calendar, Printer } from 'lucide-react';

interface ReportExportBarProps {
  monthNames: string[];
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (value: number) => void;
  setSelectedYear: (value: number) => void;
  handleExportCsv: () => void;
  handlePrint: () => void;
}

export function ReportExportBar({
  monthNames,
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear,
  handleExportCsv,
  handlePrint
}: ReportExportBarProps) {
  return (
    <div className="print:hidden flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <span className="h-7 w-7 text-indigo-600">📊</span>
          Laporan & Analitik Ketenagakerjaan
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Konsolidasi beban biaya ketenagakerjaan, audit setoran pajak PPh 21 TER, dan jaminan sosial BPJS.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-1.5 shadow-sm text-sm">
          <Calendar className="h-4 w-4 text-gray-500" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="font-medium text-gray-800 bg-transparent border-none focus:outline-none cursor-pointer"
          >
            {monthNames.map((m, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>
          <span className="text-gray-300">|</span>
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
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
        >
          <Download className="h-4 w-4 text-gray-600" />
          Ekspor CSV
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
        >
          <Printer className="h-4 w-4" />
          Cetak Laporan
        </button>
      </div>
    </div>
  );
}
