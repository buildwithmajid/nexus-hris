'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  User,
  LogOut,
  Bell,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { CommandPalette } from './command-palette';

export function Topbar() {
  const router = useRouter();
  const { user, company, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const notifications = [
    {
      id: 'n1',
      title: 'Permohonan Cuti Masuk',
      desc: 'Siti Rahmawati (Engineering) mengajukan cuti tahunan 2 hari.',
      time: '10 menit lalu',
      unread: true,
      href: '/leave',
    },
    {
      id: 'n2',
      title: 'Jadwal Cut-off Penggajian',
      desc: 'Batas akhir perhitungan absensi September 2026 adalah 25 Sep.',
      time: '1 jam lalu',
      unread: true,
      href: '/payroll',
    },
    {
      id: 'n3',
      title: 'Pembaruan Data Statuter',
      desc: 'Tabel TER PMK 168/2023 aktif untuk seluruh 52 karyawan.',
      time: 'Kemarin',
      unread: false,
      href: '/settings',
    },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleBadge = (roleName?: string) => {
    switch (roleName) {
      case 'super_admin':
        return { label: 'Super Admin', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'hr_admin':
        return { label: 'HR Admin', style: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'finance':
        return { label: 'Finance Specialist', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'staff':
        return { label: 'Staff Karyawan', style: 'bg-slate-100 text-slate-700 border-slate-200' };
      default:
        return { label: roleName || 'Pengguna', style: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const badge = getRoleBadge(user?.roleName);
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        {/* Left: Quick Search / Command Bar Trigger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg text-xs text-slate-500 transition-colors w-64 sm:w-80 group cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
            <span className="truncate">Cari karyawan atau menu...</span>
            <kbd className="ml-auto text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right: Operational Status, Notification Center, User Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Active Cycle Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Siklus: September 2026</span>
          </div>

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-colors relative"
              title="Pusat Pemberitahuan"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
              )}
            </button>

            {isNotifOpen && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-30 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Pemberitahuan Sistem</span>
                  <span className="text-[10px] text-teal font-medium cursor-pointer hover:underline">
                    Tandai dibaca
                  </span>
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setIsNotifOpen(false);
                        router.push(n.href);
                      }}
                      className={`p-2.5 rounded-lg text-left cursor-pointer transition-colors ${
                        n.unread ? 'bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-900 leading-none capitalize">
                {user?.email ? user.email.split('@')[0].replace('.', ' ') : 'Sesi Pengguna'}
              </div>
              <div className="mt-1">
                <span className={`inline-block px-1.5 py-0.5 text-[10px] font-medium border rounded ${badge.style}`}>
                  {badge.label}
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-xs border border-slate-200 shadow-2xs">
              <User className="w-4 h-4" />
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              title="Keluar dari sesi ini"
              className="ml-1 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors flex items-center gap-1 text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xl:inline text-xs font-medium">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
