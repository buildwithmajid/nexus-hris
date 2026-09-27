'use client';

import React from 'react';
import { Modal, Button } from '@/components/ui';

interface AuditInspectorModalProps {
  selectedLog: any;
  onClose: () => void;
}

export function AuditInspectorModal({
  selectedLog,
  onClose,
}: AuditInspectorModalProps) {
  if (!selectedLog) return null;

  return (
    <Modal
      isOpen={!!selectedLog}
      onClose={onClose}
      title={`Inspeksi Payload Forensik — ${selectedLog.tableName} (${selectedLog.action})`}
      subtitle="Perbandingan state data sebelum dan sesudah mutasi sistem"
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Pengguna</span>
            <span className="font-medium text-gray-800">{selectedLog.user?.email || 'System'}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Alamat IP</span>
            <span className="font-mono text-gray-800">{selectedLog.ipAddress}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Waktu</span>
            <span className="text-gray-800">
              {new Date(selectedLog.createdAt).toLocaleString('id-ID')}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Record ID</span>
            <span className="font-mono text-gray-600 truncate block" title={selectedLog.recordId}>
              {selectedLog.recordId}
            </span>
          </div>
        </div>

        {/* Old Value vs New Value */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Nilai Sebelumnya (oldValue)
            </div>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto font-mono text-[11px] h-52">
              {selectedLog.oldValue
                ? JSON.stringify(selectedLog.oldValue, null, 2)
                : '// Tidak ada data sebelumnya (Entri Baru)'}
            </pre>
          </div>

          <div>
            <div className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Nilai Sesudahnya (newValue)
            </div>
            <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg overflow-x-auto font-mono text-[11px] h-52">
              {selectedLog.newValue
                ? JSON.stringify(selectedLog.newValue, null, 2)
                : '// Tidak ada data pembaruan'}
            </pre>
          </div>
        </div>

        <div>
          <span className="text-gray-500 block font-medium mb-1">User-Agent Klien:</span>
          <div className="p-2 bg-gray-100 rounded text-gray-600 font-mono text-[10px] break-all">
            {selectedLog.userAgent}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 flex justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
          >
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
}
