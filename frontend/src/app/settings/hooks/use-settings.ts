'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DEFAULT_COMPANY } from '@/contexts/auth-context';

export function useSettings() {
  const [activeTab, setActiveTab] = useState<'company' | 'statutory' | 'users'>('company');

  // Company State
  const [companyName, setCompanyName] = useState('');
  const [companyNpwp, setCompanyNpwp] = useState('');
  const [companyRiskClass, setCompanyRiskClass] = useState('I');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyMeta, setCompanyMeta] = useState<any>(null);

  // Statutory Rates State
  const [statutoryRates, setStatutoryRates] = useState<any>(null);

  // Users & Roles State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [rolesList, setRolesList] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [compRes, ratesRes, usersRes, rolesRes] = await Promise.all([
        api.settings.getCompany(DEFAULT_COMPANY.id),
        api.settings.getStatutoryRates(),
        api.settings.getUsers(),
        api.settings.getRoles(),
      ]);

      setCompanyName(compRes.name || '');
      setCompanyNpwp(compRes.npwp || '');
      setCompanyRiskClass(compRes.riskClassJkk || 'I');
      setCompanyAddress(compRes.address || '');
      setCompanyMeta(compRes);

      setStatutoryRates(ratesRes);
      setUsersList(usersRes || []);
      setRolesList(rolesRes || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat data pengaturan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSaving(true);
    try {
      await api.settings.updateCompany(DEFAULT_COMPANY.id, {
        name: companyName.trim(),
        npwp: companyNpwp.trim() || undefined,
        riskClassJkk: companyRiskClass,
        address: companyAddress.trim() || undefined,
      });
      setSuccessMessage('Informasi legalitas perusahaan berhasil diperbarui!');
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan pengaturan perusahaan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRoleId: string) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await api.settings.updateUserRole(userId, newRoleId);
      setSuccessMessage('Hak akses dan peran pengguna berhasil diperbarui!');
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memperbarui peran pengguna');
    }
  };

  return {
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
    statutoryRates,
    usersList,
    rolesList,
    isLoading,
    isSaving,
    successMessage,
    setSuccessMessage,
    errorMessage,
    setErrorMessage,
    loadData,
    handleSaveCompany,
    handleUpdateRole,
  };
}
