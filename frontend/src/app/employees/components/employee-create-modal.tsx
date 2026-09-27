'use client';

import React from 'react';
import { Modal, Button, Input } from '@/components/ui';

interface Position {
  id: string;
  title: string;
  level: number;
}

interface Department {
  id: string;
  name: string;
}

interface EmployeeCreateModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage: string;
  formData: {
    fullName: string;
    employeeCode: string;
    nik: string;
    departmentId: string;
    positionId: string;
    maritalStatusPtkp: string;
    baseSalary: number;
    fixedAllowance: number;
    contractType: string;
    bankName: string;
    bankAccountNumber: string;
    joinDate: string;
  };
  departments: Department[];
  positions: Position[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onDepartmentChange: (deptId: string) => void;
  onFormDataChange: (updates: Partial<EmployeeCreateModalProps['formData']>) => void;
}

export function EmployeeCreateModal({
  isOpen,
  isSubmitting,
  errorMessage,
  formData,
  departments,
  positions,
  onClose,
  onSubmit,
  onDepartmentChange,
  onFormDataChange,
}: EmployeeCreateModalProps) {
  const handleInputChange = (field: keyof typeof formData, value: any) => {
    onFormDataChange({ [field]: value });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Karyawan Baru"
      subtitle="Registrasi data profil, perpajakan, dan kompensasi upah"
      maxWidth="xl"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-danger-surface border border-danger-border text-danger text-xs rounded">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nama Lengkap Sesuai KTP"
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder="Contoh: Ahmad Fauzi"
          />

          <Input
            label="Nomor Induk Karyawan (NIK Internal)"
            type="text"
            required
            value={formData.employeeCode}
            onChange={(e) => handleInputChange('employeeCode', e.target.value)}
            placeholder="Contoh: NX-053"
            className="font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nomor KTP (16 Digit NIK)"
            type="text"
            maxLength={16}
            value={formData.nik}
            onChange={(e) => handleInputChange('nik', e.target.value)}
            placeholder="3171012805900001"
            className="font-mono"
          />

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Status Pajak PTKP (PMK 168/2023)
            </label>
            <select
              value={formData.maritalStatusPtkp}
              onChange={(e) => handleInputChange('maritalStatusPtkp', e.target.value)}
              className="w-full px-3 py-1.5 bg-canvas border border-slate-300 rounded text-xs text-charcoal focus:outline-none focus:border-teal"
            >
              <option value="TK/0">TK/0 (Kategori TER A)</option>
              <option value="TK/1">TK/1 (Kategori TER A)</option>
              <option value="K/0">K/0 (Kategori TER A)</option>
              <option value="TK/2">TK/2 (Kategori TER B)</option>
              <option value="TK/3">TK/3 (Kategori TER B)</option>
              <option value="K/1">K/1 (Kategori TER B)</option>
              <option value="K/2">K/2 (Kategori TER B)</option>
              <option value="K/3">K/3 (Kategori TER C)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Departemen
            </label>
            <select
              value={formData.departmentId}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="w-full px-3 py-1.5 bg-canvas border border-slate-300 rounded text-xs text-charcoal focus:outline-none focus:border-teal"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Jabatan Struktural
            </label>
            <select
              value={formData.positionId}
              onChange={(e) => handleInputChange('positionId', e.target.value)}
              className="w-full px-3 py-1.5 bg-canvas border border-slate-300 rounded text-xs text-charcoal focus:outline-none focus:border-teal"
            >
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (Level {p.level})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Gaji Pokok Bulanan (Rp)"
            type="number"
            required
            min={1000000}
            step={100000}
            value={formData.baseSalary}
            onChange={(e) => handleInputChange('baseSalary', Number(e.target.value))}
          />

          <Input
            label="Tunjangan Tetap Bulanan (Rp)"
            type="number"
            min={0}
            step={50000}
            value={formData.fixedAllowance}
            onChange={(e) => handleInputChange('fixedAllowance', Number(e.target.value))}
          />
        </div>

        <div className="pt-3 border-t border-subtle-border flex justify-end gap-2">
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
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Karyawan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
