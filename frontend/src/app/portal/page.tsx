'use client';

import React from 'react';
import {
  Receipt,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { usePortal } from './hooks/use-portal';
import { PortalHeader } from './components/portal-header';
import { PayslipTab } from './components/payslip-tab';
import { AttendanceTab } from './components/attendance-tab';
import { ProfileTab } from './components/profile-tab';
import { PortalOvertimeModal } from './components/portal-overtime-modal';

export default function PortalPage() {
  const {
    profile,
    slipData,
    attendanceLogs,
    overtimeList,
    activeTab,
    setActiveTab,
    selectedMonth,
    selectedYear,
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
  } = usePortal();

  return (
    <div className="space-y-6">
      {/* Employee Identity Banner */}
      <PortalHeader
        profile={profile}
        hasClockedToday={hasClockedToday}
        isClocking={isClocking}
        onClockIn={handleClockIn}
        onOpenOvertimeModal={() => setIsOtModalOpen(true)}
      />

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

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-subtle-border flex gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('slip')}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'slip'
              ? 'border-teal text-navy'
              : 'border-transparent text-steel hover:text-charcoal'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-teal" />
          <span>Slip Gaji Saya</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'attendance'
              ? 'border-teal text-navy'
              : 'border-transparent text-steel hover:text-charcoal'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-teal" />
          <span>Presensi & Lembur Saya ({attendanceLogs.length} Log)</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'border-teal text-navy'
              : 'border-transparent text-steel hover:text-charcoal'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-teal" />
          <span>Data Kepesertaan Statuter</span>
        </button>
      </div>

      {/* Sub-Tab Contents */}
      {activeTab === 'slip' && <PayslipTab slipData={slipData} />}

      {activeTab === 'attendance' && (
        <AttendanceTab
          attendanceLogs={attendanceLogs}
          overtimeList={overtimeList}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onOpenOvertimeModal={() => setIsOtModalOpen(true)}
        />
      )}

      {activeTab === 'profile' && <ProfileTab profile={profile} />}

      {/* Modal: Ajukan Lembur Mandiri */}
      <PortalOvertimeModal
        isOpen={isOtModalOpen}
        onClose={() => setIsOtModalOpen(false)}
        profile={profile}
        otDate={otDate}
        setOtDate={setOtDate}
        otHours={otHours}
        setOtHours={setOtHours}
        otIsHoliday={otIsHoliday}
        setOtIsHoliday={setOtIsHoliday}
        onSubmit={handleCreateOvertime}
      />
    </div>
  );
}
