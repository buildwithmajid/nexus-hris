'use client';

import React from 'react';
import { Calculator } from 'lucide-react';
import { Modal, Button, Input } from '@/components/ui';

interface OvertimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: any[];
  otEmployeeId: string;
  setOtEmployeeId: (id: string) => void;
  otDate: string;
  setOtDate: (date: string) => void;
  otHours: number;
  setOtHours: (hours: number) => void;
  otIsHoliday: boolean;
  setOtIsHoliday: (isHoliday: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function OvertimeModal({
  isOpen,
  onClose,
  employees,
  otEmployeeId,
  setOtEmployeeId,
  otDate,
  setOtDate,
  otHours,
  setOtHours,
  otIsHoliday,
  setOtIsHoliday,
  onSubmit,
}: OvertimeModalProps) {
  const formatRupiah = (val?: number) => {
    if (val === undefined || val === null) return 'Rp 0';
    return `Rp ${new Intl.NumberFormat('id-ID').format(val)}`;
  };

  const selectedEmp = employees.find((e) => e.id === otEmployeeId);
  const baseSalary = selectedEmp?.baseSalary ? Number(selectedEmp.baseSalary) : 0;
  const hourlyRate = baseSalary > 0 ? baseSalary / 173 : 0;

  const calculateOtEstimate = (hours: number, isHoliday: boolean) => {
    if (hourlyRate <= 0 || hours <= 0) return 0;
    let multiplierTotal = 0;
    if (!isHoliday) {
      if (hours <= 1) {
        multiplierTotal = hours * 1.5;
      } else {
        multiplierTotal = 1.5 + (hours - 1) * 2.0;
      }
    } else {
      if (hours <= 8) {
        multiplierTotal = hours * 2.0;
      } else if (hours <= 9) {
        multiplierTotal = 8 * 2.0 + (hours - 8) * 3.0;
      } else {
        multiplierTotal = 8 * 2.0 + 1 * 3.0 + (hours - 9) * 4.0;
      }
    }
    return Math.round(multiplierTotal * hourlyRate);
  };

  const otEstimatedAmount = calculateOtEstimate(Number(otHours), otIsHoliday);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengajuan Lembur (Kepmenaker 102/2004)"
      subtitle="Kalkulasi upah lembur resmi berbasis 1/173 gaji pokok bulanan"
      maxWidth="lg"
    >
      <form onSubmit={onSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Pilih Karyawan
          </label>
          <select
            value={otEmployeeId}
            onChange={(e) => setOtEmployeeId(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-charcoal focus:outline-none focus:border-teal"
            required
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName} ({emp.employeeCode}) — Gaji: {formatRupiah(Number(emp.baseSalary))}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Tanggal Pelaksanaan Lembur"
            type="date"
            value={otDate}
            onChange={(e) => setOtDate(e.target.value)}
            required
          />

          <Input
            label="Durasi Lembur (Jam)"
            type="number"
            step="0.5"
            min="0.5"
            max="14"
            value={otHours}
            onChange={(e) => setOtHours(Number(e.target.value))}
            required
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Kategori Hari Lembur
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label
              className={`flex items-center gap-2 p-2.5 rounded border cursor-pointer transition-colors ${
                !otIsHoliday
                  ? 'border-teal bg-teal/5 text-navy font-semibold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="otType"
                checked={!otIsHoliday}
                onChange={() => setOtIsHoliday(false)}
                className="text-teal"
              />
              <span>Hari Kerja Biasa</span>
            </label>

            <label
              className={`flex items-center gap-2 p-2.5 rounded border cursor-pointer transition-colors ${
                otIsHoliday
                  ? 'border-teal bg-teal/5 text-navy font-semibold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="otType"
                checked={otIsHoliday}
                onChange={() => setOtIsHoliday(true)}
                className="text-teal"
              />
              <span>Hari Libur Resmi / Weekend</span>
            </label>
          </div>
        </div>

        {/* LIVE FORMULA CALCULATOR PREVIEW BOX */}
        <div className="p-3 bg-canvas border border-teal/30 rounded space-y-1.5 text-[11px]">
          <div className="font-semibold text-charcoal flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-teal">
              <Calculator className="w-3.5 h-3.5" />
              Simulasi Estimasi Upah Lembur (Kepmenaker 102/2004)
            </span>
            <span className="text-navy font-bold tabular-nums">
              {formatRupiah(otEstimatedAmount)}
            </span>
          </div>
          <div className="text-slate-500 leading-relaxed text-[10px]">
            • Upah 1 Jam: Gaji Pokok ({formatRupiah(baseSalary)}) / 173 = {formatRupiah(Math.round(hourlyRate))}
            <br />
            • Aturan Multiplier:{' '}
            {!otIsHoliday
              ? 'Jam ke-1: 1.5×, Jam berikutnya: 2.0×'
              : 'Jam 1-8: 2.0×, Jam ke-9: 3.0×, Jam 10+: 4.0×'}
          </div>
        </div>

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
            Ajukan Lembur
          </Button>
        </div>
      </form>
    </Modal>
  );
}
