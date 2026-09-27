/**
 * Nexus HRIS Frontend API Client
 * Berkomunikasi dengan NestJS backend di http://localhost:3000/api/v1
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface ApiError {
  statusCode: number;
  message: string | string[];
  timestamp: string;
  path: string;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nexus_access_token');
}

export function setStoredToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nexus_access_token', token);
  }
}

export function clearStoredToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('nexus_access_token');
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || 'Terjadi kesalahan sistem';
    throw new Error(errorMsg);
  }

  return data as T;
}

// =============================================================================
// API Service Methods
// =============================================================================

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiFetch<{ accessToken: string; refreshToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () =>
      apiFetch<{
        id: string;
        email: string;
        roleId: string;
        roleName: string;
        permissions: string[];
      }>('/auth/me'),
  },

  organization: {
    getCompanies: () =>
      apiFetch<
        Array<{
          id: string;
          name: string;
          riskClassJkk?: string;
          address?: string;
        }>
      >('/organization/companies'),
    getDepartments: (companyId: string) =>
      apiFetch<Array<{ id: string; name: string }>>(
        `/organization/companies/${companyId}/departments`,
      ),
    getPositions: (departmentId: string) =>
      apiFetch<Array<{ id: string; title: string; level: number }>>(
        `/organization/departments/${departmentId}/positions`,
      ),
  },

  employees: {
    list: (
      companyId: string,
      search?: string,
      page: number = 1,
      limit: number = 20,
      departmentId?: string,
      ptkp?: string,
    ) => {
      const q = new URLSearchParams({ companyId, page: String(page), limit: String(limit) });
      if (search) q.append('search', search);
      if (departmentId) q.append('departmentId', departmentId);
      if (ptkp) q.append('ptkp', ptkp);
      return apiFetch<{
        data: Array<{
          id: string;
          employeeCode: string;
          fullName: string;
          maritalStatusPtkp: string;
          baseSalary: number;
          fixedAllowance: number;
          contractType: string;
          employmentStatus: string;
          nik?: string;
          bankName?: string;
          department: { name: string };
          position: { title: string };
        }>;
        meta: { total: number; page: number; limit: number };
      }>(`/employees?${q.toString()}`);
    },
    get: (id: string) =>
      apiFetch<any>(`/employees/${id}`),
    create: (payload: any) =>
      apiFetch<any>('/employees', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getMe: () =>
      apiFetch<any>('/employees/me'),
  },

  payroll: {
    getMySlip: (periodId?: string) =>
      apiFetch<any>(periodId ? `/payroll/my-slip?periodId=${periodId}` : '/payroll/my-slip'),
    getPeriods: (companyId: string, year?: number) => {
      const q = new URLSearchParams({ companyId });
      if (year) q.append('year', String(year));
      return apiFetch<
        Array<{
          id: string;
          month: number;
          year: number;
          status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'LOCKED';
          lockedAt?: string;
          processedBy?: { email: string };
          approvedBy?: { email: string };
          _count: { payrollDetails: number };
        }>
      >(`/payroll/periods?${q.toString()}`);
    },
    getPeriodDetail: (periodId: string) =>
      apiFetch<{
        period: {
          id: string;
          month: number;
          year: number;
          status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'LOCKED';
          company: { name: string };
          payrollDetails: Array<{
            id: string;
            employeeId: string;
            baseSalary: number;
            fixedAllowance: number;
            overtimeAmount: number;
            grossIncome: number;
            bpjsKesehatanEmployee: number;
            bpjsTkEmployee: number;
            pph21Amount: number;
            netSalary: number;
            employee: {
              id: string;
              employeeCode: string;
              fullName: string;
              maritalStatusPtkp: string;
              department: { name: string };
              position: { title: string };
            };
          }>;
        };
        summary: {
          totalGross: number;
          totalPph21: number;
          totalBpjsEmployee: number;
          totalNet: number;
        };
      }>(`/payroll/periods/${periodId}`),
    createPeriod: (companyId: string, month: number, year: number) =>
      apiFetch<any>('/payroll/periods', {
        method: 'POST',
        body: JSON.stringify({ companyId, month, year }),
      }),
    calculateBatch: (periodId: string, totalWorkingDays = 22) =>
      apiFetch<{ message: string; calculatedCount: number }>(
        `/payroll/periods/${periodId}/calculate`,
        {
          method: 'POST',
          body: JSON.stringify({ totalWorkingDays }),
        },
      ),
    submit: (periodId: string) =>
      apiFetch<any>(`/payroll/periods/${periodId}/submit`, { method: 'POST' }),
    approve: (periodId: string) =>
      apiFetch<any>(`/payroll/periods/${periodId}/approve`, { method: 'POST' }),
    lock: (periodId: string) =>
      apiFetch<any>(`/payroll/periods/${periodId}/lock`, { method: 'POST' }),
    getSlip: (periodId: string, employeeId: string) =>
      apiFetch<{
        detail: {
          grossIncome: number;
          netSalary: number;
          payrollPeriod: {
            month: number;
            year: number;
            company: { name: string; address?: string };
          };
          employee: {
            employeeCode: string;
            fullName: string;
            maritalStatusPtkp: string;
            bankName?: string;
            department: { name: string };
            position: { title: string };
          };
        };
        earnings: Array<{ componentName: string; amount: number }>;
        deductions: Array<{ componentName: string; amount: number }>;
      }>(`/payroll/periods/${periodId}/slips/${employeeId}`),
  },

  attendance: {
    getAttendance: (companyId: string, month: number, year: number) =>
      apiFetch<
        Array<{
          id: string;
          employeeId: string;
          date: string;
          status: string;
          notes?: string;
          employee: {
            id: string;
            fullName: string;
            employeeCode: string;
            department: { name: string };
            position: { title: string };
          };
        }>
      >(`/attendance?companyId=${companyId}&month=${month}&year=${year}`),

    logAttendance: (dto: { employeeId: string; date: string; status: string; notes?: string }) =>
      apiFetch<any>('/attendance/log', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),

    simulateMonth: (companyId: string, month: number, year: number) =>
      apiFetch<{ message: string; totalRecords: number }>(
        `/attendance/simulate-month?companyId=${companyId}&month=${month}&year=${year}`,
        { method: 'POST' },
      ),

    getOvertime: (companyId: string, month?: number, year?: number) => {
      const q = month && year ? `&month=${month}&year=${year}` : '';
      return apiFetch<
        Array<{
          id: string;
          employeeId: string;
          date: string;
          hours: number;
          isHoliday: boolean;
          status: 'PENDING' | 'APPROVED' | 'REJECTED';
          employee: {
            id: string;
            fullName: string;
            employeeCode: string;
            baseSalary: number;
            department: { name: string };
            position: { title: string };
          };
        }>
      >(`/attendance/overtime?companyId=${companyId}${q}`);
    },

    createOvertime: (dto: { employeeId: string; date: string; hours: number; isHoliday: boolean }) =>
      apiFetch<any>('/attendance/overtime', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),

    approveOvertime: (id: string) =>
      apiFetch<any>(`/attendance/overtime/${id}/approve`, { method: 'PATCH' }),

    rejectOvertime: (id: string) =>
      apiFetch<any>(`/attendance/overtime/${id}/reject`, { method: 'PATCH' }),

    getMyLogs: (month: number, year: number) =>
      apiFetch<Array<any>>(`/attendance/my-logs?month=${month}&year=${year}`),

    myClock: (status = 'PRESENT', notes?: string) =>
      apiFetch<any>('/attendance/my-clock', {
        method: 'POST',
        body: JSON.stringify({ status, notes }),
      }),

    getMyOvertime: (month?: number, year?: number) => {
      const q = month && year ? `?month=${month}&year=${year}` : '';
      return apiFetch<Array<any>>(`/attendance/my-overtime${q}`);
    },
  },

  leave: {
    getTypes: () =>
      apiFetch<
        Array<{
          id: string;
          name: string;
          defaultQuotaDays: number;
          isPaid: boolean;
          requiresDocument: boolean;
        }>
      >('/leave/types'),

    getBalances: (companyId: string, year?: number) => {
      const q = year ? `&year=${year}` : '';
      return apiFetch<Array<any>>(`/leave/balances?companyId=${companyId}${q}`);
    },

    getMyBalances: (year?: number) => {
      const q = year ? `?year=${year}` : '';
      return apiFetch<Array<any>>(`/leave/my-balances${q}`);
    },

    getRequests: (companyId: string, year?: number) => {
      const q = year ? `&year=${year}` : '';
      return apiFetch<Array<any>>(`/leave/requests?companyId=${companyId}${q}`);
    },

    getMyRequests: (year?: number) => {
      const q = year ? `?year=${year}` : '';
      return apiFetch<Array<any>>(`/leave/my-requests${q}`);
    },

    createRequest: (dto: {
      employeeId?: string;
      leaveTypeId: string;
      startDate: string;
      endDate: string;
      totalDays: number;
      reason: string;
    }) =>
      apiFetch<any>('/leave/requests', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),

    approveRequest: (id: string) =>
      apiFetch<any>(`/leave/requests/${id}/approve`, { method: 'PATCH' }),

    rejectRequest: (id: string) =>
      apiFetch<any>(`/leave/requests/${id}/reject`, { method: 'PATCH' }),
  },

  reports: {
    getExecutiveSummary: (companyId: string, month?: number, year?: number) => {
      const q = new URLSearchParams({ companyId });
      if (month) q.append('month', String(month));
      if (year) q.append('year', String(year));
      return apiFetch<{
        hasData: boolean;
        periodInfo: {
          periodId?: string;
          month: number;
          year: number;
          status: string;
          companyName: string;
          headcount: number;
          lockedAt?: string;
        };
        costs: {
          totalBaseSalary: number;
          totalFixedAllowance: number;
          totalOvertimeAmount: number;
          totalGrossIncome: number;
          totalNetSalary: number;
          totalPph21Amount: number;
          totalBpjsCompany: number;
          totalBpjsEmployee: number;
          totalCompanyCost: number;
        };
        bpjsBreakdown: {
          kesehatanCompany: number;
          kesehatanEmployee: number;
          jhtCompany: number;
          jhtEmployee: number;
          jkkCompany: number;
          jkmCompany: number;
          jpCompany: number;
          jpEmployee: number;
        };
        departmentBreakdown: Array<{
          departmentId: string;
          departmentName: string;
          headcount: number;
          totalGross: number;
          totalNet: number;
          totalOvertimeHours: number;
          totalOvertimeCost: number;
          averageSalary: number;
          costPercentage: number;
        }>;
        attendanceSummary: {
          present: number;
          late: number;
          onLeave: number;
          sick: number;
          absent: number;
          totalLogs: number;
          attendanceRatePercentage: number;
        };
      }>(`/reports/executive-summary?${q.toString()}`);
    },

    getCostTrend: (companyId: string, year?: number) => {
      const q = new URLSearchParams({ companyId });
      if (year) q.append('year', String(year));
      return apiFetch<{
        year: number;
        monthlyTrends: Array<{
          month: number;
          monthName: string;
          status: string;
          headcount: number;
          totalGross: number;
          totalNet: number;
          totalPph21: number;
          totalCompanyCost: number;
        }>;
      }>(`/reports/cost-trend?${q.toString()}`);
    },
  },

  audit: {
    getLogs: (params?: {
      page?: number;
      limit?: number;
      action?: string;
      tableName?: string;
      search?: string;
    }) => {
      const q = new URLSearchParams();
      if (params?.page) q.append('page', String(params.page));
      if (params?.limit) q.append('limit', String(params.limit));
      if (params?.action) q.append('action', params.action);
      if (params?.tableName) q.append('tableName', params.tableName);
      if (params?.search) q.append('search', params.search);
      return apiFetch<{
        data: Array<{
          id: string;
          userId: string;
          tableName: string;
          recordId: string;
          action: 'CREATE' | 'UPDATE' | 'DELETE';
          oldValue?: any;
          newValue?: any;
          ipAddress: string;
          userAgent: string;
          createdAt: string;
          user?: {
            id: string;
            email: string;
            role?: {
              name: string;
              description: string;
            };
          };
        }>;
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(`/audit-logs?${q.toString()}`);
    },

    getStats: () =>
      apiFetch<{
        totalLogs: number;
        distribution: {
          create: number;
          update: number;
          delete: number;
        };
        topEntities: Array<{
          entityName: string;
          count: number;
        }>;
        complianceStatus: {
          iso27001Compliant: boolean;
          uupdpCompliant: boolean;
          encryptionStandard: string;
          auditRetentionDays: number;
        };
      }>('/audit-logs/stats'),
  },

  settings: {
    getCompany: (id: string) =>
      apiFetch<{
        id: string;
        name: string;
        npwp?: string;
        riskClassJkk?: string;
        address?: string;
        _count?: {
          departments: number;
          employees: number;
        };
      }>(`/settings/company/${id}`),

    updateCompany: (
      id: string,
      dto: { name?: string; npwp?: string; riskClassJkk?: string; address?: string },
    ) =>
      apiFetch<any>(`/settings/company/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      }),

    getStatutoryRates: () =>
      apiFetch<any>('/settings/statutory-rates'),

    getUsers: () =>
      apiFetch<
        Array<{
          id: string;
          email: string;
          roleId: string;
          createdAt: string;
          role: {
            id: string;
            name: string;
            description: string;
          };
          employee?: {
            id: string;
            fullName: string;
            employeeCode: string;
            department?: { name: string };
            position?: { title: string };
          };
        }>
      >('/settings/users'),

    getRoles: () =>
      apiFetch<
        Array<{
          id: string;
          name: string;
          description: string;
          _count: { users: number };
          rolePermissions: Array<{
            permission: {
              code: string;
              description: string;
            };
          }>;
        }>
      >('/settings/roles'),

    updateUserRole: (userId: string, roleId: string) =>
      apiFetch<any>(`/settings/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ roleId }),
      }),
  },
};

