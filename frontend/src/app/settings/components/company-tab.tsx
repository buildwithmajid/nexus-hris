'use client';

import React from 'react';
import { Building2, Save } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { DEFAULT_COMPANY } from '@/contexts/auth-context';

interface CompanyTabProps {
  companyName: string;
  setCompanyName: (v: string) => void;
  companyNpwp: string;
  setCompanyNpwp: (v: string) => void;
  companyRiskClass: string;
  setCompanyRiskClass: (v: string) => void;
  companyAddress: string;
  setCompanyAddress: (v: string) => void;
  companyMeta: any;
  isSaving: boolean;
  onSave: (e: React.FormEvent) => void;
}

export function CompanyTab({
  companyName,
  setCompanyName,
  companyNpwp,
  setCompanyNpwp,
  companyRiskClass,
  setCompanyRiskClass,
  companyAddress,
  setCompanyAddress,
  companyMeta,
  isSaving,
  onSave,
}: CompanyTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-5 flex items-center justify-between">
          <span>Identitas Resmi Badan Usaha</span>
          <span className="text-xs text-gray-400 font-normal">ID: {DEFAULT_COMPANY.id}</span>
        </h2>

        <form onSubmit={onSave} className="space-y-4">
          <Input
            label="Nama Resmi Perusahaan (PT / CV)"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            placeholder="Contoh: PT Nusantara Digital Solusi"
          />

          <div>
            <Input
              label="Nomor Pokok Wajib Pajak (NPWP Badan Usaha)"
              type="text"
              value={companyNpwp}
              onChange={(e) => setCompanyNpwp(e.target.value)}
              placeholder="Format: 01.234.567.8-012.000"
              className="font-mono"
            />
            <span className="text-[11px] text-gray-400 mt-1 block">
              Digunakan pada header file pelaporan SPT Masa PPh 21 TER resmi ke DJP.
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Kelas Risiko BPJS Ketenagakerjaan (JKK)
            </label>
            <select
              value={companyRiskClass}
              onChange={(e) => setCompanyRiskClass(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="I">Kelas I: Risiko Sangat Rendah (0.24% - Perkantoran, IT, Finansial)</option>
              <option value="II">Kelas II: Risiko Rendah (0.54% - Perdagangan, Retail, Pariwisata)</option>
              <option value="III">Kelas III: Risiko Sedang (0.89% - Manufaktur Ringan, Logistik)</option>
              <option value="IV">Kelas IV: Risiko Tinggi (1.27% - Industri Kimia, Transportasi Berat)</option>
              <option value="V">Kelas V: Risiko Sangat Tinggi (1.74% - Pertambangan, Konstruksi, Migas)</option>
            </select>
            <span className="text-[11px] text-gray-400 mt-1 block">
              Sesuai PP No. 44/2015. Seluruh premi JKK ditanggung penuh 100% oleh pemberi kerja.
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Alamat Kantor Pusat / Domisili Legal
            </label>
            <textarea
              rows={3}
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              placeholder="Alamat gedung, jalan, kota, dan kode pos"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </div>

      {/* Sisi Kanan: Ringkasan Entitas */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-600" />
            Statistik Organisasi
          </h3>
          <div className="space-y-3 text-xs text-gray-600">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span>Total Karyawan Aktif</span>
              <span className="font-bold text-gray-900 text-sm tabular-nums">
                {companyMeta?._count?.employees || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span>Total Departemen Terdaftar</span>
              <span className="font-bold text-gray-900 text-sm tabular-nums">
                {companyMeta?._count?.departments || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span>Tarif JKK Aktif</span>
              <span className="font-bold text-indigo-700 text-sm tabular-nums">
                {companyRiskClass === 'I' ? '0.24%' : companyRiskClass === 'II' ? '0.54%' : companyRiskClass === 'III' ? '0.89%' : companyRiskClass === 'IV' ? '1.27%' : '1.74%'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-900">
          <strong className="block font-semibold mb-1">Integritas Dokumen Slip & Bukti Potong:</strong>
          Nama dan alamat perusahaan ini secara otomatis disematkan pada kop surat slip gaji karyawan A4 dan berkas rekapitulasi transfer perbankan korporat.
        </div>
      </div>
    </div>
  );
}
