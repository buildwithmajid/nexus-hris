'use client';

import React from 'react';
import { Plus, Download, Upload } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useEmployeeList } from './hooks/use-employee-list';
import { EmployeeTable } from './components/employee-table';
import { EmployeeFilters } from './components/employee-filters';
import { EmployeeDetailDrawer } from './components/employee-detail-drawer';
import { EmployeeCreateModal } from './components/employee-create-modal';
import { EmployeeImportModal } from './components/employee-import-modal';

export default function EmployeesPage() {
  const { hasPermission } = useAuth();
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const {
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
    formData,
    setLimit,
    setSearch,
    setSelectedDept,
    setSelectedPtkp,
    setPage,
    setIsModalOpen,
    loadData,
    handleDepartmentChange,
    handleCreateEmployee,
    handleOpenDetail,
    formatRupiah,
    getTerBadge,
    resetFilters,
    updateFormData,
    setSelectedEmployee,
  } = useEmployeeList();

  const handleExportCsv = () => {
    if (!employees || employees.length === 0) return;

    const headers = ['Kode Karyawan', 'Nama Lengkap', 'Departemen', 'Jabatan', 'Status PTKP', 'Kategori TER', 'Tipe Kontrak', 'Tanggal Bergabung'];
    const rows = employees.map((emp) => [
      `"${emp.employeeCode || ''}"`,
      `"${emp.fullName || ''}"`,
      `"${emp.department?.name || ''}"`,
      `"${emp.position?.title || ''}"`,
      `"${emp.maritalStatusPtkp || ''}"`,
      `"${getTerBadge(emp.maritalStatusPtkp).text}"`,
      `"${emp.contractType || ''}"`,
      `"${emp.joinDate ? emp.joinDate.split('T')[0] : ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `master_karyawan_nexus_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-subtle-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-charcoal tracking-tight">
              Manajemen Data Karyawan
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold text-xs border border-teal-200">
              {meta.total} Terdaftar
            </span>
          </div>
          <p className="text-xs text-steel mt-0.5">
            Daftar master karyawan, data kepesertaan statuter, dan upah terenkripsi AES-256-GCM.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Ekspor CSV */}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>

          {/* Tombol Impor Massal */}
          {hasPermission('employee.create') && (
            <button
              onClick={() => setIsImportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-teal" />
              <span>Impor Excel</span>
            </button>
          )}

          {/* Tombol Tambah Karyawan */}
          {hasPermission('employee.create') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Karyawan</span>
            </button>
          )}
        </div>
      </div>

      <EmployeeFilters
        search={search}
        selectedDept={selectedDept}
        selectedPtkp={selectedPtkp}
        departments={departments}
        limit={limit}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onDeptChange={(val) => {
          setSelectedDept(val);
          setPage(1);
        }}
        onPtkpChange={(val) => {
          setSelectedPtkp(val);
          setPage(1);
        }}
        onLimitChange={(val) => {
          setLimit(val);
          setPage(1);
        }}
        onResetFilters={resetFilters}
      />

      <EmployeeTable
        employees={employees}
        isLoading={isLoading}
        page={page}
        totalPages={meta.totalPages}
        total={meta.total}
        onPageChange={setPage}
        onRowClick={handleOpenDetail}
        formatRupiah={formatRupiah}
        getTerBadge={getTerBadge}
      />

      <EmployeeDetailDrawer
        employee={selectedEmployee}
        isLoading={false}
        onClose={() => setSelectedEmployee(null)}
        formatRupiah={formatRupiah}
        getTerBadge={getTerBadge}
      />

      <EmployeeCreateModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        formData={formData}
        departments={departments}
        positions={positions}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateEmployee}
        onDepartmentChange={handleDepartmentChange}
        onFormDataChange={updateFormData}
      />

      <EmployeeImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
