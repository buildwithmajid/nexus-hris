'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Building2,
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertCircle,
  Save,
  Scale,
  Lock,
  UserCheck,
  FileText,
  BadgePercent,
  Check,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth, DEFAULT_COMPANY } from '@/lib/auth-context';

export default function SettingsPage() {
  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<'company' | 'statutory' | 'users'>('company');

  // Company State
  const [companyName, setCompanyName] = useState('');
  const [companyNpwp, setCompanyNpwp] = useState('');
  const [companyRiskClass, setCompanyRiskClass] = useState('I');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyMeta, setCompanyMeta] = useState<any>(null);

  // Statutory Rates State
  const [statutoryRates, setStatutoryRates] = useState<any>(null);

  // Users & Roles State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [rolesList, setRolesList] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [compRes, ratesRes, usersRes, rolesRes] = await Promise.all([
        api.settings.getCompany(DEFAULT_COMPANY.id),
        api.settings.getStatutoryRates(),
        api.settings.getUsers(),
        api.settings.getRoles(),
      ]);

      setCompanyName(compRes.name || '');
      setCompanyNpwp(compRes.npwp || '');
      setCompanyRiskClass(compRes.riskClassJkk || 'I');
      setCompanyAddress(compRes.address || '');
      setCompanyMeta(compRes);

      setStatutoryRates(ratesRes);
      setUsersList(usersRes || []);
      setRolesList(rolesRes || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat data pengaturan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSaving(true);
    try {
      await api.settings.updateCompany(DEFAULT_COMPANY.id, {
        name: companyName.trim(),
        npwp: companyNpwp.trim() || undefined,
        riskClassJkk: companyRiskClass,
        address: companyAddress.trim() || undefined,
      });
      setSuccessMessage('Informasi legalitas perusahaan berhasil diperbarui!');
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan pengaturan perusahaan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRoleId: string) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await api.settings.updateUserRole(userId, newRoleId);
      setSuccessMessage('Hak akses dan peran pengguna berhasil diperbarui!');
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memperbarui peran pengguna');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Settings className="h-7 w-7 text-indigo-600" />
            Pengaturan & Konfigurasi Sistem
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola legalitas entitas perusahaan, parameter statuter BPJS & Pajak, serta otorisasi hak akses pengguna.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-center justify-between text-emerald-800 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-emerald-700 hover:text-emerald-900 font-medium text-xs ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 flex items-center justify-between text-rose-800 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-rose-700 hover:text-rose-900 font-medium text-xs ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('company')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 transition ${
              activeTab === 'company'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Profil & Legalitas Perusahaan
          </button>

          <button
            onClick={() => setActiveTab('statutory')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 transition ${
              activeTab === 'statutory'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Scale className="h-4 w-4" />
            Parameter Statuter & Regulasi
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 transition ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-4 w-4" />
            Pengguna & Otorisasi Akses ({usersList.length})
          </button>
        </nav>
      </div>

      {/* TAB 1: Profil & Legalitas Perusahaan */}
      {activeTab === 'company' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-5 flex items-center justify-between">
              <span>Identitas Resmi Badan Usaha</span>
              <span className="text-xs text-gray-400 font-normal">ID: {DEFAULT_COMPANY.id}</span>
            </h2>

            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nama Resmi Perusahaan (PT / CV)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  placeholder="Contoh: PT Nusantara Digital Solusi"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nomor Pokok Wajib Pajak (NPWP Badan Usaha)
                </label>
                <input
                  type="text"
                  value={companyNpwp}
                  onChange={(e) => setCompanyNpwp(e.target.value)}
                  placeholder="Format: 01.234.567.8-012.000"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Digunakan pada header file pelaporan SPT Masa PPh 21 TER resmi ke DJP.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
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
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
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
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
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
      )}

      {/* TAB 2: Parameter Statuter & Regulasi Resmi */}
      {activeTab === 'statutory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kartu BPJS Kesehatan */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <BadgePercent className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-bold text-gray-900 text-sm">BPJS Kesehatan</h3>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                  Perpres 64/2020
                </span>
              </div>

              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span>Porsi Beban Perusahaan</span>
                  <strong className="text-gray-900 text-sm">4.0%</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span>Porsi Potongan Karyawan</span>
                  <strong className="text-gray-900 text-sm">1.0%</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span>Batas Upah Maksimum (Wage Cap)</span>
                  <strong className="text-emerald-700 text-sm tabular-nums">Rp 12.000.000</strong>
                </div>
                <p className="text-[11px] text-gray-400 pt-2 leading-relaxed">
                  Jika gaji pokok + tunjangan tetap karyawan melebihi Rp12 juta, dasar iuran dibatasi tepat pada Rp12 juta (maksimal iuran gabungan Rp600.000/bln).
                </p>
              </div>
            </div>

            {/* Kartu BPJS Ketenagakerjaan JP */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <BadgePercent className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-bold text-gray-900 text-sm">Jaminan Pensiun (JP)</h3>
                </div>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">
                  SE BPJS TK 2024
                </span>
              </div>

              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span>Porsi Beban Perusahaan</span>
                  <strong className="text-gray-900 text-sm">2.0%</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span>Porsi Potongan Karyawan</span>
                  <strong className="text-gray-900 text-sm">1.0%</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span>Batas Upah Maksimum (Wage Cap)</span>
                  <strong className="text-indigo-700 text-sm tabular-nums">Rp 10.042.300</strong>
                </div>
                <p className="text-[11px] text-gray-400 pt-2 leading-relaxed">
                  Plafon upah tertinggi dinaikkan sesuai indeks inflasi BPS dan berlaku efektif per Maret 2024 bagi seluruh pekerja formal.
                </p>
              </div>
            </div>

            {/* Kartu PPh 21 TER PMK 168/2023 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-amber-600" />
                  <h3 className="font-bold text-gray-900 text-sm">PPh 21 TER Bulanan</h3>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                  PMK 168/2023
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <strong className="text-gray-900 block">Kategori TER A:</strong>
                  <span>TK/0 (54jt), TK/1 (58.5jt), K/0 (58.5jt) • 44 Lapisan Tarif (0% s/d 34%)</span>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <strong className="text-gray-900 block">Kategori TER B:</strong>
                  <span>TK/2 (63jt), TK/3 (67.5jt), K/1 (63jt), K/2 (67.5jt) • 40 Lapisan Tarif (0% s/d 34%)</span>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <strong className="text-gray-900 block">Kategori TER C:</strong>
                  <span>K/3 (72jt) • 41 Lapisan Tarif (0% s/d 34%)</span>
                </div>
              </div>
            </div>

            {/* Kartu Lembur Kepmenaker 102/2004 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-sky-600" />
                  <h3 className="font-bold text-gray-900 text-sm">Upah Lembur Resmi</h3>
                </div>
                <span className="text-[10px] bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded-full">
                  Kepmenaker 102/2004
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-gray-600">
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span>Upah Sejam Standar</span>
                  <strong className="text-gray-900 font-mono">1/173 × Gaji Pokok</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span>Hari Kerja Biasa</span>
                  <span className="font-medium text-gray-800">Jam 1: 1.5× • Jam 2+: 2.0×</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span>Hari Libur Resmi</span>
                  <span className="font-medium text-gray-800">1-8 jam: 2.0× • Ke-9: 3.0× • 10+: 4.0×</span>
                </div>
                <p className="text-[11px] text-gray-400 pt-2 leading-relaxed">
                  Semua formula kalkulasi dihitung otomatis secara native tanpa toleransi human error oleh payroll engine.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Pengguna & Otorisasi Hak Akses */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Daftar Pengguna & Penetapan Peran (Role Assignment)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Atur hak akses pengguna ke modul-modul sistem sesuai dengan tanggung jawab korporat.
                </p>
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                Total Akun: <strong className="text-gray-900">{usersList.length}</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Pengguna (Email)</th>
                    <th className="py-3 px-4">Karyawan Terkait</th>
                    <th className="py-3 px-4">Departemen / Jabatan</th>
                    <th className="py-3 px-4">Peran (Role) Saat Ini</th>
                    <th className="py-3 px-4 text-right">Ubah Peran Akses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        <div>{u.email}</div>
                        <div className="text-[11px] text-gray-400 font-normal">
                          Dibuat: {new Date(u.createdAt).toLocaleDateString('id-ID')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">
                        {u.employee ? (
                          <div className="font-medium text-gray-800">
                            {u.employee.fullName}
                            <span className="text-xs text-gray-400 block font-normal">
                              {u.employee.employeeCode}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Akun Sistem / Belum Terikat</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 text-xs">
                        {u.employee ? (
                          <>
                            <div className="font-medium text-gray-800">{u.employee.department?.name || 'Umum'}</div>
                            <div className="text-gray-400">{u.employee.position?.title || 'Staf'}</div>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                          <UserCheck className="h-3 w-3" />
                          {u.role?.name || 'staff'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={u.roleId}
                          onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                          className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 focus:border-indigo-500 focus:outline-none"
                        >
                          {rolesList.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({r.description})
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Matriks Peran & Hak Akses */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4 text-indigo-600" />
              Matriks Otorisasi Peran Sistem (Role-Based Access Control)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1">
                <span className="font-bold text-xs text-gray-900 block">super_admin</span>
                <p className="text-[11px] text-gray-500">
                  Akses tak terbatas ke seluruh modul sistem, audit log, konfigurasi perusahaan, dan penggajian.
                </p>
              </div>
              <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1">
                <span className="font-bold text-xs text-gray-900 block">hr_admin</span>
                <p className="text-[11px] text-gray-500">
                  Manajemen karyawan, absensi, approval cuti, dan persetujuan lembur staf.
                </p>
              </div>
              <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1">
                <span className="font-bold text-xs text-gray-900 block">finance</span>
                <p className="text-[11px] text-gray-500">
                  Kalkulasi batch payroll, approval penggajian, penguncian periode, dan ekspor laporan keuangan.
                </p>
              </div>
              <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1">
                <span className="font-bold text-xs text-gray-900 block">staff (ESS)</span>
                <p className="text-[11px] text-gray-500">
                  Portal mandiri: melihat slip gaji terenkripsi pribadi, absensi clock-in, pengajuan lembur, dan saldo cuti.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

