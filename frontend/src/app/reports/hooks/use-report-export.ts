const monthNames = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function useReportExport() {
  const exportCsv = (summaryData: any, selectedMonth: number, selectedYear: number) => {
    if (!summaryData) return;

    const costs = summaryData.costs || {};
    const bpjs = summaryData.bpjsBreakdown || {};

    const rows = [
      ['LAPORAN EKSEKUTIF PENGGAJIAN & KETENAGAKERJAAN'],
      ['Perusahaan', summaryData.periodInfo?.companyName || 'PT Nusantara Digital Solusi'],
      ['Periode', `${monthNames[selectedMonth - 1]} ${selectedYear}`],
      ['Jumlah Karyawan', summaryData.periodInfo?.headcount || 0],
      ['Tanggal Cetak', new Date().toLocaleString('id-ID')],
      [],
      ['KOMPONEN BEBAN', 'JUMLAH (IDR)'],
      ['Gaji Pokok', costs.totalBaseSalary || 0],
      ['Tunjangan Tetap', costs.totalFixedAllowance || 0],
      ['Upah Lembur', costs.totalOvertimeAmount || 0],
      ['TOTAL PENGHASILAN BRUTO', costs.totalGrossIncome || 0],
      ['BPJS Ditanggung Perusahaan', costs.totalBpjsCompany || 0],
      ['TOTAL BIAYA KETENAGAKERJAAN (COMPANY COST)', costs.totalCompanyCost || 0],
      [],
      ['POTONGAN KARYAWAN & NEGARA', 'JUMLAH (IDR)'],
      ['PPh 21 TER Disetor ke Kas Negara', costs.totalPph21Amount || 0],
      ['Iuran BPJS Karyawan', costs.totalBpjsEmployee || 0],
      ['TOTAL GAJI BERSIH DITERIMA (TAKE HOME PAY)', costs.totalNetSalary || 0],
      [],
      ['DETAIL IURAN BPJS', 'PORSI PERUSAHAAN', 'PORSI KARYAWAN', 'TOTAL IURAN'],
      [
        'BPJS Kesehatan',
        bpjs.kesehatanCompany || 0,
        bpjs.kesehatanEmployee || 0,
        (bpjs.kesehatanCompany || 0) + (bpjs.kesehatanEmployee || 0),
      ],
      [
        'BPJS TK - JHT (Jaminan Hari Tua)',
        bpjs.jhtCompany || 0,
        bpjs.jhtEmployee || 0,
        (bpjs.jhtCompany || 0) + (bpjs.jhtEmployee || 0),
      ],
      ['BPJS TK - JKK (Kecelakaan Kerja)', bpjs.jkkCompany || 0, 0, bpjs.jkkCompany || 0],
      ['BPJS TK - JKM (Kematian)', bpjs.jkmCompany || 0, 0, bpjs.jkmCompany || 0],
      [
        'BPJS TK - JP (Jaminan Pensiun)',
        bpjs.jpCompany || 0,
        bpjs.jpEmployee || 0,
        (bpjs.jpCompany || 0) + (bpjs.jpEmployee || 0),
      ],
    ];

    const csvContent =
      '\uFEFF' +
      rows
        .map((r) =>
          r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','),
        )
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Laporan_Eksekutif_${monthNames[selectedMonth - 1]}_${selectedYear}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  return {
    exportCsv,
    printReport,
  };
}
