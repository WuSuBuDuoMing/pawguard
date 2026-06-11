const { formatMoney, formatMoneyCN, getMonthlyTotal, getCategoryBreakdown, getYearlyTotal, getDailyAverage, getHighestExpense, getAbnormalExpense, estimateYearlyCost } = require('../utils/money-utils');

describe('money-utils', () => {
  describe('formatMoney', () => {
    test('formats positive amount', () => {
      expect(formatMoney(1234.5)).toBe('¥1,234.50');
    });
    test('formats zero', () => {
      expect(formatMoney(0)).toBe('¥0.00');
    });
    test('formats negative', () => {
      expect(formatMoney(-99.9)).toBe('-¥99.90');
    });
    test('handles NaN', () => {
      expect(formatMoney(NaN)).toBe('¥0.00');
    });
  });

  describe('formatMoneyCN', () => {
    test('formats Chinese format', () => {
      expect(formatMoneyCN(1234.5)).toBe('1234.50元');
    });
  });

  describe('getMonthlyTotal', () => {
    test('sums records for given month', () => {
      const records = [
        { amount: 100, date: '2026-06-01' },
        { amount: 200, date: '2026-06-15' },
        { amount: 300, date: '2026-07-01' },
      ];
      expect(getMonthlyTotal(records, 2026, 6)).toBe(300);
    });
    test('returns 0 for empty', () => {
      expect(getMonthlyTotal([], 2026, 6)).toBe(0);
    });
  });

  describe('getCategoryBreakdown', () => {
    test('groups by category', () => {
      const records = [
        { amount: 100, date: '2026-06-01', category: '食物' },
        { amount: 200, date: '2026-06-02', category: '医疗' },
        { amount: 150, date: '2026-06-03', category: '食物' },
      ];
      const result = getCategoryBreakdown(records, 2026, 6);
      expect(result.length).toBe(2);
      expect(result[0].category).toBe('食物');
      expect(result[0].amount).toBe(250);
    });
  });

  describe('getYearlyTotal', () => {
    test('sums records for given year', () => {
      const records = [
        { amount: 100, date: '2026-01-01' },
        { amount: 200, date: '2026-06-01' },
        { amount: 300, date: '2025-06-01' },
      ];
      expect(getYearlyTotal(records, 2026)).toBe(300);
    });
  });

  describe('getDailyAverage', () => {
    test('calculates daily average', () => {
      const records = [
        { amount: 300, date: '2026-06-01' },
        { amount: 300, date: '2026-06-15' },
      ];
      const avg = getDailyAverage(records, 2026, 6);
      expect(avg).toBe(20);
    });
  });

  describe('getHighestExpense', () => {
    test('finds highest', () => {
      const records = [
        { amount: 100, date: '2026-06-01' },
        { amount: 500, date: '2026-06-02' },
        { amount: 200, date: '2026-06-03' },
      ];
      expect(getHighestExpense(records).amount).toBe(500);
    });
    test('returns null for empty', () => {
      expect(getHighestExpense([])).toBeNull();
    });
  });

  describe('getAbnormalExpense', () => {
    test('finds above threshold', () => {
      const records = [
        { amount: 100 },
        { amount: 600 },
        { amount: 200 },
      ];
      expect(getAbnormalExpense(records, 500).length).toBe(1);
    });
  });

  describe('estimateYearlyCost', () => {
    test('projects yearly cost', () => {
      const records = [
        { amount: 300, date: '2026-01-01' },
        { amount: 300, date: '2026-02-01' },
      ];
      const result = estimateYearlyCost(records, 2026);
      expect(result.total).toBe(600);
      expect(result.projection).toBeGreaterThan(0);
    });
    test('returns zeros for empty', () => {
      const result = estimateYearlyCost([], 2026);
      expect(result.total).toBe(0);
    });
  });
});
