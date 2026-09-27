'use client';

import React from 'react';
import { ShieldCheck, Lock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';

interface AuditHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export function AuditHeader({ isLoading, onRefresh }: AuditHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Title & Refresh */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-indigo-600" />
            Jejak Audit & Kepatuhan Keamanan
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Audit trail forensik mutasi data sensitif, kepatuhan ISO/IEC 27001 dan UU No. 27/2022 (UU PDP).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Segarkan
          </Button>
        </div>
      </div>

      {/* Compliance Guarantee Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 shadow-sm border border-indigo-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <Lock className="h-4 w-4" />
              Sertifikasi Standar Kepatuhan Keamanan Aktif
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              ISO/IEC 27001:2022 & UU Pelindungan Data Pribadi (UU PDP)
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Seluruh data identitas kependudukan (NIK, NPWP, Rekening Bank) dilindungi enkripsi kriptografis tingkat tinggi <strong>AES-256-GCM</strong>. Setiap mutasi data dicatat secara permanen dengan stempel waktu, alamat IP, dan user-agent forensik.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur border border-white/20 px-3 py-2 rounded-lg text-center">
              <div className="text-[10px] text-slate-300 font-medium uppercase">Retensi Audit</div>
              <div className="text-base font-bold text-emerald-400 tabular-nums">365 Hari</div>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 px-3 py-2 rounded-lg text-center">
              <div className="text-[10px] text-slate-300 font-medium uppercase">Kriptografi</div>
              <div className="text-base font-bold text-sky-400">AES-256</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
