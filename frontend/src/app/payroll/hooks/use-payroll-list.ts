import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth, DEFAULT_COMPANY } from '@/contexts/auth-context';

export function usePayrollList() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [periodDetail, setPeriodDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadPeriodDetail = async (periodId: string) => {
    try {
      const res = await api.payroll.getPeriodDetail(periodId);
      setPeriodDetail(res);
    } catch (err: any) {
      console.error(err);
    }
  };

  const loadPeriods = async () => {
    setIsLoading(true);
    setActionError('');
    try {
      const res = await api.payroll.getPeriods(DEFAULT_COMPANY.id);
      setPeriods(res);
      if (res.length > 0) {
        const activeId = selectedPeriodId || res[0].id;
        setSelectedPeriodId(activeId);
        await loadPeriodDetail(activeId);
      } else {
        setPeriodDetail(null);
      }
    } catch (err: any) {
      setActionError(err.message || 'Gagal memuat data periode');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPeriods();
  }, []);

  const handleSelectPeriod = async (id: string) => {
    setSelectedPeriodId(id);
    await loadPeriodDetail(id);
  };

  const handleCalculateBatch = async () => {
    if (!selectedPeriodId) return;
    setActionError('');
    setActionSuccess('');

    try {
      const res = await api.payroll.calculateBatch(selectedPeriodId, 22);
      setActionSuccess(res.message);
      await loadPeriodDetail(selectedPeriodId);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleSubmitPeriod = async () => {
    if (!selectedPeriodId) return;
    setActionError('');
    try {
      await api.payroll.submit(selectedPeriodId);
      setActionSuccess('Periode berhasil diajukan untuk verifikasi.');
      await loadPeriods();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleApprovePeriod = async () => {
    if (!selectedPeriodId) return;
    setActionError('');
    try {
      await api.payroll.approve(selectedPeriodId);
      setActionSuccess('Periode penggajian berhasil disetujui (Approved).');
      await loadPeriods();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleLockPeriod = async () => {
    if (!selectedPeriodId) return;
    if (
      !confirm(
        'Apakah Anda yakin ingin mengunci periode ini secara permanen? Data tidak dapat diubah lagi.',
      )
    ) {
      return;
    }
    setActionError('');
    try {
      await api.payroll.lock(selectedPeriodId);
      setActionSuccess('Periode telah berhasil DIKUNCI secara permanen (Immutable Audit Locked).');
      await loadPeriods();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleCreatePeriod = async (month: number, year: number) => {
    setActionError('');
    try {
      await api.payroll.createPeriod(DEFAULT_COMPANY.id, month, year);
      await loadPeriods();
    } catch (err: any) {
      setActionError(err.message || 'Gagal membuat periode');
    }
  };

  const handleViewSlip = async (employeeId: string) => {
    try {
      const slip = await api.payroll.getSlip(selectedPeriodId, employeeId);
      return slip;
    } catch (err: any) {
      throw new Error(err.message || 'Gagal mengambil slip');
    }
  };

  return {
    periods,
    selectedPeriodId,
    periodDetail,
    isLoading,
    actionError,
    actionSuccess,
    setActionError,
    setActionSuccess,
    handleSelectPeriod,
    handleCalculateBatch,
    handleSubmitPeriod,
    handleApprovePeriod,
    handleLockPeriod,
    handleCreatePeriod,
    handleViewSlip,
  };
}
