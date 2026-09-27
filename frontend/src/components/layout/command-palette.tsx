'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users,
  LayoutDashboard,
  CalendarCheck,
  Clock,
  Receipt,
  BarChart3,
  ShieldCheck,
  Settings,
  UserCheck,
  ArrowRight,
  X,
  Building2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { DEFAULT_COMPANY } from '@/lib/auth-context';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load employee suggestions when querying
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setEmployees([]);
      return;
    }

    if (query.trim().length >= 2) {
      setIsLoading(true);
      const timer = setTimeout(async () => {
        try {
          const res = await api.employees.list(DEFAULT_COMPANY.id, query.trim(), 1, 6);
          setEmployees(res.data || []);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setEmployees([]);
    }
  }, [query, isOpen]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  const navItems = [
    { name: 'Ikhtisar Dashboard', href: '/', icon: LayoutDashboard, category: 'Modul Utama' },
    { name: 'Portal Mandiri Karyawan (ESS)', href: '/portal', icon: UserCheck, category: 'Modul Utama' },
    { name: 'Master Data Karyawan', href: '/employees', icon: Users, category: 'Modul Utama' },
    { name: 'Pencatatan Presensi & Lembur', href: '/attendance', icon: Clock, category: 'Modul Utama' },
    { name: 'Manajemen Cuti & Izin', href: '/leave', icon: CalendarCheck, category: 'Modul Utama' },
    { name: 'Pusat Penggajian (Payroll)', href: '/payroll', icon: Receipt, category: 'Modul Utama' },
    { name: 'Laporan & Beban Ketenagakerjaan', href: '/reports', icon: BarChart3, category: 'Laporan' },
    { name: 'Audit Trail & Keamanan Forensik', href: '/audit-logs', icon: ShieldCheck, category: 'Sistem' },
    { name: 'Konfigurasi Organisasi & Pajak', href: '/settings', icon: Settings, category: 'Sistem' },
  ];

  const filteredNav = query.trim()
    ? navItems.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()))
    : navItems;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari karyawan, NIK, jabatan, atau modul sistem..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Employee Matches */}
          {employees.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Karyawan Ditemukan ({employees.length})
              </div>
              <div className="space-y-1">
                {employees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => navigateTo(`/employees`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 font-semibold text-xs flex items-center justify-center border border-teal-200">
                        {emp.fullName?.charAt(0) || 'K'}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                          {emp.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {emp.employeeCode} · {emp.department?.name || 'Departemen'}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div>
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Navigasi Cepat Modul
            </div>
            <div className="space-y-1">
              {filteredNav.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => navigateTo(item.href)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-slate-800">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-600">
                      {item.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Tekan tombol panah untuk memilih, Enter untuk membuka</span>
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>PT Nusantara Digital Solusi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
