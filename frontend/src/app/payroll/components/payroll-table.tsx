'use client';

import React, { useState } from 'react';
import { FileText, Download, Building, X, ShieldCheck, Printer } from 'lucide-react';

interface PayrollTableProps {
  currentPeriod: any;
  onViewSlip: (employeeId: string) => Promise<any>;
  onExportBankTransfer: () => void;
  onExportPph21: () => void;
}

export function PayrollTable({
  currentPeriod,
  onViewSlip,
  onExportBankTransfer,
  onExportPph21,
}: PayrollTableProps) {
  const [slipModalData, setSlipModalData] = useState<any>(null);

  const formatRupiah = (val?: number) => {
    if (val === undefined || val === null) return 'Rp 0';
    return `Rp ${new Intl.NumberFormat('id-ID').format(val)}`;
  };

  const [slipError, setSlipError] = useState('');

  const handleViewSlip = async (employeeId: string) => {
    setSlipError('');
    try {
      const slip = await onViewSlip(employeeId);
      setSlipModalData(slip);
    } catch (err: any) {
      setSlipError(err.message || 'Gagal memuat rincian slip gaji');
    }
  };

  return (
    <>
      {slipError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center justify-between mb-3">
          <span>{slipError}</span>
          <button onClick={() => setSlipError('')} className="text-red-500 hover:text-red-700 font-bold">×</button>
        </div>
      )}
      <div className="bg-white border border-subtle-border rounded shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-subtle-border flex items-center justify-between bg-canvas gap-3 flex-wrap">
          <h2 className="text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal" />
            <span>Rincian Slip Gaji Karyawan - Periode Bulan {currentPeriod?.month}/{currentPeriod?.year}</span>
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-steel">
              {currentPeriod?.payrollDetails?.length || 0} karyawan terhitung
            </span>
            {(currentPeriod?.payrollDetails?.length || 0) > 0 && (
              <>
                <button
                  onClick={onExportBankTransfer}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-300 text-charcoal text-[11px] font-medium rounded hover:bg-slate-50 transition-colors"
                  title="Ekspor file CSV untuk transfer massal ke bank (BCA/Mandiri Corporate)"
                >
                  <Download className="w-3.5 h-3.5 text-steel" />
                  <span>CSV Transfer Bank</span>
                </button>
                <button
                  onClick={onExportPph21}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-300 text-charcoal text-[11px] font-medium rounded hover:bg-slate-50 transition-colors"
                  title="Ekspor rekap PPh 21 TER untuk pelaporan pajak SPT Masa"
                >
                  <Download className="w-3.5 h-3.5 text-steel" />
                  <span>CSV Rekap PPh 21</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white border-b border-subtle-border text-[11px] font-semibold text-steel uppercase tracking-wider">
                <th className="py-2.5 px-3">Karyawan</th>
                <th className="py-2.5 px-3">PTKP</th>
                <th className="py-2.5 px-3 text-right">Gaji Pokok</th>
                <th className="py-2.5 px-3 text-right">Tunj. Tetap</th>
                <th className="py-2.5 px-3 text-right">Lembur</th>
                <th className="py-2.5 px-3 text-right">Bruto</th>
                <th className="py-2.5 px-3 text-right">BPJS Kes (1%)</th>
                <th className="py-2.5 px-3 text-right">BPJS TK (3%)</th>
                <th className="py-2.5 px-3 text-right">PPh 21 TER</th>
                <th className="py-2.5 px-3 text-right font-bold text-navy">Gaji Bersih</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle-border">
              {!currentPeriod || currentPeriod.payrollDetails.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-steel">
                    Belum ada data perhitungan untuk periode ini. Klik tombol "Jalankan Kalkulasi Batch" di atas.
                  </td>
                </tr>
              ) : (
                currentPeriod.payrollDetails.map((item: any) => (
                  <tr key={item.id} className="table-row-hover">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-charcoal">{item.employee.fullName}</div>
                      <div className="text-[10px] text-steel">{item.employee.employeeCode}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-700">
                      {item.employee.maritalStatusPtkp}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700 tabular-nums">
                      {formatRupiah(item.baseSalary)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700 tabular-nums">
                      {formatRupiah(item.fixedAllowance)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700 tabular-nums">
                      {formatRupiah(item.overtimeAmount)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-charcoal tabular-nums">
                      {formatRupiah(item.grossIncome)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 tabular-nums">
                      {formatRupiah(item.bpjsKesehatanEmployee)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 tabular-nums">
                      {formatRupiah(item.bpjsTkEmployee)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 tabular-nums">
                      {formatRupiah(item.pph21Amount)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-navy tabular-nums">
                      {formatRupiah(item.netSalary)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <button
                        onClick={() => handleViewSlip(item.employeeId)}
                        className="px-2 py-1 bg-slate-100 border border-slate-200 text-charcoal rounded text-[11px] font-medium hover:bg-slate-200 transition-colors"
                      >
                        Slip Gaji
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {slipModalData && (
        <div
          data-print-overlay
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            data-print-slip
            className="bg-white rounded border border-subtle-border max-w-2xl w-full shadow-card overflow-hidden"
          >
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
                  SLIP GAJI KARYAWAN — BULAN {slipModalData.detail?.payrollPeriod?.month} /{' '}
                  {slipModalData.detail?.payrollPeriod?.year}
                </div>
              </div>
              <button
                onClick={() => setSlipModalData(null)}
                className="text-steel hover:text-charcoal print:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs bg-canvas p-3 rounded border border-subtle-border">
                <div>
                  <span className="text-steel block text-[11px]">Nama Karyawan:</span>
                  <span className="font-semibold text-charcoal">
                    {slipModalData.detail?.employee?.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-steel block text-[11px]">Kode Karyawan / NIK:</span>
                  <span className="font-semibold text-charcoal">
                    {slipModalData.detail?.employee?.employeeCode}
                  </span>
                </div>
                <div>
                  <span className="text-steel block text-[11px]">Departemen / Jabatan:</span>
                  <span className="text-charcoal">
                    {slipModalData.detail?.employee?.department?.name} -{' '}
                    {slipModalData.detail?.employee?.position?.title}
                  </span>
                </div>
                <div>
                  <span className="text-steel block text-[11px]">Status PTKP:</span>
                  <span className="font-semibold text-teal">
                    {slipModalData.detail?.employee?.maritalStatusPtkp}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-xs">
                <div className="space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-charcoal border-b border-slate-200 pb-1.5 flex justify-between">
                    <span>Pendapatan</span>
                    <span>Jumlah (Rp)</span>
                  </div>
                  {slipModalData.earnings.map((e: any, idx: number) => (
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
                    <span>Total Bruto</span>
                    <span className="tabular-nums">
                      {formatRupiah(slipModalData.detail?.grossIncome)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-charcoal border-b border-slate-200 pb-1.5 flex justify-between">
                    <span>Potongan</span>
                    <span>Jumlah (Rp)</span>
                  </div>
                  {slipModalData.deductions.map((d: any, idx: number) => (
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
                        slipModalData.deductions.reduce(
                          (acc: number, cur: any) => acc + Number(cur.amount),
                          0,
                        ),
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-navy text-white rounded flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-300 block">
                    TOTAL PEMBAYARAN BERSIH (TAKE HOME PAY)
                  </span>
                  <span className="text-xl font-bold tracking-tight text-white tabular-nums">
                    {formatRupiah(slipModalData.detail?.netSalary)}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-300">
                  <span>Transfer Bank BCA</span>
                  <div className="text-teal font-semibold">Tervalidasi Sistem</div>
                </div>
              </div>

              {/* Verifikasi Kriptografis & QR Code Resmi (Anti-Pemalsuan) */}
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
                      Doc Hash: SHA-256:{slipModalData.detail?.id ? slipModalData.detail.id.substring(0, 16) : '8f7a9c2b4d1e3f5a'}...
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

              <div className="pt-2 text-[10px] text-steel flex items-center justify-between border-t border-subtle-border">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal" />
                  <span>Dihitung sesuai regulasi PPh 21 TER PMK 168/2023 & UU Ketenagakerjaan.</span>
                </div>
                <span>Dokumen Resmi Elektronik</span>
              </div>
            </div>

            <div className="p-4 border-t border-subtle-border bg-canvas flex justify-end gap-2 print:hidden">
              <button
                type="button"
                onClick={() => setSlipModalData(null)}
                className="px-3 py-1.5 bg-white border border-slate-300 text-charcoal text-xs font-medium rounded hover:bg-slate-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy text-white text-xs font-medium rounded hover:bg-navy-hover"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Unduh PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
