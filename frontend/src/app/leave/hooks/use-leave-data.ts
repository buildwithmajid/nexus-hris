import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DEFAULT_COMPANY } from '@/lib/auth-context';

export function useLeaveData(selectedYear: number) {
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [myBalances, setMyBalances] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setActionError('');
    try {
      const [typesRes, balRes, reqRes, empRes, myBalRes, myReqRes] = await Promise.all([
        api.leave.getTypes(),
        api.leave.getBalances(DEFAULT_COMPANY.id, selectedYear),
        api.leave.getRequests(DEFAULT_COMPANY.id, selectedYear),
        api.employees.list(DEFAULT_COMPANY.id),
        api.leave.getMyBalances(selectedYear),
        api.leave.getMyRequests(selectedYear),
      ]);

      setLeaveTypes(typesRes || []);
      setLeaveBalances(balRes || []);
      setLeaveRequests(reqRes || []);
      setMyBalances(myBalRes || []);
      setMyRequests(myReqRes || []);
      setEmployees(empRes.data || []);
    } catch (err: any) {
      setActionError(err.message || 'Gagal memuat data cuti');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedYear]);

  return {
    leaveTypes,
    leaveBalances,
    leaveRequests,
    myBalances,
    myRequests,
    employees,
    isLoading,
    actionError,
    setActionError,
    loadData,
  };
}
