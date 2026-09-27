import React, { useState, useMemo } from 'react';
import { Send, Info, ShieldCheck, Sparkles } from 'lucide-react';

interface LeaveRequestFormProps {
  employees: any[];
  leaveTypes: any[];
  isSubmitting: boolean;
  onSubmit: (payload: {
    employeeId?: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
  }) => Promise<boolean>;
}

export function LeaveRequestForm({
  employees,
  leaveTypes,
  isSubmitting,
  onSubmit,
}: LeaveRequestFormProps) {
  const [formEmployeeId, setFormEmployeeId] = useState(employees[0]?.id || '');
  const [formLeaveTypeId, setFormLeaveTypeId] = useState(leaveTypes[0]?.id || '');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [formReason, setFormReason] = useState('');
  const [localError, setLocalError] = useState('');

  const computedDays = useMemo(() => {
    if (!formStartDate || !formEndDate) return 1;
    const start = new Date(formStartDate);
    const end = new Date(formEndDate);
    if (end < start) return 0;

    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count === 0 ? 1 : count;
  }, [formStartDate, formEndDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (computedDays <= 0) {
      setLocalError('Rentang tanggal tidak valid');
      return;
    }
    if (!formReason.trim()) {
      setLocalError('Mohon isi alasan cuti');
      return;
    }

    const success = await onSubmit({
      employeeId: formEmployeeId || undefined,
      leaveTypeId: formLeaveTypeId,
      startDate: formStartDate,
      endDate: formEndDate,
      totalDays: computedDays,
      reason: formReason.trim(),
    });

    if (success) {
      setFormReason('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-5">
          Formulir Permohonan Cuti Karyawan
        </h2>
        {localError && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-800 text-sm">
            {localError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Karyawan Pemohon
            </label>
            <select
              value={formEmployeeId}
              onChange={(e) => setFormEmployeeId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeCode}) — {emp.department?.name || 'Umum'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Jenis Cuti
            </label>
            <select
              value={formLeaveTypeId}
              onChange={(e) => setFormLeaveTypeId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {leaveTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Kuota: {t.defaultQuotaDays} hari/thn, {t.isPaid ? 'Berbayar' : 'Unpaid'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Tanggal Mulai Cuti
              </label>
              <input
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Tanggal Selesai Cuti
              </label>
              <input
                type="date"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="bg-indigo-50/60 border border-indigo-100 rounded-lg p-3.5 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-indigo-900">
              <Info className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>Estimasi Durasi Kerja Terhitung (Senin s/d Jumat):</span>
            </div>
            <div className="text-base font-bold text-indigo-700 tabular-nums">
              {computedDays} Hari Kerja
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Keterangan / Alasan Cuti
            </label>
            <textarea
              rows={3}
              value={formReason}
              onChange={(e) => setFormReason(e.target.value)}
              placeholder="Contoh: Keperluan keluarga mendesak / Istirahat pemulihan kesehatan"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-50 transition"
          >
            {isSubmitting ? (
              <span>Mengirimkan pengajuan...</span>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Kirim Permohonan Cuti
              </>
            )}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            Ketentuan Regulasi Cuti (UU Ketenagakerjaan)
          </h3>
          <ul className="text-xs text-gray-600 space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
              <span><strong>Cuti Tahunan:</strong> Hak 12 hari kerja per tahun setelah masa kerja 12 bulan terus menerus (Pasal 79 UU No. 13/2003).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
              <span><strong>Cuti Sakit:</strong> Tetap mendapatkan upah penuh bila disertai surat keterangan dokter resmi.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
              <span><strong>Cuti Menikah:</strong> Diberikan 3 hari kerja dengan upah tetap dibayar penuh (Pasal 93 ayat 4).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
              <span><strong>Cuti Melahirkan:</strong> 1.5 bulan sebelum dan 1.5 bulan sesudah melahirkan (total 3 bulan).</span>
            </li>
          </ul>
        </div>

        <div className="bg-amber-50/70 rounded-xl border border-amber-200 p-4 text-xs text-amber-900 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold mb-1">Otomasi Proteksi Payroll:</strong>
            Saat cuti disetujui, kehadiran dicatat sebagai <code>ON_LEAVE</code> / <code>SICK</code> pada hari kerja kalender, sehingga karyawan <strong>tidak terkena penalti Alpha</strong> saat perhitungan gaji akhir bulan.
          </div>
        </div>
      </div>
    </div>
  );
}
