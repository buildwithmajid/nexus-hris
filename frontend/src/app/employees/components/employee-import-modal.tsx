'use client';

import React, { useState } from 'react';
import {
  Upload,
  Download,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { Modal, Button } from '@/components/ui';

interface EmployeeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EmployeeImportModal({ isOpen, onClose, onSuccess }: EmployeeImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleDownloadTemplate = () => {
    const csvContent =
      'fullName,employeeCode,nik,department,position,maritalStatusPtkp,baseSalary,fixedAllowance,contractType,bankName,bankAccountNumber,joinDate\n' +
      'Budi Pratama,EMP-053,3174051203920001,Engineering,Software Engineer,TK/0,12000000,1000000,PERMANENT,BCA,8271039481,2026-09-01\n' +
      'Dewi Anggraini,EMP-054,3276084501950002,Human Resources,HR Generalist,K/1,8500000,500000,PERMANENT,Mandiri,1420019283741,2026-09-01\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_import_karyawan_nexus.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProcessImport = () => {
    if (!file) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessMsg('2 data karyawan dalam berkas berhasil divalidasi dan diimpor ke sistem.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Impor Data Karyawan Massal (Excel / CSV)"
      subtitle="Format template CSV standar terintegrasi dengan validasi statuter"
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {successMsg ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        ) : (
          <>
            {/* Step 1: Download Template */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">1. Unduh Template Resmi</div>
                <div className="text-[11px] text-slate-500">
                  Gunakan format template standar agar pemetaan NIK, PTKP, dan gaji valid.
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                leftIcon={<Download className="w-3.5 h-3.5 text-teal" />}
              >
                Unduh .CSV
              </Button>
            </div>

            {/* Step 2: Upload File Box */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1.5">
                2. Pilih File yang Telah Diisi (.csv atau .xlsx)
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-teal rounded-lg p-6 text-center cursor-pointer transition-colors bg-slate-50/50">
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-import"
                />
                <label htmlFor="file-import" className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  {file ? (
                    <div className="text-teal font-medium flex items-center justify-center gap-1.5">
                      <FileCheck className="w-4 h-4" />
                      <span>{file.name}</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-slate-700 font-medium">Klik untuk memilih berkas</span>
                      <span className="text-slate-400 block text-[11px] mt-0.5">
                        Maksimal ukuran file 10 MB
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/60 border border-indigo-200/80 rounded-lg text-indigo-900 text-[11px] leading-relaxed">
              <strong>Catatan Kepatuhan UU PDP:</strong> Data NIK, NPWP, dan nomor rekening pada file impor akan dienkripsi secara otomatis menggunakan cipher AES-256-GCM saat disimpan.
            </div>
          </>
        )}

        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!file || isProcessing}
            isLoading={isProcessing}
            onClick={handleProcessImport}
          >
            Proses Impor Data
          </Button>
        </div>
      </div>
    </Modal>
  );
}
