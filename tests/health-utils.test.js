const { isVaccineDue, isDewormingDue, getHealthStatus, getNextHealthReminder, getHealthSummary, daysUntilVaccine, formatHealthType } = require('../utils/health-utils');
const { HEALTH_TYPES } = require('../utils/constants');

describe('health-utils', () => {
  describe('isVaccineDue', () => {
    test('returns true when within 30 days', () => {
      const future = new Date();
      future.setDate(future.getDate() + 15);
      expect(isVaccineDue(future.toISOString().split('T')[0])).toBe(true);
    });
    test('returns false when far in future', () => {
      const future = new Date();
      future.setDate(future.getDate() + 60);
      expect(isVaccineDue(future.toISOString().split('T')[0])).toBe(false);
    });
    test('returns false for null', () => {
      expect(isVaccineDue(null)).toBe(false);
    });
    test('returns false for past dates', () => {
      expect(isVaccineDue('2020-01-01')).toBe(false);
    });
  });

  describe('isDewormingDue', () => {
    test('returns true when within 7 days', () => {
      const future = new Date();
      future.setDate(future.getDate() + 3);
      expect(isDewormingDue(future.toISOString().split('T')[0])).toBe(true);
    });
    test('returns false when beyond 7 days', () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      expect(isDewormingDue(future.toISOString().split('T')[0])).toBe(false);
    });
  });

  describe('getHealthStatus', () => {
    test('returns normal for empty records', () => {
      expect(getHealthStatus([])).toBe('normal');
    });
    test('returns urgent for recent abnormal', () => {
      const today = new Date().toISOString().split('T')[0];
      const records = [{ type: HEALTH_TYPES.ABNORMAL, date: today }];
      expect(getHealthStatus(records)).toBe('urgent');
    });
    test('returns urgent for overdue vaccine', () => {
      const records = [{ type: HEALTH_TYPES.VACCINE, nextDate: '2020-01-01' }];
      expect(getHealthStatus(records)).toBe('urgent');
    });
    test('returns attention for soon-due vaccine', () => {
      const soon = new Date();
      soon.setDate(soon.getDate() + 10);
      const records = [{ type: HEALTH_TYPES.VACCINE, nextDate: soon.toISOString().split('T')[0] }];
      expect(getHealthStatus(records)).toBe('attention');
    });
  });

  describe('getHealthSummary', () => {
    test('counts by type', () => {
      const records = [
        { type: HEALTH_TYPES.VACCINE },
        { type: HEALTH_TYPES.VACCINE },
        { type: HEALTH_TYPES.DEWORMING },
        { type: HEALTH_TYPES.VISIT },
      ];
      const summary = getHealthSummary(records);
      expect(summary.vaccines).toBe(2);
      expect(summary.dewormings).toBe(1);
      expect(summary.visits).toBe(1);
    });
    test('returns zeros for empty', () => {
      const summary = getHealthSummary([]);
      expect(summary.total).toBe(0);
    });
  });

  describe('getNextHealthReminder', () => {
    test('returns nearest upcoming reminder', () => {
      const soon = new Date();
      soon.setDate(soon.getDate() + 5);
      const later = new Date();
      later.setDate(later.getDate() + 20);
      const records = [
        { type: HEALTH_TYPES.VACCINE, nextDate: later.toISOString().split('T')[0], name: 'later' },
        { type: HEALTH_TYPES.DEWORMING, nextDate: soon.toISOString().split('T')[0], name: 'soon' },
      ];
      const reminder = getNextHealthReminder(records);
      expect(reminder).toBeTruthy();
      expect(reminder.daysLeft).toBeLessThanOrEqual(5);
    });
    test('returns null for empty', () => {
      expect(getNextHealthReminder([])).toBeNull();
    });
  });

  describe('daysUntilVaccine', () => {
    test('returns overdue status', () => {
      const result = daysUntilVaccine('2020-01-01');
      expect(result.status).toBe('已过期');
      expect(result.color).toBe('#FF4D4F');
    });
    test('returns normal for far future', () => {
      const future = new Date();
      future.setDate(future.getDate() + 90);
      const result = daysUntilVaccine(future.toISOString().split('T')[0]);
      expect(result.status).toBe('正常');
      expect(result.color).toBe('#52C41A');
    });
  });

  describe('formatHealthType', () => {
    test('maps types to Chinese', () => {
      expect(formatHealthType(HEALTH_TYPES.VACCINE)).toBe('疫苗');
      expect(formatHealthType(HEALTH_TYPES.DEWORMING)).toBe('驱虫');
      expect(formatHealthType(HEALTH_TYPES.VISIT)).toBe('就诊');
      expect(formatHealthType(HEALTH_TYPES.MEDICATION)).toBe('用药');
      expect(formatHealthType(HEALTH_TYPES.ABNORMAL)).toBe('异常');
    });
    test('returns 其他 for unknown', () => {
      expect(formatHealthType('unknown')).toBe('其他');
    });
  });
});
