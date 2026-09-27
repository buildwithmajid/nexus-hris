'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';

interface Department {
  id: string;
  name: string;
}

interface EmployeeFiltersProps {
  search: string;
  selectedDept: string;
  selectedPtkp: string;
  departments: Department[];
  limit: number;
  onSearchChange: (search: string) => void;
  onDeptChange: (deptId: string) => void;
  onPtkpChange: (ptkp: string) => void;
  onLimitChange: (limit: number) => void;
  onResetFilters: () => void;
}

export function EmployeeFilters({
  search,
  selectedDept,
  selectedPtkp,
  departments,
  limit,
  onSearchChange,
  onDeptChange,
  onPtkpChange,
  onLimitChange,
  onResetFilters,
}: EmployeeFiltersProps) {
  const hasActiveFilters = search || selectedDept || selectedPtkp;

  return (
    <div className="bg-white border border-subtle-border rounded-lg p-3.5 shadow-card space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-steel absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama lengkap atau NIK 16 digit..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-canvas border border-subtle-border rounded text-xs text-charcoal focus:outline-none focus:border-teal"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={selectedDept}
            onChange={(e) => onDeptChange(e.target.value)}
            className="w-full px-3 py-2 bg-canvas border border-subtle-border rounded text-xs text-charcoal focus:outline-none focus:border-teal"
          >
            <option value="">Semua Departemen</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={selectedPtkp}
            onChange={(e) => onPtkpChange(e.target.value)}
            className="w-full px-3 py-2 bg-canvas border border-subtle-border rounded text-xs text-charcoal focus:outline-none focus:border-teal"
          >
            <option value="">Semua PTKP</option>
            <option value="TK/0">TK/0 (TER A)</option>
            <option value="TK/1">TK/1 (TER A)</option>
            <option value="K/0">K/0 (TER A)</option>
            <option value="TK/2">TK/2 (TER B)</option>
            <option value="TK/3">TK/3 (TER B)</option>
            <option value="K/1">K/1 (TER B)</option>
            <option value="K/2">K/2 (TER B)</option>
            <option value="K/3">K/3 (TER C)</option>
          </select>
        </div>

        <div className="md:col-span-2 flex items-center justify-end gap-2">
          <span className="text-[11px] text-steel">Tampilkan:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-2.5 py-1.5 bg-canvas border border-subtle-border rounded text-xs text-charcoal focus:outline-none focus:border-teal"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 pt-1 border-t border-subtle-border text-[11px] text-steel flex-wrap">
          <span>Filter aktif:</span>
          {search && (
            <span className="px-2 py-0.5 bg-slate-100 rounded text-charcoal border border-slate-200">
              Pencarian: "{search}"
            </span>
          )}
          {selectedDept && (
            <span className="px-2 py-0.5 bg-slate-100 rounded text-charcoal border border-slate-200">
              Dept: {departments.find((d) => d.id === selectedDept)?.name}
            </span>
          )}
          {selectedPtkp && (
            <span className="px-2 py-0.5 bg-slate-100 rounded text-charcoal border border-slate-200">
              PTKP: {selectedPtkp}
            </span>
          )}
          <button
            onClick={onResetFilters}
            className="text-teal hover:underline ml-auto font-medium"
          >
            Reset Filter
          </button>
        </div>
      )}
    </div>
  );
}
