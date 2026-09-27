'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function usePortal() {
  const [profile, setProfile] = useState<any>(null);
  const [slipData, setSlipData] = useState<any>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [overtimeList, setOvertimeList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active tab
  const [activeTab, setActiveTab] = useState<'slip' | 'attendance' | 'profile'>('slip');

  // Month & Year state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Overtime Form Modal
  const [isOtModalOpen, setIsOtModalOpen] = useState(false);
  const [otDate, setOtDate] = useState(new Date().toISOString().split('T')[0]);
  const [otHours, setOtHours] = useState(2);
  const [otIsHoliday, setOtIsHoliday] = useState(false);

  // Notification state
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [isClocking, setIsClocking] = useState(false);

  // Load Data
  const loadPortalData = async () => {
    setIsLoading(true);
    setActionError('');
    try {
      const [empRes, slipRes, attRes, otRes] = await Promise.allSettled([
        api.employees.getMe(),
        api.payroll.getMySlip(),
        api.attendance.getMyLogs(selectedMonth, selectedYear),
        api.attendance.getMyOvertime(selectedMonth, selectedYear),
      ]);

      if (empRes.status === 'fulfilled') setProfile(empRes.value);
      if (slipRes.status === 'fulfilled') setSlipData(slipRes.value);
      if (attRes.status === 'fulfilled') setAttendanceLogs(attRes.value);
      if (otRes.status === 'fulfilled') setOvertimeList(otRes.value);
    } catch (err: any) {
      setActionError(err.message || 'Gagal memuat data portal karyawan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, [selectedMonth, selectedYear]);

  // Actions
  const handleClockIn = async () => {
    setIsClocking(true);
    setActionError('');
    setActionSuccess('');
    try {
      await api.attendance.myClock('PRESENT', 'Presensi Mandiri via Portal Karyawan');
      setActionSuccess('Presensi hari ini berhasil dicatat (Status: HADIR).');
      const attRes = await api.attendance.getMyLogs(selectedMonth, selectedYear);
      setAttendanceLogs(attRes);
    } catch (err: any) {
      setActionError(err.message || 'Gagal melakukan presensi');
    } finally {
      setIsClocking(false);
    }
  };

  const handleCreateOvertime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setActionError('');
    try {
      await api.attendance.createOvertime({
        employeeId: profile.id,
        date: otDate,
        hours: Number(otHours),
        isHoliday: otIsHoliday,
      });
      setIsOtModalOpen(false);
      setActionSuccess('Pengajuan lembur berhasil dikirim. Menunggu persetujuan atasan/HR.');
      const otRes = await api.attendance.getMyOvertime(selectedMonth, selectedYear);
      setOvertimeList(otRes);
    } catch (err: any) {
      setActionError(err.message || 'Gagal mengajukan lembur');
    }
  };

  // Check today's clock in
  const todayStr = new Date().toISOString().split('T')[0];
  const hasClockedToday = attendanceLogs.some(
    (a) => a.date?.startsWith(todayStr) && a.status === 'PRESENT',
  );

  return {
    profile,
    slipData,
    attendanceLogs,
    overtimeList,
    isLoading,
    activeTab,
    setActiveTab,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    isOtModalOpen,
    setIsOtModalOpen,
    otDate,
    setOtDate,
    otHours,
    setOtHours,
    otIsHoliday,
    setOtIsHoliday,
    actionSuccess,
    actionError,
    isClocking,
    hasClockedToday,
    handleClockIn,
    handleCreateOvertime,
    loadPortalData,
  };
}
