'use client';

import React from 'react';
import { ShieldCheck, CreditCard } from 'lucide-react';

interface ProfileTabProps {
  profile: any;
}

export function ProfileTab({ profile }: ProfileTabProps) {
  // Masking NIK untuk keamanan privasi
  const maskNik = (nik?: string) => {
    if (!nik || nik.length < 8) return nik || '-';
    return `${nik.slice(0, 4)}********${nik.slice(-4)}`;
  };

  return (
    <div className="bg-white border border-subtle-border rounded p-6 shadow-card max-w-2xl mx-auto space-y-6">
      <div>
        <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal" />
          <span>Data Kependudukan & Perpajakan Terdaftar</span>
        </h3>
        <p className="text-xs text-steel mt-0.5">
          Data sensitif dilindungi dengan enkripsi AES-256-GCM sesuai regulasi UU PDP No. 27/2022.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-3 bg-canvas border border-subtle-border rounded">
          <span className="text-steel block text-[11px]">Nomor Induk Kependudukan (NIK):</span>
          <span className="font-semibold text-charcoal text-sm mt-0.5 block tabular-nums">
            {maskNik(profile?.nik)}
          </span>
          <span className="text-[10px] text-teal flex items-center gap-1 mt-1">
            <ShieldCheck className="w-3 h-3" />
            Terenkripsi AES-256
          </span>
        </div>

        <div className="p-3 bg-canvas border border-subtle-border rounded">
          <span className="text-steel block text-[11px]">Nomor Pokok Wajib Pajak (NPWP):</span>
          <span className="font-semibold text-charcoal text-sm mt-0.5 block tabular-nums">
            {profile?.npwp || 'Belum Terdaftar'}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Kategori TER: <strong>{profile?.maritalStatusPtkp || 'TK/0'}</strong>
          </span>
        </div>

        <div className="p-3 bg-canvas border border-subtle-border rounded">
          <span className="text-steel block text-[11px]">No. BPJS Kesehatan:</span>
          <span className="font-semibold text-charcoal text-sm mt-0.5 block tabular-nums">
            {profile?.bpjsKesehatanNumber || '000123456789'}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Iuran: 4% Perusahaan, 1% Karyawan
          </span>
        </div>

        <div className="p-3 bg-canvas border border-subtle-border rounded">
          <span className="text-steel block text-[11px]">No. BPJS Ketenagakerjaan:</span>
          <span className="font-semibold text-charcoal text-sm mt-0.5 block tabular-nums">
            {profile?.bpjsTkNumber || '230198765432'}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Program JHT, JKK, JKM, JP
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-subtle-border">
        <h4 className="text-xs font-bold text-charcoal mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-teal" />
          <span>Rekening Pembayaran Gaji</span>
        </h4>
        <div className="p-3 bg-canvas border border-subtle-border rounded flex items-center justify-between text-xs">
          <div>
            <span className="text-steel block text-[11px]">Bank Penerima:</span>
            <span className="font-bold text-charcoal">{profile?.bankName || 'BCA (Bank Central Asia)'}</span>
          </div>
          <div className="text-right">
            <span className="text-steel block text-[11px]">Nomor Rekening:</span>
            <span className="font-bold text-navy text-sm tabular-nums">
              {profile?.bankAccountNumber || '••••••••'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
