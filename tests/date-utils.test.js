const { formatDate, formatDateTime, formatDateCN, getDayOfWeek, getDaysUntil, getRelativeTime, isToday, isThisWeek, isThisMonth, getAgeDisplay, getNextReminderDate, getWeekRange, getMonthRange, getRecentDays, parseDate } = require('../utils/date-utils');

describe('date-utils', () => {
  describe('parseDate', () => {
    test('parses YYYY-MM-DD string', () => {
      const d = parseDate('2026-06-08');
      expect(d).toBeInstanceOf(Date);
      expect(d.getFullYear()).toBe(2026);
    });
    test('returns null for invalid input', () => {
      expect(parseDate(null)).toBeNull();
      expect(parseDate('')).toBeNull();
      expect(parseDate('not-a-date')).toBeNull();
    });
    test('accepts Date objects', () => {
      const now = new Date();
      expect(parseDate(now)).toEqual(now);
    });
  });

  describe('formatDate', () => {
    test('formats default YYYY-MM-DD', () => {
      expect(formatDate('2026-06-08')).toBe('2026-06-08');
    });
    test('formats custom pattern', () => {
      expect(formatDate('2026-06-08', 'YYYY/MM/DD')).toBe('2026/06/08');
    });
    test('returns empty string for invalid', () => {
      expect(formatDate(null)).toBe('');
    });
  });

  describe('formatDateCN', () => {
    test('formats Chinese date', () => {
      expect(formatDateCN('2026-06-08')).toBe('2026年6月8日');
    });
  });

  describe('getDayOfWeek', () => {
    test('returns correct weekday', () => {
      expect(getDayOfWeek('2026-06-08')).toBe('星期一');
    });
  });

  describe('getDaysUntil', () => {
    test('returns 0 for today', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(getDaysUntil(today)).toBe(0);
    });
    test('returns positive for future', () => {
      const future = new Date();
      future.setDate(future.getDate() + 5);
      expect(getDaysUntil(future.toISOString().split('T')[0])).toBe(5);
    });
    test('returns negative for past', () => {
      expect(getDaysUntil('2020-01-01')).toBeLessThan(0);
    });
  });

  describe('isToday', () => {
    test('returns true for today', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(isToday(today)).toBe(true);
    });
    test('returns false for other dates', () => {
      expect(isToday('2020-01-01')).toBe(false);
    });
  });

  describe('isThisWeek', () => {
    test('returns true for today', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(isThisWeek(today)).toBe(true);
    });
  });

  describe('isThisMonth', () => {
    test('returns true for today', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(isThisMonth(today)).toBe(true);
    });
  });

  describe('getAgeDisplay', () => {
    test('returns years and months', () => {
      const recent = new Date();
      recent.setFullYear(recent.getFullYear() - 2);
      recent.setMonth(recent.getMonth() - 3);
      const result = getAgeDisplay(recent.toISOString().split('T')[0]);
      expect(result).toContain('2岁');
    });
    test('returns unknown for null', () => {
      expect(getAgeDisplay(null)).toBe('未知');
    });
  });

  describe('getNextReminderDate', () => {
    test('calculates daily', () => {
      const next = getNextReminderDate('2026-06-08', 'daily');
      expect(next.toISOString().split('T')[0]).toBe('2026-06-09');
    });
    test('calculates weekly', () => {
      const next = getNextReminderDate('2026-06-08', 'weekly');
      expect(next.toISOString().split('T')[0]).toBe('2026-06-15');
    });
    test('returns null for invalid', () => {
      expect(getNextReminderDate(null, 'daily')).toBeNull();
    });
  });

  describe('getWeekRange / getMonthRange', () => {
    test('getWeekRange returns start and end', () => {
      const range = getWeekRange();
      expect(range.start).toBeTruthy();
      expect(range.end).toBeTruthy();
    });
    test('getMonthRange returns start and end', () => {
      const range = getMonthRange();
      expect(range.start).toBeTruthy();
      expect(range.end).toBeTruthy();
    });
  });

  describe('getRecentDays', () => {
    test('returns n days', () => {
      expect(getRecentDays(7).length).toBe(7);
    });
    test('last element is today', () => {
      const today = new Date().toISOString().split('T')[0];
      const days = getRecentDays(3);
      expect(days[days.length - 1]).toBe(today);
    });
  });
});
