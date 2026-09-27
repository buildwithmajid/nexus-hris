'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { usePayrollList } from './hooks/use-payroll-list';
import { usePayrollExport } from './hooks/use-payroll-export';
import { PeriodSelector } from './components/period-selector';
import { PayrollSummaryCards } from './components/payroll-summary-cards';
import { PayrollTable } from './components/payroll-table';

export default function PayrollPage() {
  const { hasPermission } = useAuth();
  const {
    periods,
    selectedPeriodId,
    periodDetail,
    isLoading,
    actionError,
    actionSuccess,
    setActionError,
    handleSelectPeriod,
    handleCalculateBatch,
    handleSubmitPeriod,
    handleApprovePeriod,
    handleLockPeriod,
    handleCreatePeriod,
    handleViewSlip,
  } = usePayrollList();

  const { exportBankTransfer, exportPph21 } = usePayrollExport();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newMonth, setNewMonth] = useState(new Date().getMonth() + 1);
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [isCalculating, setIsCalculating] = useState(false);

  const currentPeriod = periodDetail?.period;

  const onCalculate = async () => {
    setIsCalculating(true);
    await handleCalculateBatch();
    setIsCalculating(false);
  };

  const onCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    await handleCreatePeriod(Number(newMonth), Number(newYear));
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-subtle-border">
        <div>
          <h1 className="text-xl font-bold text-charcoal tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal" />
            <span>Pusat Penggajian Statuter (Payroll Center)</span>
          </h1>
          <p className="text-xs text-steel mt-0.5">
            Otomatisasi kalkulasi PPh 21 TER (PMK 168/2023), BPJS Kesehatan & Ketenagakerjaan dengan jaminan audit trail.
          </p>
        </div>

        {hasPermission('payroll.run') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy text-white text-xs font-medium rounded hover:bg-navy-hover transition-colors shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Periode Baru</span>
          </button>
        )}
      </div>

      {actionError && (
        <div className="p-3 bg-danger-surface border border-danger-border text-danger text-xs rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="p-3 bg-success-surface border border-success-border text-success text-xs rounded flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      <PeriodSelector
        periods={periods}
        selectedPeriodId={selectedPeriodId}
        currentPeriod={currentPeriod}
        isCalculating={isCalculating}
        onSelectPeriod={handleSelectPeriod}
        onCalculate={onCalculate}
        onSubmit={handleSubmitPeriod}
        onApprove={handleApprovePeriod}
        onLock={handleLockPeriod}
      />

      <PayrollSummaryCards periodDetail={periodDetail} />

      {currentPeriod && (
        <PayrollTable
          currentPeriod={currentPeriod}
          onViewSlip={handleViewSlip}
          onExportBankTransfer={() => exportBankTransfer(periodDetail)}
          onExportPph21={() => exportPph21(periodDetail)}
        />
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded border border-subtle-border max-w-sm w-full shadow-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-subtle-border flex items-center justify-between bg-canvas">
              <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider">
                Buat Periode Penggajian
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-steel hover:text-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={onCreatePeriod} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Bulan</label>
                <select
                  value={newMonth}
                  onChange={(e) => setNewMonth(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-charcoal focus:outline-none focus:border-teal"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Bulan {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tahun</label>
                <input
                  type="number"
                  value={newYear}
                  onChange={(e) => setNewYear(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-charcoal focus:outline-none focus:border-teal"
                />
              </div>
              <div className="pt-3 border-t border-subtle-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-charcoal text-xs font-medium rounded hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-navy text-white text-xs font-medium rounded hover:bg-navy-hover transition-colors"
                >
                  Buat Periode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
