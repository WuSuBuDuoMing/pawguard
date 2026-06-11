const { validatePet, validateHealthRecord, validateExpense, validateDiary, validateInventory, required, maxLength, showErrors } = require('../utils/validators');

describe('validators', () => {
  describe('validatePet', () => {
    test('validates correct pet data', () => {
      const result = validatePet({ name: 'Mochi', species: 'cat', breed: '布偶猫', weight: 4.8 });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    test('rejects empty name', () => {
      const result = validatePet({ name: '', species: 'cat' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('请输入宠物名字');
    });
    test('rejects name over 20 chars', () => {
      const result = validatePet({ name: 'a'.repeat(21), species: 'cat', breed: 'test' });
      expect(result.valid).toBe(false);
    });
    test('rejects invalid species', () => {
      const result = validatePet({ name: 'Pet', species: 'dragon' });
      expect(result.valid).toBe(false);
    });
    test('rejects future birthday', () => {
      const result = validatePet({ name: 'Pet', species: 'cat', breed: 'test', birthday: '2099-01-01' });
      expect(result.valid).toBe(false);
    });
    test('rejects weight out of range', () => {
      const result = validatePet({ name: 'Pet', species: 'cat', breed: 'test', weight: 150 });
      expect(result.valid).toBe(false);
    });
  });

  describe('validateHealthRecord', () => {
    test('validates correct record', () => {
      const result = validateHealthRecord({ title: '疫苗', type: 'vaccine', date: '2026-06-08' });
      expect(result.valid).toBe(true);
    });
    test('rejects empty title', () => {
      const result = validateHealthRecord({ title: '', type: 'vaccine', date: '2026-06-08' });
      expect(result.valid).toBe(false);
    });
    test('rejects nextDate before date', () => {
      const result = validateHealthRecord({ title: 'test', type: 'vaccine', date: '2026-06-08', nextDate: '2026-06-01' });
      expect(result.valid).toBe(false);
    });
  });

  describe('validateExpense', () => {
    test('validates correct expense', () => {
      const result = validateExpense({ title: '猫粮', amount: 428, category: '食物', date: '2026-06-08' });
      expect(result.valid).toBe(true);
    });
    test('rejects zero amount', () => {
      const result = validateExpense({ title: 'test', amount: 0, category: '食物', date: '2026-06-08' });
      expect(result.valid).toBe(false);
    });
    test('rejects amount over 99999', () => {
      const result = validateExpense({ title: 'test', amount: 100000, category: '食物', date: '2026-06-08' });
      expect(result.valid).toBe(false);
    });
  });

  describe('validateDiary', () => {
    test('validates correct diary', () => {
      const result = validateDiary({ title: '今天', content: '开心', date: '2026-06-08' });
      expect(result.valid).toBe(true);
    });
    test('rejects empty content', () => {
      const result = validateDiary({ title: '今天', content: '', date: '2026-06-08' });
      expect(result.valid).toBe(false);
    });
    test('rejects title over 50 chars', () => {
      const result = validateDiary({ title: 'a'.repeat(51), content: 'test', date: '2026-06-08' });
      expect(result.valid).toBe(false);
    });
  });

  describe('validateInventory', () => {
    test('validates correct inventory', () => {
      const result = validateInventory({ name: '猫粮', type: '猫粮', currentStock: 5 });
      expect(result.valid).toBe(true);
    });
    test('rejects negative stock', () => {
      const result = validateInventory({ name: 'test', type: '猫粮', currentStock: -1 });
      expect(result.valid).toBe(false);
    });
  });

  describe('required / maxLength', () => {
    test('required returns error for empty', () => {
      expect(required('', '名称')).toBeTruthy();
      expect(required(null, '名称')).toBeTruthy();
      expect(required('ok', '名称')).toBeNull();
    });
    test('maxLength returns error for too long', () => {
      expect(maxLength('abcdef', 3, '名称')).toBeTruthy();
      expect(maxLength('ab', 3, '名称')).toBeNull();
    });
  });
});
