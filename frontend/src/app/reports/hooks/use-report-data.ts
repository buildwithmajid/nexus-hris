import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DEFAULT_COMPANY } from '@/lib/auth-context';

export function useReportData(selectedMonth: number, selectedYear: number) {
  const [summaryData, setSummaryData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadReportData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [sumRes, trendRes] = await Promise.all([
        api.reports.getExecutiveSummary(DEFAULT_COMPANY.id, selectedMonth, selectedYear),
        api.reports.getCostTrend(DEFAULT_COMPANY.id, selectedYear),
      ]);
      setSummaryData(sumRes);
      setTrendData(trendRes);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat data laporan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [selectedMonth, selectedYear]);

  return {
    summaryData,
    trendData,
    isLoading,
    errorMessage,
    loadReportData,
  };
}
