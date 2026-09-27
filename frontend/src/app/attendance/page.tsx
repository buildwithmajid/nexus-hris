'use client';

import React from 'react';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Calculator,
  Filter,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui';
import { useAttendance } from './hooks/use-attendance';
import { AttendanceKpi } from './components/attendance-kpi';
import { OvertimeTable } from './components/overtime-table';
import { AttendanceTable } from './components/attendance-table';
import { OvertimeModal } from './components/overtime-modal';
import { AttendanceModal } from './components/attendance-modal';

export default function AttendancePage() {
  const { hasPermission } = useAuth();
  const {
    activeTab,
    setActiveTab,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    attendanceLogs,
    overtimeList,
    employees,
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
    // Stats
    totalApprovedHours,
    pendingOtCount,
    presentCount,
    totalLogs,
    attendanceRate,
  } = useAttendance();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-subtle-border">
        <div>
          <h1 className="text-xl font-bold text-charcoal tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal" />
            <span>Presensi & Lembur Karyawan (Attendance Hub)</span>
          </h1>
          <p className="text-xs text-steel mt-0.5">
            Pencatatan kehadiran harian dan perhitungan lembur sesuai standar hukum Kepmenaker No. 102/2004 terintegrasi ke payroll.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center gap-1.5 bg-white border border-subtle-border rounded px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-steel" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-charcoal font-medium focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Bulan {i + 1}
                </option>
              ))}
            </select>
            <span className="text-steel">/</span>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-14 bg-transparent text-charcoal font-medium focus:outline-none"
            />
          </div>

          {hasPermission('attendance.correct') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncBiometrics}
              isLoading={isSimulating}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-teal" />}
              title="Tarik log presensi biometrik mesin fingerprint kantor pusat & cabang"
            >
              {isSimulating ? 'Menyinkronkan...' : 'Tarik Log Biometrik'}
            </Button>
          )}

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsOtModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Ajukan Lembur
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {actionError && (
        <div className="p-3 bg-danger-surface border border-danger-border text-danger text-xs rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="p-3 bg-success-surface border border-success-border text-success text-xs rounded flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Metric Cockpit */}
      <AttendanceKpi
        attendanceRate={attendanceRate}
        presentCount={presentCount}
        totalLogs={totalLogs}
        totalApprovedHours={totalApprovedHours}
        pendingOtCount={pendingOtCount}
      />

      {/* Navigation Tabs */}
      <div className="border-b border-subtle-border flex gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overtime')}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'overtime'
              ? 'border-teal text-navy'
              : 'border-transparent text-steel hover:text-charcoal'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-teal" />
          <span>Pengelolaan & Persetujuan Lembur ({overtimeList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'attendance'
              ? 'border-teal text-navy'
              : 'border-transparent text-steel hover:text-charcoal'
          }`}
        >
          <Filter className="w-3.5 h-3.5 text-teal" />
          <span>Log Presensi Karyawan ({attendanceLogs.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overtime' ? (
        <OvertimeTable
          overtimeList={overtimeList}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          canCorrect={hasPermission('attendance.correct')}
          onApprove={handleApproveOvertime}
          onReject={handleRejectOvertime}
        />
      ) : (
        <AttendanceTable
          attendanceLogs={attendanceLogs}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onOpenManualModal={() => setIsAttModalOpen(true)}
        />
      )}

      {/* Modals */}
      <OvertimeModal
        isOpen={isOtModalOpen}
        onClose={() => setIsOtModalOpen(false)}
        employees={employees}
        otEmployeeId={otEmployeeId}
        setOtEmployeeId={setOtEmployeeId}
        otDate={otDate}
        setOtDate={setOtDate}
        otHours={otHours}
        setOtHours={setOtHours}
        otIsHoliday={otIsHoliday}
        setOtIsHoliday={setOtIsHoliday}
        onSubmit={handleCreateOvertime}
      />

      <AttendanceModal
        isOpen={isAttModalOpen}
        onClose={() => setIsAttModalOpen(false)}
        employees={employees}
        attEmployeeId={attEmployeeId}
        setAttEmployeeId={setAttEmployeeId}
        attDate={attDate}
        setAttDate={setAttDate}
        attStatus={attStatus}
        setAttStatus={setAttStatus}
        attNotes={attNotes}
        setAttNotes={setAttNotes}
        onSubmit={handleLogAttendance}
      />
    </div>
  );
}
