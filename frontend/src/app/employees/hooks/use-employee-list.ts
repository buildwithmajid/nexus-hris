import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { DEFAULT_COMPANY } from '@/contexts/auth-context';

export function useEmployeeList() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedPtkp, setSelectedPtkp] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState<{ total: number; totalPages: number }>({ total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [unmaskNik, setUnmaskNik] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    employeeCode: '',
    nik: '',
    departmentId: '',
    positionId: '',
    maritalStatusPtkp: 'K/0',
    baseSalary: 8000000,
    fixedAllowance: 500000,
    contractType: 'PERMANENT',
    bankName: 'Bank Central Asia (BCA)',
    bankAccountNumber: '',
    joinDate: new Date().toISOString().split('T')[0],
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.employees.list(
        DEFAULT_COMPANY.id,
        search,
        page,
        limit,
        selectedDept || undefined,
        selectedPtkp || undefined,
      );
      setEmployees(res.data || []);
      const totalCount = res.meta?.total || 0;
      setMeta({
        total: totalCount,
        totalPages: (res.meta as any)?.totalPages || Math.ceil(totalCount / limit) || 1,
      });

      const deptRes = await api.organization.getDepartments(DEFAULT_COMPANY.id).catch(() => []);
      setDepartments(deptRes);

      if (deptRes.length > 0 && !formData.departmentId) {
        const posRes = await api.organization.getPositions(deptRes[0].id).catch(() => []);
        setPositions(posRes);
        setFormData((prev) => ({
          ...prev,
          departmentId: deptRes[0].id,
          positionId: posRes[0]?.id || '',
        }));
      }
    } catch (err: any) {
      console.error('Failed to load employees:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedDept, selectedPtkp, page, limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDepartmentChange = async (deptId: string) => {
    setFormData((prev) => ({ ...prev, departmentId: deptId }));
    try {
      const posRes = await api.organization.getPositions(deptId);
      setPositions(posRes);
      if (posRes.length > 0) {
        setFormData((prev) => ({ ...prev, positionId: posRes[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const mockUserId = crypto.randomUUID();

      await api.employees.create({
        ...formData,
        userId: mockUserId,
        companyId: DEFAULT_COMPANY.id,
        baseSalary: Number(formData.baseSalary),
        fixedAllowance: Number(formData.fixedAllowance),
      });

      setIsModalOpen(false);
      setFormData({
        fullName: '',
        employeeCode: '',
        nik: '',
        departmentId: departments[0]?.id || '',
        positionId: positions[0]?.id || '',
        maritalStatusPtkp: 'K/0',
        baseSalary: 8000000,
        fixedAllowance: 500000,
        contractType: 'PERMANENT',
        bankName: 'Bank Central Asia (BCA)',
        bankAccountNumber: '',
        joinDate: new Date().toISOString().split('T')[0],
      });
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menambahkan karyawan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDetail = async (emp: any) => {
    setIsDetailLoading(true);
    setUnmaskNik(false);
    setSelectedEmployee(emp);
    try {
      const fullDetail = await api.employees.get(emp.id);
      setSelectedEmployee(fullDetail);
    } catch (err) {
      console.error('Failed to fetch full employee details:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const formatRupiah = (val?: number) => {
    if (val === undefined || val === null) return 'Rp 0';
    return `Rp ${new Intl.NumberFormat('id-ID').format(val)}`;
  };

  const getTerBadge = (ptkp: string) => {
    if (['TK/0', 'TK/1', 'K/0'].includes(ptkp)) {
      return { text: 'TER A', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }
    if (['TK/2', 'TK/3', 'K/1', 'K/2'].includes(ptkp)) {
      return { text: 'TER B', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    return { text: 'TER C', color: 'bg-amber-50 text-amber-700 border-amber-200' };
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedDept('');
    setSelectedPtkp('');
    setPage(1);
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  return {
    employees,
    departments,
    positions,
    search,
    selectedDept,
    selectedPtkp,
    page,
    limit,
    meta,
    isLoading,
    isModalOpen,
    isSubmitting,
    errorMessage,
    selectedEmployee,
    isDetailLoading,
    unmaskNik,
    formData,
    setUnmaskNik,
    setLimit,
    setSearch,
    setSelectedDept,
    setSelectedPtkp,
    setPage,
    setFormData,
    setIsModalOpen,
    setIsSubmitting,
    setErrorMessage,
    setSelectedEmployee,
    loadData,
    handleDepartmentChange,
    handleCreateEmployee,
    handleOpenDetail,
    formatRupiah,
    getTerBadge,
    resetFilters,
    updateFormData,
  };
}
