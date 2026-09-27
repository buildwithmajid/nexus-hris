import { useState } from 'react';
import { api } from '@/lib/api';

export function useLeaveOperations(onSuccess: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const handleApprove = async (id: string) => {
    setActionError('');
    setActionSuccess('');
    try {
      await api.leave.approveRequest(id);
      setActionSuccess('Pengajuan cuti berhasil disetujui & kehadiran otomatis disinkronkan!');
      await onSuccess();
    } catch (err: any) {
      setActionError(err.message || 'Gagal menyetujui permohonan cuti');
    }
  };

  const handleReject = async (id: string) => {
    setActionError('');
    setActionSuccess('');
    try {
      await api.leave.rejectRequest(id);
      setActionSuccess('Pengajuan cuti telah ditolak.');
      await onSuccess();
    } catch (err: any) {
      setActionError(err.message || 'Gagal menolak permohonan cuti');
    }
  };

  const handleCreateRequest = async (payload: {
    employeeId?: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
  }) => {
    setActionError('');
    setActionSuccess('');
    setIsSubmitting(true);
    try {
      await api.leave.createRequest(payload);
      setActionSuccess('Permohonan cuti berhasil diajukan!');
      await onSuccess();
      return true;
    } catch (err: any) {
      setActionError(err.message || 'Gagal mengajukan permohonan cuti');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    actionSuccess,
    actionError,
    setActionSuccess,
    setActionError,
    handleApprove,
    handleReject,
    handleCreateRequest,
  };
}
