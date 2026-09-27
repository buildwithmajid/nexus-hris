export function usePayrollExport() {
  const formatRupiahRaw = (val?: number) => {
    if (val === undefined || val === null) return '0';
    return String(Math.round(Number(val)));
  };

  const downloadCsv = (filename: string, rows: string[][]) => {
    const header = rows[0];
    const body = rows.slice(1);
    const csvContent = [header, ...body]
      .map((row) =>
        row
          .map((cell) => {
            const str = String(cell ?? '');
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(','),
      )
      .join('\r\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportBankTransfer = (periodDetail: any, format = 'BCA') => {
    if (!periodDetail?.period?.payrollDetails?.length) {
      console.warn('Tidak ada data penggajian untuk diekspor.');
      return;
    }
    const period = periodDetail.period;
    const filename = `transfer-payroll-${format.toLowerCase()}-${period.month}-${period.year}.csv`;
    let rows: string[][] = [];

    if (format === 'MANDIRI') {
      rows = [
        ['Beneficiary Account No', 'Beneficiary Name', 'Beneficiary Bank', 'Amount', 'Remark'],
        ...period.payrollDetails.map((item: any) => [
          item.employee?.bankAccountNumber || '',
          item.employee?.fullName || '',
          item.employee?.bankName || 'MANDIRI',
          formatRupiahRaw(item.netSalary),
          `Gaji ${period.month}/${period.year} - ${item.employee?.employeeCode}`,
        ]),
      ];
    } else if (format === 'BNI') {
      rows = [
        ['ACCOUNT_NO', 'BENEFICIARY_NAME', 'BANK_CODE', 'AMOUNT', 'DESCRIPTION'],
        ...period.payrollDetails.map((item: any) => [
          item.employee?.bankAccountNumber || '',
          item.employee?.fullName || '',
          'BNI',
          formatRupiahRaw(item.netSalary),
          `Payroll ${period.month}/${period.year}`,
        ]),
      ];
    } else {
      // Format Standar BCA Payroll Corporate & Universal
      rows = [
        ['No', 'No Rekening', 'Nama Penerima', 'Bank', 'Nominal Transfer', 'Keterangan'],
        ...period.payrollDetails.map((item: any, idx: number) => [
          String(idx + 1),
          item.employee?.bankAccountNumber || '-',
          item.employee?.fullName || '',
          item.employee?.bankName || '-',
          formatRupiahRaw(item.netSalary),
          `Gaji ${period.month}/${period.year} - ${item.employee?.employeeCode}`,
        ]),
      ];
    }

    downloadCsv(filename, rows);
  };

  const exportPph21 = (periodDetail: any) => {
    if (!periodDetail?.period?.payrollDetails?.length) {
      console.warn('Tidak ada data penggajian untuk diekspor.');
      return;
    }
    const period = periodDetail.period;
    const filename = `spt-masa-pph21-ter-${period.month}-${period.year}.csv`;
    const rows: string[][] = [
      [
        'Kode Karyawan',
        'Nama Karyawan',
        'Status PTKP',
        'Penghasilan Bruto (Rp)',
        'BPJS Kes Karyawan (Rp)',
        'BPJS TK Karyawan (Rp)',
        'PPh 21 TER Dipotong (Rp)',
        'Gaji Bersih (Rp)',
        'Periode',
      ],
      ...period.payrollDetails.map((item: any) => [
        item.employee?.employeeCode || '',
        item.employee?.fullName || '',
        item.employee?.maritalStatusPtkp || '',
        formatRupiahRaw(item.grossIncome),
        formatRupiahRaw(item.bpjsKesehatanEmployee),
        formatRupiahRaw(item.bpjsTkEmployee),
        formatRupiahRaw(item.pph21Amount),
        formatRupiahRaw(item.netSalary),
        `${period.month}/${period.year}`,
      ]),
    ];
    downloadCsv(filename, rows);
  };

  return {
    exportBankTransfer,
    exportPph21,
  };
}
