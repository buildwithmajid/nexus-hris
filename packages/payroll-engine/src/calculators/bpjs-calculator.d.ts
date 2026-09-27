import { BpjsKesehatanRates, BpjsKetenagakerjaanRates, BpjsKesehatanResult, BpjsKetenagakerjaanResult } from '../types.js';
export declare function calculateBpjsKesehatan(grossIncome: number, rates: BpjsKesehatanRates): BpjsKesehatanResult;
export declare function calculateBpjsKetenagakerjaan(grossIncome: number, rates: BpjsKetenagakerjaanRates): BpjsKetenagakerjaanResult;
