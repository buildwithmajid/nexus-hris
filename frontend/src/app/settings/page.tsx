'use client';

import React from 'react';
import {
  Settings,
  Building2,
  Scale,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useSettings } from './hooks/use-settings';
import { CompanyTab } from './components/company-tab';
import { StatutoryRatesTab } from './components/statutory-rates-tab';
import { UsersRolesTab } from './components/users-roles-tab';

export default function SettingsPage() {
  const {
    activeTab,
    setActiveTab,
    companyName,
    setCompanyName,
    companyNpwp,
    setCompanyNpwp,
    companyRiskClass,
    setCompanyRiskClass,
    companyAddress,
    setCompanyAddress,
    companyMeta,
    usersList,
    rolesList,
    isSaving,
    successMessage,
    setSuccessMessage,
    errorMessage,
    setErrorMessage,
    handleSaveCompany,
    handleUpdateRole,
  } = useSettings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Settings className="h-7 w-7 text-indigo-600" />
            Pengaturan & Konfigurasi Sistem
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola legalitas entitas perusahaan, parameter statuter BPJS & Pajak, serta otorisasi hak akses pengguna.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-center justify-between text-emerald-800 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-emerald-700 hover:text-emerald-900 font-medium text-xs ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 flex items-center justify-between text-rose-800 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-rose-700 hover:text-rose-900 font-medium text-xs ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('company')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 transition ${
              activeTab === 'company'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Profil & Legalitas Perusahaan
          </button>

          <button
            onClick={() => setActiveTab('statutory')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 transition ${
              activeTab === 'statutory'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Scale className="h-4 w-4" />
            Parameter Statuter & Regulasi
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 transition ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-4 w-4" />
            Pengguna & Otorisasi Akses ({usersList.length})
          </button>
        </nav>
      </div>

      {/* Tab Contents */}
      {activeTab === 'company' && (
        <CompanyTab
          companyName={companyName}
          setCompanyName={setCompanyName}
          companyNpwp={companyNpwp}
          setCompanyNpwp={setCompanyNpwp}
          companyRiskClass={companyRiskClass}
          setCompanyRiskClass={setCompanyRiskClass}
          companyAddress={companyAddress}
          setCompanyAddress={setCompanyAddress}
          companyMeta={companyMeta}
          isSaving={isSaving}
          onSave={handleSaveCompany}
        />
      )}

      {activeTab === 'statutory' && <StatutoryRatesTab />}

      {activeTab === 'users' && (
        <UsersRolesTab
          usersList={usersList}
          rolesList={rolesList}
          onUpdateRole={handleUpdateRole}
        />
      )}
    </div>
  );
}
