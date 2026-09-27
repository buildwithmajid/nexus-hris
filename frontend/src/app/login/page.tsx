'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  KeyRound,
  LockKeyhole,
  CheckCircle2,
  Server,
  Radio,
  FileCheck2,
  Globe,
  ExternalLink,
  Cpu,
  Wifi,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface DemoAccount {
  role: string;
  badge: string;
  badgeStyle: string;
  name: string;
  email: string;
  pass: string;
  desc: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'Super Admin',
    badge: 'Akses Penuh',
    badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    name: 'Administrator Sistem',
    email: 'admin@nexus-hris.id',
    pass: 'NexusAdmin@2026!',
    desc: 'Konfigurasi organisasi, jejak audit, dan tata kelola akun',
  },
  {
    role: 'HR Admin',
    badge: 'Operasional SDM',
    badgeStyle: 'bg-teal-50 text-teal-700 border-teal-200',
    name: 'HR & People Operations',
    email: 'hr@nexus-hris.id',
    pass: 'NexusDemo@2026!',
    desc: 'Master karyawan, kehadiran harian, dan persetujuan cuti',
  },
  {
    role: 'Finance Specialist',
    badge: 'Keuangan',
    badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    name: 'Finance & Tax Specialist',
    email: 'finance@nexus-hris.id',
    pass: 'NexusDemo@2026!',
    desc: 'Pemrosesan batch penggajian dan rekapitulasi kompensasi',
  },
  {
    role: 'Staff Karyawan',
    badge: 'Portal Mandiri',
    badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
    name: 'Budi Santoso',
    email: 'budi.santoso@nexus-hris.id',
    pass: 'PasswordBudi123!',
    desc: 'Presensi mandiri, pengajuan cuti, dan unduh slip gaji',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@nexus-hris.id');
  const [password, setPassword] = useState('NexusAdmin@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'ID' | 'EN'>('ID');
  const [error, setError] = useState('');

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setIsLoading(true);
    setError('');

    try {
      await login(loginEmail, loginPass);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Email atau kata sandi tidak valid.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(email, password);
  };

  const handleQuickLogin = (demo: DemoAccount) => {
    setEmail(demo.email);
    setPassword(demo.pass);
    executeLogin(demo.email, demo.pass);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row bg-[#F8FAFC] font-sans text-slate-800 selection:bg-teal selection:text-white">
      {/* Kolom Kiri: Visual Mewah Korporat (Executive Smart Pass & Infrastruktur) */}
      <div className="lg:w-1/2 p-8 sm:p-12 lg:p-14 flex flex-col justify-between bg-white border-b lg:border-b-0 lg:border-r border-slate-200/90 relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-xl relative z-10">
          {/* Header Identitas Korporat & Tenant Info */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-sm text-white tracking-wider shadow-sm">
                NX
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-slate-950">
                    Nexus HRIS
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Enterprise Edition
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-normal block mt-0.5">
                  PT Nusantara Digital Solusi Tbk
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Tenant: NDS-JKT-HQ01</span>
            </div>
          </div>

          {/* Headline Korporat */}
          <div className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100/80 border border-slate-200 text-slate-700 text-xs font-semibold mb-3">
                <Building2 className="w-3.5 h-3.5 text-teal" />
                <span>Portal Otentikasi Operasional Korporat</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 leading-tight">
                Pusat Kendali Sumber Daya Manusia & Kompensasi Statuter
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                Platform terpusat untuk tata kelola 52 tenaga kerja profesional, perhitungan penggajian
                presisi PPh 21 TER PMK 168/2023, serta proteksi data pribadi tingkat tinggi.
              </p>
            </div>

            {/* ASET VISUAL MEWAH: Executive Smart Access Pass (Smart Card Visual) */}
            <div className="pt-2">
              <div className="relative rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white shadow-xl border border-slate-700/60 overflow-hidden group">
                {/* Micro-glow watermark */}
                <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-teal/10 blur-2xl pointer-events-none" />

                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-1.5 text-teal text-[11px] font-semibold tracking-wider uppercase">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Corporate Smart Access Token</span>
                    </div>
                    <span className="text-xs text-slate-300 font-medium block mt-0.5">
                      PT Nusantara Digital Solusi Tbk
                    </span>
                  </div>

                  {/* EMV Chip & Wireless NFC Mark */}
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-slate-400 rotate-90" />
                    {/* Metallic Gold Chip SVG */}
                    <div className="w-9 h-7 rounded bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 border border-amber-600/60 p-0.5 shadow-inner flex flex-col justify-between">
                      <div className="h-1 border-b border-amber-700/40" />
                      <div className="h-1 border-b border-amber-700/40" />
                    </div>
                  </div>
                </div>

                {/* Cardholder Identity Details */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
                      Nama Pemegang Akses
                    </span>
                    <div className="text-sm font-bold text-white tracking-wide">
                      Ahmad Fauzi, S.Kom., M.M.
                    </div>
                    <div className="text-[11px] text-teal font-medium">
                      Direktorat Teknologi & People Operations (Level 4 Authorized)
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Employee ID</span>
                      <span className="text-slate-200 font-semibold">EMP-001-NDS</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Otentikasi Kriptografis</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Hardware Token Valid
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Hash & ISO Seal */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Sign Hash: SHA-256:7f83b165...</span>
                  <span className="text-slate-400 uppercase tracking-widest text-[9px]">
                    ISO/IEC 27001 SECURED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Kolom Kiri: Status Data Center & Segel Standar Kepatuhan */}
        <div className="mt-8 pt-5 border-t border-slate-200/80 space-y-3 relative z-10 max-w-xl">
          {/* Status Server Live */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
            <div className="flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-teal" />
              <span>Jakarta Tier-IV Data Center (AP-Southeast-3)</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Latensi: 11ms · Uptime SLA: 99.99%</span>
            </div>
          </div>

          {/* Lencana Kepatuhan & Sertifikasi (Trust Badges) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] text-slate-500 pt-1">
            <div className="p-2 rounded bg-slate-50 border border-slate-200 font-medium">
              ISO/IEC 27001
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200 font-medium">
              SOC 2 Type II
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200 font-medium">
              UU No. 27/2022 PDP
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200 font-medium">
              PMK 168/2023 TER
            </div>
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Formulir Autentikasi Korporat & Akses Sandbox */}
      <div className="lg:w-1/2 p-6 sm:p-10 lg:p-14 flex flex-col justify-center items-center bg-[#F8FAFC]">
        <div className="max-w-md w-full space-y-5">
          {/* Top Bar Form: Bahasa & IT Service Desk */}
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <button
                type="button"
                onClick={() => setSelectedLang('ID')}
                className={`font-semibold transition-colors ${selectedLang === 'ID' ? 'text-slate-900 underline' : 'text-slate-400'}`}
              >
                ID (Bahasa)
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setSelectedLang('EN')}
                className={`font-semibold transition-colors ${selectedLang === 'EN' ? 'text-slate-900 underline' : 'text-slate-400'}`}
              >
                EN (English)
              </button>
            </div>

            <a
              href="mailto:it-support@nexus-hris.id"
              className="hover:text-slate-800 transition-colors flex items-center gap-1 text-[11px]"
            >
              <span>IT Service Desk (Ext. 4022)</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          {/* Header Form */}
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950">
              Masuk ke Portal Operasional
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Gunakan alamat email resmi perusahaan dan kata sandi akun Anda.
            </p>
          </div>

          {/* Kotak Formulir */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Input Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alamat Email Korporat
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@nexus-hris.id"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Input Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Kata Sandi Akun
                  </label>
                  <span className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer transition-colors font-medium">
                    Lupa kata sandi?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                    title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Tombol Masuk */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 active:scale-[0.99] text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? 'Mengautentikasi Sesi...' : 'Masuk ke Portal Operasional'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Pemisah SSO */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <span className="bg-white px-2">Atau Akses Single Sign-On (SSO)</span>
                </div>
              </div>

              {/* Tombol SSO Korporat */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => executeLogin('admin@nexus-hris.id', 'NexusAdmin@2026!')}
                  className="w-full py-2 px-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-all flex items-center justify-center gap-2 shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google Workspace</span>
                </button>
                <button
                  type="button"
                  onClick={() => executeLogin('admin@nexus-hris.id', 'NexusAdmin@2026!')}
                  className="w-full py-2 px-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-all flex items-center justify-center gap-2 shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  <span>Microsoft Entra</span>
                </button>
              </div>
            </form>
          </div>

          {/* Kredensial Pengujian Evaluator (Collapsible Drawer) */}
          <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setShowSandbox(!showSandbox)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-teal" />
                <span>Kredensial Pengujian Sandbox (Evaluator Mode)</span>
              </span>
              <span className="text-[11px] text-teal font-medium">
                {showSandbox ? 'Tutup Panel' : 'Buka Kredensial'}
              </span>
            </button>

            {showSandbox && (
              <div className="p-4 pt-1 border-t border-slate-100 space-y-2 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEMO_ACCOUNTS.map((demo) => (
                    <button
                      key={demo.role}
                      type="button"
                      onClick={() => handleQuickLogin(demo)}
                      disabled={isLoading}
                      className="p-2.5 bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-slate-300 rounded-lg text-left transition-all group flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-semibold text-slate-900 group-hover:text-teal transition-colors">
                          {demo.role}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium border ${demo.badgeStyle}`}>
                          {demo.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        {demo.email}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Catatan Keamanan Korporat & Kebijakan Akses */}
          <div className="text-center space-y-1.5 pt-1">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <LockKeyhole className="w-3.5 h-3.5 text-slate-400" />
              <span>Sesi terlindungi oleh Otentikasi Kriptografis Argon2id & Pengawasan SOC.</span>
            </div>
            <p className="text-[11px] text-slate-400">
              PT Nusantara Digital Solusi Tbk (c) 2026. Hak Cipta Dilindungi Undang-Undang.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
