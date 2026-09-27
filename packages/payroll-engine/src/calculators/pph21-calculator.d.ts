import { StatusPTKP, TerKategori, TerRateRow, PtkpEntry, Pph21MonthlyResult, Pph21ReconciliationResult } from '../types.js';
export declare function getTerCategory(statusPTKP: StatusPTKP): TerKategori;
export declare function lookupTerRate(kategori: TerKategori, grossIncome: number, terTable: TerRateRow[]): number;
export declare function calculatePph21Monthly(statusPTKP: StatusPTKP, grossIncome: number, terTable: TerRateRow[]): Pph21MonthlyResult;
export declare function calculatePph21Progressive(taxableIncome: number): number;
export declare function getPtkpAmount(statusPTKP: StatusPTKP, ptkpTable: PtkpEntry[]): number;
interface ReconciliationParams {
    statusPTKP: StatusPTKP;
    totalBrutoAnnual: number;
    totalTerDeducted: number;
    iuranPensiunAnnual: number;
    ptkpTable: PtkpEntry[];
    terTable?: TerRateRow[];
}
export declare function reconcileDecemberPph21(params: ReconciliationParams): Pph21ReconciliationResult;
export {};
