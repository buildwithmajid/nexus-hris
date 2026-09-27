import { describe, it, expect } from 'vitest';
import { prorateSalary } from '../calculators/prorate-calculator.js';

describe('Prorate Calculator', () => {
  it('Full bulan (22/22 hari kerja)', () => {
    expect(prorateSalary(8000000, 22, 22)).toBe(8000000);
  });

  it('Mid-month join (15/22)', () => {
    expect(prorateSalary(8000000, 15, 22)).toBe(5454545);
  });

  it('Setengah bulan (11/22)', () => {
    expect(prorateSalary(8000000, 11, 22)).toBe(4000000);
  });

  it('1 hari kerja (1/22)', () => {
    expect(prorateSalary(8000000, 1, 22)).toBe(363636);
  });
});
