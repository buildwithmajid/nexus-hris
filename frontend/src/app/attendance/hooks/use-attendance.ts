'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DEFAULT_COMPANY } from '@/contexts/auth-context';

export function useAttendance() {
  const [activeTab, setActiveTab] = useState<'overtime' | 'attendance'>('overtime');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [overtimeList, setOvertimeList] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Modals
  const [isOtModalOpen, setIsOtModalOpen] = useState(false);
  const [otEmployeeId, setOtEmployeeId] = useState('');
  const [otDate, setOtDate] = useState(new Date().toISOString().split('T')[0]);
  const [otHours, setOtHours] = useState(2);
  const [otIsHoliday, setOtIsHoliday] = useState(false);

  const [isAttModalOpen, setIsAttModalOpen] = useState(false);
  const [attEmployeeId, setAttEmployeeId] = useState('');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attStatus, setAttStatus] = useState('PRESENT');
  const [attNotes, setAttNotes] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setActionError('');
    try {
      const [attRes, otRes, empRes] = await Promise.all([
        api.attendance.getAttendance(DEFAULT_COMPANY.id, selectedMonth, selectedYear),
        api.attendance.getOvertime(DEFAULT_COMPANY.id, selectedMonth, selectedYear),
        api.employees.list(DEFAULT_COMPANY.id),
      ]);
      setAttendanceLogs(attRes);
      setOvertimeList(otRes);
      setEmployees(empRes.data || []);
      if (empRes.data && empRes.data.length > 0 && !otEmployeeId) {
        setOtEmployeeId(empRes.data[0].id);
        setAttEmployeeId(empRes.data[0].id);
      }
    } catch (err: any) {
      setActionError(err.message || 'Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const handleSyncBiometrics = async () => {
    setIsSimulating(true);
    setActionError('');
    setActionSuccess('');
    try {
      await api.attendance.simulateMonth(
        DEFAULT_COMPANY.id,
        selectedMonth,
        selectedYear,
      );
      setActionSuccess('Sinkronisasi log presensi biometrik kantor berhasil diperbarui ke sistem.');
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Gagal melakukan sinkronisasi mesin presensi');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCreateOvertime = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    try {
      await api.attendance.createOvertime({
        employeeId: otEmployeeId,
        date: otDate,
        hours: Number(otHours),
        isHoliday: otIsHoliday,
      });
      setIsOtModalOpen(false);
      setActionSuccess('Pengajuan lembur berhasil dicatat (Menunggu Verifikasi).');
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Gagal mengajukan lembur');
    }
  };

  const handleApproveOvertime = async (id: string) => {
    setActionError('');
    try {
      await api.attendance.approveOvertime(id);
      setActionSuccess('Lembur berhasil disetujui (Approved). Siap dihitung pada siklus payroll.');
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Gagal menyetujui lembur');
    }
  };

  const handleRejectOvertime = async (id: string) => {
    setActionError('');
    try {
      await api.attendance.rejectOvertime(id);
      setActionSuccess('Lembur berhasil ditolak (Rejected).');
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Gagal menolak lembur');
    }
  };

  const handleLogAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    try {
      await api.attendance.logAttendance({
        employeeId: attEmployeeId,
        date: attDate,
        status: attStatus,
        notes: attNotes,
      });
      setIsAttModalOpen(false);
      setActionSuccess('Presensi berhasil dicatat.');
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Gagal mencatat presensi');
    }
  };

  // Stats calculation
  const totalApprovedHours = overtimeList
    .filter((o) => o.status === 'APPROVED')
    .reduce((acc, curr) => acc + Number(curr.hours), 0);

  const pendingOtCount = overtimeList.filter((o) => o.status === 'PENDING').length;
  const presentCount = attendanceLogs.filter(
    (a) => a.status === 'PRESENT' || a.status === 'LATE',
  ).length;
  const totalLogs = attendanceLogs.length;
  const attendanceRate = totalLogs > 0 ? Math.round((presentCount / totalLogs) * 100) : 100;

  return {
    activeTab,
    setActiveTab,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    attendanceLogs,
    overtimeList,
    employees,
    isLoading,
    isSimulating,
    actionSuccess,
    actionError,
    // Overtime Modal
    isOtModalOpen,
    setIsOtModalOpen,
    otEmployeeId,
    setOtEmployeeId,
    otDate,
    setOtDate,
    otHours,
    setOtHours,
    otIsHoliday,
    setOtIsHoliday,
    // Attendance Modal
    isAttModalOpen,
    setIsAttModalOpen,
    attEmployeeId,
    setAttEmployeeId,
    attDate,
    setAttDate,
    attStatus,
    setAttStatus,
    attNotes,
    setAttNotes,
    // Handlers
    handleSyncBiometrics,
    handleCreateOvertime,
    handleApproveOvertime,
    handleRejectOvertime,
    handleLogAttendance,
    loadData,
    // Stats
    totalApprovedHours,
    pendingOtCount,
    presentCount,
    totalLogs,
    attendanceRate,
  };
}
