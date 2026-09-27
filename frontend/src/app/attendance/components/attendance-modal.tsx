'use client';

import React from 'react';
import { Modal, Button, Input } from '@/components/ui';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: any[];
  attEmployeeId: string;
  setAttEmployeeId: (id: string) => void;
  attDate: string;
  setAttDate: (date: string) => void;
  attStatus: string;
  setAttStatus: (status: string) => void;
  attNotes: string;
  setAttNotes: (notes: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AttendanceModal({
  isOpen,
  onClose,
  employees,
  attEmployeeId,
  setAttEmployeeId,
  attDate,
  setAttDate,
  attStatus,
  setAttStatus,
  attNotes,
  setAttNotes,
  onSubmit,
}: AttendanceModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Presensi Karyawan"
      subtitle="Input presensi manual dan penyesuaian izin kerja"
      maxWidth="md"
    >
      <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Karyawan
          </label>
          <select
            value={attEmployeeId}
            onChange={(e) => setAttEmployeeId(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-charcoal focus:outline-none focus:border-teal"
            required
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName} ({emp.employeeCode})
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Tanggal"
          type="date"
          value={attDate}
          onChange={(e) => setAttDate(e.target.value)}
          required
        />

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Status
          </label>
          <select
            value={attStatus}
            onChange={(e) => setAttStatus(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-charcoal focus:outline-none focus:border-teal"
          >
            <option value="PRESENT">Hadir (PRESENT)</option>
            <option value="LATE">Terlambat (LATE)</option>
            <option value="PERMIT">Izin Resmi (PERMIT)</option>
            <option value="SICK">Sakit (SICK)</option>
            <option value="ABSENT">Alpha / Tidak Hadir (ABSENT)</option>
          </select>
        </div>

        <Input
          label="Catatan / Alasan"
          type="text"
          placeholder="Contoh: Surat dokter terlampir"
          value={attNotes}
          onChange={(e) => setAttNotes(e.target.value)}
        />

        <div className="pt-2 border-t border-subtle-border flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            Simpan Presensi
          </Button>
        </div>
      </form>
    </Modal>
  );
}
