import { BpjsKesehatanRates, BpjsKetenagakerjaanRates, BpjsKesehatanResult, BpjsKetenagakerjaanResult } from '../types.js';

/**
 * Menghitung potongan BPJS Kesehatan
 */
export function calculateBpjsKesehatan(
  grossIncome: number,
  rates: BpjsKesehatanRates
): BpjsKesehatanResult {
  const baseAmount = Math.min(grossIncome, rates.wageCap);
  
  return {
    company: Math.round(baseAmount * rates.companyPercent),
    employee: Math.round(baseAmount * rates.employeePercent)
  };
}

/**
 * Menghitung potongan BPJS Ketenagakerjaan (Jamsostek)
 */
export function calculateBpjsKetenagakerjaan(
  grossIncome: number,
  rates: BpjsKetenagakerjaanRates
): BpjsKetenagakerjaanResult {
  // JHT tidak ada batas atas
  const jhtCompany = Math.round(grossIncome * rates.jht.companyPercent);
  const jhtEmployee = Math.round(grossIncome * rates.jht.employeePercent);
  
  // JKK dan JKM sepenuhnya ditanggung perusahaan, tidak ada batas atas
  const jkkCompany = Math.round(grossIncome * rates.jkk.companyPercent);
  const jkmCompany = Math.round(grossIncome * rates.jkm.companyPercent);
  
  // JP ada batas atas
  const jpBaseAmount = Math.min(grossIncome, rates.jp.wageCap);
  const jpCompany = Math.round(jpBaseAmount * rates.jp.companyPercent);
  const jpEmployee = Math.round(jpBaseAmount * rates.jp.employeePercent);
  
  const totalCompany = jhtCompany + jkkCompany + jkmCompany + jpCompany;
  const totalEmployee = jhtEmployee + jpEmployee;
  
  return {
    company: totalCompany,
    employee: totalEmployee,
    breakdown: {
      jhtCompany,
      jhtEmployee,
      jkkCompany,
      jkmCompany,
      jpCompany,
      jpEmployee
    }
  };
}
