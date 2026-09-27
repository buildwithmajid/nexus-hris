'use client';

import React from 'react';

interface ReportStatutoryTableProps {
  bpjs: any;
  costs: any;
  formatRupiah: (val: number) => string;
}

export function ReportStatutoryTable({ bpjs, costs, formatRupiah }: ReportStatutoryTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Matriks Kontribusi Jaminan Sosial Ketenagakerjaan & Kesehatan
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit kewajiban iuran BPJS Kesehatan (UU 24/2011) dan BPJS Ketenagakerjaan (PP 44/2015 & PP 45/2015).
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="py-3 px-4">Program Jaminan</th>
              <th className="py-3 px-4">Regulasi Tarif</th>
              <th className="py-3 px-4 text-right">Porsi Perusahaan</th>
              <th className="py-3 px-4 text-right">Porsi Karyawan</th>
              <th className="py-3 px-4 text-right">Total Iuran Disetor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50/60 transition">
              <td className="py-3.5 px-4 font-semibold text-gray-900">
                BPJS Kesehatan
                <span className="block text-xs font-normal text-gray-400">
                  Batas atas upah Rp12.000.000
                </span>
              </td>
              <td className="py-3.5 px-4 text-gray-600">
                Perusahaan 4.0% • Karyawan 1.0%
              </td>
              <td className="py-3.5 px-4 text-right font-medium text-gray-800 tabular-nums">
                {formatRupiah(bpjs.kesehatanCompany)}
              </td>
              <td className="py-3.5 px-4 text-right font-medium text-gray-800 tabular-nums">
                {formatRupiah(bpjs.kesehatanEmployee)}
              </td>
              <td className="py-3.5 px-4 text-right font-bold text-gray-900 tabular-nums">
                {formatRupiah((bpjs.kesehatanCompany || 0) + (bpjs.kesehatanEmployee || 0))}
              </td>
            </tr>

            <tr className="hover:bg-gray-50/60 transition">
              <td className="py-3.5 px-4 font-semibold text-gray-900">
                Jaminan Hari Tua (JHT)
                <span className="block text-xs font-normal text-gray-400">
                  Akumulasi tabungan pensiun
                </span>
              </td>
              <td className="py-3.5 px-4 text-gray-600">
                Perusahaan 3.7% • Karyawan 2.0%
              </td>
              <td className="py-3.5 px-4 text-right font-medium text-gray-800 tabular-nums">
                {formatRupiah(bpjs.jhtCompany)}
              </td>
              <td className="py-3.5 px-4 text-right font-medium text-gray-800 tabular-nums">
                {formatRupiah(bpjs.jhtEmployee)}
              </td>
              <td className="py-3.5 px-4 text-right font-bold text-gray-900 tabular-nums">
                {formatRupiah((bpjs.jhtCompany || 0) + (bpjs.jhtEmployee || 0))}
              </td>
            </tr>

            <tr className="hover:bg-gray-50/60 transition">
              <td className="py-3.5 px-4 font-semibold text-gray-900">
                Jaminan Kecelakaan Kerja (JKK)
                <span className="block text-xs font-normal text-gray-400">
                  Kelas Risiko I (Beban Perusahaan)
                </span>
              </td>
              <td className="py-3.5 px-4 text-gray-600">
                Perusahaan 0.24% • Karyawan 0%
              </td>
              <td className="py-3.5 px-4 text-right font-medium text-gray-800 tabular-nums">
                {formatRupiah(bpjs.jkkCompany)}
              </td>
              <td className="py-3.5 px-4 text-right text-gray-400 tabular-nums">
                Rp0
              </td>
              <td className="py-3.5 px-4 text-right font-bold text-gray-900 tabular-nums">
                {formatRupiah(bpjs.jkkCompany)}
              </td>
            </tr>

            <tr className="hover:bg-gray-50/60 transition">
              <td className="py-3.5 px-4 font-semibold text-gray-900">
                Jaminan Kematian (JKM)
                <span className="block text-xs font-normal text-gray-400">
                  Beban Perusahaan Sepenuhnya
                </span>
              </td>
              <td className="py-3.5 px-4 text-gray-600">
                Perusahaan 0.30% • Karyawan 0%
              </td>
              <td className="py-3.5 px-4 text-right font-medium text-gray-800 tabular-nums">
                {formatRupiah(bpjs.jkmCompany)}
              </td>
              <td className="py-3.5 px-4 text-right text-gray-400 tabular-nums">
                Rp0
              </td>
              <td className="py-3.5 px-4 text-right font-bold text-gray-900 tabular-nums">
                {formatRupiah(bpjs.jkmCompany)}
              </td>
            </tr>

            <tr className="hover:bg-gray-50/60 transition">
              <td className="py-3.5 px-4 font-semibold text-gray-900">
                Jaminan Pensiun (JP)
                <span className="block text-xs font-normal text-gray-400">
                  Batas atas upah Rp10.042.300
                </span>
              </td>
              <td className="py-3.5 px-4 text-gray-600">
                Perusahaan 2.0% • Karyawan 1.0%
              </td>
              <td className="py-3.5 px-4 text-right font-medium text-gray-800 tabular-nums">
                {formatRupiah(bpjs.jpCompany)}
              </td>
              <td className="py-3.5 px-4 text-right font-medium text-gray-800 tabular-nums">
                {formatRupiah(bpjs.jpEmployee)}
              </td>
              <td className="py-3.5 px-4 text-right font-bold text-gray-900 tabular-nums">
                {formatRupiah((bpjs.jpCompany || 0) + (bpjs.jpEmployee || 0))}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-bold text-gray-900 border-t-2 border-gray-200">
              <td colSpan={2} className="py-4 px-4 text-right">
                TOTAL KONTRIBUSI BPJS
              </td>
              <td className="py-4 px-4 text-right text-indigo-700 tabular-nums">
                {formatRupiah(costs.totalBpjsCompany)}
              </td>
              <td className="py-4 px-4 text-right text-amber-700 tabular-nums">
                {formatRupiah(costs.totalBpjsEmployee)}
              </td>
              <td className="py-4 px-4 text-right text-emerald-800 text-base tabular-nums">
                {formatRupiah((costs.totalBpjsCompany || 0) + (costs.totalBpjsEmployee || 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
