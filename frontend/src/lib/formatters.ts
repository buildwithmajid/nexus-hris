/**
 * Shared utility functions for formatting currencies, dates, and numbers.
 */

export function formatRupiah(val?: number | null): string {
  if (val === undefined || val === null || isNaN(val)) return 'Rp 0';
  return `Rp ${new Intl.NumberFormat('id-ID').format(val)}`;
}

export function maskNik(nik?: string | null): string {
  if (!nik || nik.length < 8) return nik || '-';
  return `${nik.slice(0, 4)}********${nik.slice(-4)}`;
}

export function formatDateIndo(dateStr?: string | Date | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
