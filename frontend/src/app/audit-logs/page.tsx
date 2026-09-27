'use client';

import React from 'react';
import { useAuditLogs } from './hooks/use-audit-logs';
import { AuditHeader } from './components/audit-header';
import { AuditKpi } from './components/audit-kpi';
import { AuditTable } from './components/audit-table';
import { AuditInspectorModal } from './components/audit-inspector-modal';

export default function AuditLogsPage() {
  const {
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
  } = useAuditLogs();

  return (
    <div className="space-y-6">
      <AuditHeader isLoading={isLoading} onRefresh={() => loadLogs()} />

      {errorMessage && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 text-rose-800 text-sm">
          {errorMessage}
        </div>
      )}

      <AuditKpi stats={stats} totalCount={totalCount} />

      <AuditTable
        logs={logs}
        isLoading={isLoading}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        actionFilter={actionFilter}
        tableFilter={tableFilter}
        searchTerm={searchTerm}
        onActionFilterChange={(val) => {
          setActionFilter(val);
          setCurrentPage(1);
        }}
        onTableFilterChange={(val) => {
          setTableFilter(val);
          setCurrentPage(1);
        }}
        onSearchTermChange={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
        onPageChange={setCurrentPage}
        onSelectLog={setSelectedLog}
      />

      <AuditInspectorModal
        selectedLog={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
