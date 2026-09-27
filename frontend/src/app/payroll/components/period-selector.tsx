'use client';

import React from 'react';
import { Play, Send, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface PeriodSelectorProps {
  periods: any[];
  selectedPeriodId: string;
  currentPeriod: any;
  isCalculating: boolean;
  onSelectPeriod: (id: string) => void;
  onCalculate: () => void;
  onSubmit: () => void;
  onApprove: () => void;
  onLock: () => void;
}

export function PeriodSelector({
  periods,
  selectedPeriodId,
  currentPeriod,
  isCalculating,
  onSelectPeriod,
  onCalculate,
  onSubmit,
  onApprove,
  onLock,
}: PeriodSelectorProps) {
  const { hasPermission } = useAuth();

  const isLocked = currentPeriod?.status === 'LOCKED';
  const isApproved = currentPeriod?.status === 'APPROVED';
  const isPending = currentPeriod?.status === 'PENDING_APPROVAL';
  const isDraft = currentPeriod?.status === 'DRAFT';

  return (
    <div className="bg-white border border-subtle-border rounded p-3 shadow-card flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-charcoal">Pilih Periode:</span>
        <div className="flex flex-wrap gap-1.5">
          {periods.map((p) => {
            const isSelected = p.id === selectedPeriodId;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPeriod(p.id)}
                className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                  isSelected
                    ? 'bg-navy text-white border-navy shadow-sm'
                    : 'bg-canvas text-charcoal border-subtle-border hover:bg-slate-100'
                }`}
              >
                Bulan {p.month}/{p.year}
                <span className="ml-1.5 text-[10px] opacity-75">
                  ({p.status})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {currentPeriod && (
        <div className="flex items-center gap-2">
          {hasPermission('payroll.run') && !isLocked && !isApproved && (
            <button
              onClick={onCalculate}
              disabled={isCalculating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal text-white text-xs font-medium rounded hover:bg-teal-hover transition-colors shadow-subtle disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isCalculating ? 'Menghitung...' : 'Jalankan Kalkulasi Batch'}</span>
            </button>
          )}

          {hasPermission('payroll.run') && isDraft && (
            <button
              onClick={onSubmit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-charcoal text-xs font-medium rounded hover:bg-slate-50 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-steel" />
              <span>Ajukan Verifikasi</span>
            </button>
          )}

          {hasPermission('payroll.approve') && isPending && (
            <button
              onClick={onApprove}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success text-white text-xs font-medium rounded hover:bg-emerald-700 transition-colors shadow-subtle"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Setujui Penggajian</span>
            </button>
          )}

          {hasPermission('payroll.lock') && isApproved && (
            <button
              onClick={onLock}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-dark text-white text-xs font-medium rounded hover:bg-slate-800 transition-colors shadow-subtle"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Kunci Periode (Audit Lock)</span>
            </button>
          )}

          {isLocked && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-navy/10 border border-navy/20 text-navy font-semibold text-xs rounded">
              <Lock className="w-3.5 h-3.5" />
              <span>Periode Terkunci Permanen</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
