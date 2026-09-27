import { describe, it, expect } from 'vitest';
import { calculateOvertime } from '../calculators/overtime-calculator.js';

describe('Overtime Calculator', () => {
  it('Lembur 1 jam hari kerja biasa', () => {
    const result = calculateOvertime(8000000, [{ date: '2026-09-01', hours: 1, isHoliday: false }]);
    expect(result.total).toBe(Math.round(1 * 1.5 * (8000000 / 173))); // 69364
  });

  it('Lembur 5 jam hari kerja biasa', () => {
    const result = calculateOvertime(8000000, [{ date: '2026-09-01', hours: 5, isHoliday: false }]);
    expect(result.total).toBe(Math.round((1 * 1.5 + 4 * 2) * (8000000 / 173))); // 439306
  });

  it('Lembur 8 jam hari libur', () => {
    const result = calculateOvertime(8000000, [{ date: '2026-09-06', hours: 8, isHoliday: true }]);
    expect(result.total).toBe(Math.round(8 * 2 * (8000000 / 173))); // 739884
  });

  it('Lembur 10 jam hari libur', () => {
    const result = calculateOvertime(8000000, [{ date: '2026-09-06', hours: 10, isHoliday: true }]);
    expect(result.total).toBe(Math.round((8 * 2 + 1 * 3 + 1 * 4) * (8000000 / 173))); // 1063584
  });

  it('Array kosong', () => {
    const result = calculateOvertime(8000000, []);
    expect(result.total).toBe(0);
    expect(result.details.length).toBe(0);
  });

  it('Jam = 0', () => {
    const result = calculateOvertime(8000000, [{ date: '2026-09-01', hours: 0, isHoliday: false }]);
    expect(result.total).toBe(0);
  });

  it('Multiple entries (campuran hari kerja dan libur)', () => {
    const entries = [
      { date: '2026-09-01', hours: 1, isHoliday: false },
      { date: '2026-09-06', hours: 8, isHoliday: true },
    ];
    const result = calculateOvertime(8000000, entries);
    const detail1 = Math.round(1 * 1.5 * (8000000 / 173));
    const detail2 = Math.round(8 * 2 * (8000000 / 173));
    
    expect(result.total).toBe(detail1 + detail2);
    expect(result.details[0].amount).toBe(detail1);
    expect(result.details[1].amount).toBe(detail2);
  });
});
