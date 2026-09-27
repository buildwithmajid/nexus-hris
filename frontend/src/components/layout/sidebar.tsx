'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Receipt,
  Clock,
  UserCheck,
  CalendarCheck,
  ShieldCheck,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export function Sidebar() {
  const pathname = usePathname();
  const { user, company, logout, hasPermission } = useAuth();

  const isStaff = user?.roleName === 'staff';

  const navigation = [
    {
      name: 'Ikhtisar',
      href: '/',
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: 'Portal Mandiri (ESS)',
      href: '/portal',
      icon: UserCheck,
      show: true,
    },
    {
      name: 'Cuti & Perizinan',
      href: '/leave',
      icon: CalendarCheck,
      show: true,
    },
    {
      name: 'Master Karyawan',
      href: '/employees',
      icon: Users,
      show: !isStaff && hasPermission('employee.read'),
    },
    {
      name: 'Presensi & Lembur',
      href: '/attendance',
      icon: Clock,
      show: !isStaff && hasPermission('employee.read'),
    },
    {
      name: 'Pusat Penggajian',
      href: '/payroll',
      icon: Receipt,
      show: !isStaff && hasPermission('payroll.read'),
    },
    {
      name: 'Laporan & Biaya SDM',
      href: '/reports',
      icon: BarChart3,
      show: !isStaff && hasPermission('report.read'),
    },
    {
      name: 'Jejak Audit & Forensik',
      href: '/audit-logs',
      icon: ShieldCheck,
      show: !isStaff && hasPermission('config.manage'),
    },
    {
      name: 'Konfigurasi Sistem',
      href: '/settings',
      icon: Settings,
      show: !isStaff && hasPermission('config.manage'),
    },
  ];

  const getRoleDisplay = () => {
    switch (user?.roleName) {
      case 'super_admin':
        return { title: 'Super Administrator', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'hr_admin':
        return { title: 'HR Administrator', badge: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'finance':
        return { title: 'Finance Specialist', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'staff':
        return { title: 'Staff Karyawan', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
      default:
        return { title: 'Pengguna Sistem', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const role = getRoleDisplay();
  const userName = user?.email ? user.email.split('@')[0].replace('.', ' ') : 'Pengguna';

  return (
    <aside className="w-60 bg-white text-slate-600 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-200/90 select-none z-30 shadow-xs">
      {/* Brand & Organization Identity */}
      <div className="h-16 px-4 flex items-center border-b border-slate-200/80 bg-white">
        <div className="flex items-center space-x-3 w-full">
          <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm tracking-wide shadow-xs">
            NX
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-bold text-slate-950 tracking-tight leading-none">
              Nexus HRIS
            </span>
            <span className="text-[11px] text-slate-500 truncate mt-1 flex items-center gap-1 font-normal">
              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{company?.name || 'PT Nusantara Digital'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Navigasi Utama
        </div>
        {navigation.map((item) => {
          if (!item.show) return null;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            </Link>
          );
        })}
      </div>

      {/* User Profile Footer Card */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/70">
        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center justify-center shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate capitalize leading-tight">
                {userName}
              </div>
              <div className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                {role.title}
              </div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Keluar dari akun"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
