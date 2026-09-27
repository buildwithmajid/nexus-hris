'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function useAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Inspector Modal
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const loadLogs = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [logsRes, statsRes] = await Promise.all([
        api.audit.getLogs({
          page: currentPage,
          limit: 15,
          action: actionFilter || undefined,
          tableName: tableFilter || undefined,
          search: searchTerm || undefined,
        }),
        api.audit.getStats(),
      ]);

      setLogs(logsRes.data || []);
      setTotalPages(logsRes.meta.totalPages || 1);
      setTotalCount(logsRes.meta.total || 0);
      setStats(statsRes);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat log audit');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [currentPage, actionFilter, tableFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadLogs();
  };

  return {
    logs,
    stats,
    isLoading,
    errorMessage,
    actionFilter,
    setActionFilter,
    tableFilter,
    setTableFilter,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    selectedLog,
    setSelectedLog,
    loadLogs,
    handleSearchSubmit,
  };
}
