'use client';

import React from 'react';
import { CheckCircle, Plus } from 'lucide-react';
import { Button, Badge } from '@/components/ui';

interface PortalHeaderProps {
  profile: any;
  hasClockedToday: boolean;
  isClocking: boolean;
  onClockIn: () => void;
  onOpenOvertimeModal: () => void;
}

export function PortalHeader({
  profile,
  hasClockedToday,
  isClocking,
  onClockIn,
  onOpenOvertimeModal,
}: PortalHeaderProps) {
  return (
    <div className="bg-white border border-subtle-border rounded p-5 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-navy text-white flex items-center justify-center font-bold text-lg tracking-wider shrink-0 border-2 border-teal">
          {profile?.fullName
            ? profile.fullName
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .slice(0, 2)
            : 'ST'}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-charcoal tracking-tight">
              {profile?.fullName || 'Memuat Profil...'}
            </h1>
            <Badge variant="teal">
              {profile?.employeeCode || 'EMP-XXXX'}
            </Badge>
            <Badge variant="success">
              Aktif ({profile?.contractType || 'PERMANENT'})
            </Badge>
          </div>
          <p className="text-xs text-steel mt-1 flex items-center gap-2">
            <span>{profile?.department?.name || 'Divisi'}</span>
            <span>•</span>
            <span className="font-medium text-charcoal">{profile?.position?.title || 'Jabatan'}</span>
            <span>•</span>
            <span>PTKP: <strong className="text-navy">{profile?.maritalStatusPtkp || 'TK/0'}</strong></span>
          </p>
        </div>
      </div>

      {/* Quick Self-Service Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant={hasClockedToday ? 'outline' : 'secondary'}
          onClick={onClockIn}
          disabled={isClocking || hasClockedToday}
          isLoading={isClocking}
          leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
          className={hasClockedToday ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default' : ''}
        >
          {hasClockedToday ? 'Sudah Presensi Hari Ini' : isClocking ? 'Mencatat...' : 'Presensi Masuk (Clock-In)'}
        </Button>

        <Button
          size="sm"
          variant="primary"
          onClick={onOpenOvertimeModal}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Ajukan Lembur
        </Button>
      </div>
    </div>
  );
}
